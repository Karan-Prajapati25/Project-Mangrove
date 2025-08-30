import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ===== COURSES =====

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const { difficulty, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: courses, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ courses });
  } catch (error) {
    console.error('Courses fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single course by ID
router.get('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Course fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new course (admin only)
router.post('/courses', [
  requireAdmin,
  body('title').trim().notEmpty().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('duration').optional().trim(),
  body('lessons').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, difficulty, duration, lessons } = req.body;

    const { data: course, error } = await supabase
      .from('courses')
      .insert([
        {
          title,
          description,
          difficulty,
          duration,
          lessons: lessons || 1
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ course });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update course (admin only)
router.put('/courses/:id', [
  requireAdmin,
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('duration').optional().trim(),
  body('lessons').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const { data: course, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ course });
  } catch (error) {
    console.error('Course update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete course (admin only)
router.delete('/courses/:id', [requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Course deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== QUIZZES =====

// Get all quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const { difficulty, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: quizzes, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ quizzes });
  } catch (error) {
    console.error('Quizzes fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single quiz by ID
router.get('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ quiz });
  } catch (error) {
    console.error('Quiz fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit quiz score
router.post('/quizzes/:id/score', [
  authenticateToken,
  body('score').isInt({ min: 0 }),
  body('total_questions').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { score, total_questions } = req.body;

    // Save quiz score
    const { data: quizScore, error: scoreError } = await supabase
      .from('user_quiz_scores')
      .insert([
        {
          user_id: req.user.id,
          quiz_id: id,
          score,
          total_questions,
          completed_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (scoreError) {
      return res.status(400).json({ error: scoreError.message });
    }

    // Calculate points based on score percentage
    const percentage = (score / total_questions) * 100;
    let points = 0;

    if (percentage >= 90) points = 50;
    else if (percentage >= 80) points = 40;
    else if (percentage >= 70) points = 30;
    else if (percentage >= 60) points = 20;
    else points = 10;

    // Award coins and points
    if (points > 0) {
      await supabase
        .from('coins')
        .update({ 
          balance: supabase.raw(`balance + ${points}`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.user.id);

      await supabase
        .from('profiles')
        .update({ 
          points: supabase.raw(`points + ${points}`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.user.id);
    }

    res.json({ 
      quizScore,
      points_earned: points,
      percentage: Math.round(percentage)
    });
  } catch (error) {
    console.error('Quiz score submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== GUIDES =====

// Get all guides
router.get('/guides', async (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('guides')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: guides, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ guides });
  } catch (error) {
    console.error('Guides fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single guide by ID
router.get('/guides/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: guide, error } = await supabase
      .from('guides')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json({ guide });
  } catch (error) {
    console.error('Guide fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== USER PROGRESS =====

// Get user's course progress
router.get('/progress/courses', [authenticateToken], async (req, res) => {
  try {
    const { data: progress, error } = await supabase
      .from('user_course_progress')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ progress });
  } catch (error) {
    console.error('Course progress fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update course progress
router.post('/progress/courses/:courseId', [
  authenticateToken,
  body('progress').isInt({ min: 0, max: 100 }),
  body('completed').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.params;
    const { progress, completed } = req.body;

    // Check if progress record exists
    const { data: existingProgress } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('course_id', courseId)
      .single();

    let result;
    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('user_course_progress')
        .update({
          progress,
          completed: completed || false,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('user_course_progress')
        .insert([
          {
            user_id: req.user.id,
            course_id: courseId,
            progress,
            completed: completed || false,
            completed_at: completed ? new Date().toISOString() : null
          }
        ])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Award points for course completion
    if (completed && progress === 100) {
      const points = 100; // Course completion bonus
      
      await supabase
        .from('coins')
        .update({ 
          balance: supabase.raw(`balance + ${points}`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.user.id);

      await supabase
        .from('profiles')
        .update({ 
          points: supabase.raw(`points + ${points}`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.user.id);
    }

    res.json({ progress: result });
  } catch (error) {
    console.error('Course progress update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's quiz scores
router.get('/progress/quizzes', [authenticateToken], async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from('user_quiz_scores')
      .select(`
        *,
        quizzes (*)
      `)
      .eq('user_id', req.user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ scores });
  } catch (error) {
    console.error('Quiz scores fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
