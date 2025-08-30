import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has admin role
    const { data: adminRole, error } = await supabase
      .from('admin_roles')
      .select('verification_status')
      .eq('user_id', req.user.id)
      .single();

    if (error || adminRole?.verification_status !== 'Approved') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization error' });
  }
};

export const generateJWT = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
