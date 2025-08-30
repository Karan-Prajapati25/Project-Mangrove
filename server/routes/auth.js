import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { generateJWT } from '../middleware/auth.js';

const router = express.Router();

// User signup
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('display_name').trim().notEmpty(),
  body('country').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, display_name, country } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/confirm`,
        data: {
          display_name,
          country
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (authData.user) {
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: authData.user.id,
            display_name,
            country,
            points: 0,
            rank: null
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Create coins record
      const { error: coinsError } = await supabase
        .from('coins')
        .insert([
          {
            user_id: authData.user.id,
            balance: 100 // Starting coins
          }
        ]);

      if (coinsError) {
        console.error('Coins creation error:', coinsError);
      }

      res.status(201).json({
        message: 'User created successfully. Please check your email to confirm your account.',
        user: {
          id: authData.user.id,
          email: authData.user.email
        }
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User signin
router.post('/signin', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    if (authData.user && authData.session) {
      // Generate JWT token
      const token = generateJWT(authData.user);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      res.json({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          profile
        },
        token,
        session: authData.session
      });
    }
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Get user from Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ user, profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', [
  body('display_name').optional().trim().notEmpty(),
  body('country').optional().trim().notEmpty(),
  body('avatar_url').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Get user from Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { display_name, country, avatar_url } = req.body;

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name,
        country,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await supabase.auth.signOut();
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
