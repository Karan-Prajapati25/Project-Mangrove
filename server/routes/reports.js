import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all reports (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { status, incident_type, severity, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('reports')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (incident_type) query = query.eq('incident_type', incident_type);
    if (severity) query = query.eq('severity', severity);
    
    // Apply pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: reports, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      reports,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count || reports.length
      }
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: report, error } = await supabase
      .from('reports')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Report fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new report
router.post('/', [
  authenticateToken,
  body('title').trim().notEmpty().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('incident_type').isIn(['Deforestation', 'Pollution', 'Illegal Fishing', 'Climate Impact', 'Other']),
  body('severity').isIn(['Low', 'Medium', 'High', 'Critical']),
  body('location').optional().trim(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('evidence_urls').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      incident_type,
      severity,
      location,
      latitude,
      longitude,
      evidence_urls
    } = req.body;

    // Create report
    const { data: report, error } = await supabase
      .from('reports')
      .insert([
        {
          user_id: req.user.id,
          title,
          description,
          incident_type,
          severity,
          location,
          latitude,
          longitude,
          evidence_urls: evidence_urls || [],
          status: 'Pending'
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Award coins based on severity
    const { data: coinAmount } = await supabase
      .rpc('get_coin_amount_for_severity', { severity_level: severity });

    if (coinAmount > 0) {
      // Update user's coin balance
      await supabase
        .from('coins')
        .update({ 
          balance: supabase.raw(`balance + ${coinAmount}`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.user.id);

      // Update user's points
      await supabase
        .from('profiles')
        .update({ 
          points: supabase.raw(`points + ${coinAmount}`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.user.id);
    }

    res.status(201).json({ 
      report,
      coins_earned: coinAmount || 0
    });
  } catch (error) {
    console.error('Report creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update report
router.put('/:id', [
  authenticateToken,
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['Pending', 'Investigating', 'Resolved', 'Dismissed']),
  body('evidence_urls').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date().toISOString();

    // Check if user owns the report or is admin
    const { data: existingReport, error: fetchError } = await supabase
      .from('reports')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only allow updates if user owns the report or is updating status
    if (existingReport.user_id !== req.user.id && !updateData.status) {
      return res.status(403).json({ error: 'Not authorized to update this report' });
    }

    const { data: report, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ report });
  } catch (error) {
    console.error('Report update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete report
router.delete('/:id', [authenticateToken], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the report
    const { data: existingReport, error: fetchError } = await supabase
      .from('reports')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (existingReport.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this report' });
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Report deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reports by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ reports });
  } catch (error) {
    console.error('User reports fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reports statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { data: totalReports, error: totalError } = await supabase
      .from('reports')
      .select('*', { count: 'exact' });

    const { data: statusStats, error: statusError } = await supabase
      .from('reports')
      .select('status');

    const { data: severityStats, error: severityError } = await supabase
      .from('reports')
      .select('severity');

    const { data: typeStats, error: typeError } = await supabase
      .from('reports')
      .select('incident_type');

    if (totalError || statusError || severityError || typeError) {
      return res.status(400).json({ error: 'Error fetching statistics' });
    }

    // Calculate statistics
    const stats = {
      total: totalReports.length,
      byStatus: statusStats.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: severityStats.reduce((acc, report) => {
        acc[report.severity] = (acc[report.severity] || 0) + 1;
        return acc;
      }, {}),
      byType: typeStats.reduce((acc, report) => {
        acc[report.incident_type] = (acc[report.incident_type] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({ stats });
  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
