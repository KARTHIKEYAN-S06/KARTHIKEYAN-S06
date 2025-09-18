const express = require('express');
const supabase = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's career assessments count
    const { count: assessmentsCount } = await supabase
      .from('career_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get user's chat sessions count
    const { count: chatSessionsCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get user's resume uploads count
    const { count: resumesCount } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        created_at: req.user.created_at
      },
      stats: {
        assessments: assessmentsCount || 0,
        chatSessions: chatSessionsCount || 0,
        resumes: resumesCount || 0
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    // Check if username/email is already taken by another user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .neq('id', userId)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already taken' });
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ username, email, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;