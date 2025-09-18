const express = require('express');
const multer = require('multer');
const supabase = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// Chatbot conversation
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create or get chat session
    let chatSessionId = sessionId;
    if (!chatSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: userId,
          title: message.substring(0, 50) + '...'
        }])
        .select()
        .single();

      if (sessionError) {
        return res.status(500).json({ error: 'Failed to create chat session' });
      }
      chatSessionId = newSession.id;
    }

    // Save user message
    await supabase
      .from('chat_messages')
      .insert([{
        session_id: chatSessionId,
        message,
        sender: 'user'
      }]);

    // Simple AI response (replace with actual AI integration)
    const aiResponse = generateCareerGuidanceResponse(message);

    // Save AI response
    await supabase
      .from('chat_messages')
      .insert([{
        session_id: chatSessionId,
        message: aiResponse,
        sender: 'ai'
      }]);

    res.json({
      sessionId: chatSessionId,
      response: aiResponse
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get chat history
router.get('/chat/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch chat history' });
    }

    res.json({
      session,
      messages
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Career quiz
router.post('/quiz', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Quiz answers are required' });
    }

    // Calculate career recommendations based on answers
    const recommendations = calculateCareerRecommendations(answers);

    // Save assessment
    const { data: assessment, error } = await supabase
      .from('career_assessments')
      .insert([{
        user_id: userId,
        answers,
        recommendations
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to save assessment' });
    }

    res.json({
      assessmentId: assessment.id,
      recommendations
    });
  } catch (error) {
    console.error('Career quiz error:', error);
    res.status(500).json({ error: 'Failed to process career quiz' });
  }
});

// Resume upload and parsing
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    const userId = req.user.id;
    const { originalname, mimetype, size, buffer } = req.file;

    // Parse resume content (simplified - replace with actual parsing logic)
    const parsedContent = parseResumeContent(buffer, mimetype);

    // Save resume
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert([{
        user_id: userId,
        filename: originalname,
        file_type: mimetype,
        file_size: size,
        parsed_content: parsedContent
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to save resume' });
    }

    res.json({
      resumeId: resume.id,
      parsedContent,
      message: 'Resume uploaded and parsed successfully'
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

// Get user's career assessments
router.get('/assessments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: assessments, error } = await supabase
      .from('career_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch assessments' });
    }

    res.json({ assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions (replace with actual AI/ML implementations)
function generateCareerGuidanceResponse(message) {
  const responses = [
    "That's a great question about your career! Based on your interests, I'd recommend exploring roles in technology, healthcare, or creative industries.",
    "Career development is a journey. Consider your strengths, interests, and values when making decisions.",
    "Have you thought about what skills you'd like to develop? This can help guide your career path.",
    "Networking and continuous learning are key to career success. What areas interest you most?",
    "Consider taking our career assessment quiz to get personalized recommendations!"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function calculateCareerRecommendations(answers) {
  // Simplified recommendation logic
  const careers = [
    { title: "Software Developer", match: 85, description: "Build applications and systems" },
    { title: "Data Scientist", match: 78, description: "Analyze data to drive decisions" },
    { title: "UX Designer", match: 72, description: "Design user-friendly interfaces" },
    { title: "Project Manager", match: 68, description: "Lead teams and manage projects" },
    { title: "Marketing Specialist", match: 65, description: "Promote products and services" }
  ];
  
  return careers.slice(0, 3); // Return top 3 recommendations
}

function parseResumeContent(buffer, mimetype) {
  // Simplified parsing - replace with actual PDF/Word parsing
  return {
    skills: ["JavaScript", "React", "Node.js", "Python"],
    experience: ["Software Developer at Tech Corp (2020-2023)", "Intern at StartupXYZ (2019-2020)"],
    education: ["Bachelor's in Computer Science - University ABC (2019)"],
    summary: "Experienced software developer with expertise in web technologies"
  };
}

module.exports = router;