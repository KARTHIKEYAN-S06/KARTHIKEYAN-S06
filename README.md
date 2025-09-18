# AI Career Guidance System - Backend

A comprehensive Node.js/Express backend for the AI Career Guidance System with authentication, career assessment, chatbot functionality, and resume parsing.

## Features

- **Authentication System**: JWT-based auth with bcrypt password hashing
- **User Management**: User registration, login, profile management
- **Admin Panel**: Admin dashboard with user management capabilities
- **Career Chatbot**: AI-powered career guidance conversations
- **Career Assessment**: Personality-based career recommendations
- **Resume Parser**: Upload and parse PDF/Word documents
- **Database Integration**: Supabase PostgreSQL with Row Level Security

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Environment**: dotenv

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - User logout

### User Routes
- `GET /api/user/dashboard` - Get user dashboard data
- `PUT /api/user/profile` - Update user profile

### Admin Routes
- `GET /api/admin/dashboard` - Get admin statistics
- `GET /api/admin/users` - Get all users (paginated)
- `PUT /api/admin/users/:userId/role` - Update user role
- `DELETE /api/admin/users/:userId` - Delete user

### Career Routes
- `POST /api/career/chat` - Send message to career chatbot
- `GET /api/career/chat/:sessionId` - Get chat history
- `POST /api/career/quiz` - Submit career assessment
- `POST /api/career/resume` - Upload and parse resume
- `GET /api/career/assessments` - Get user's assessments

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update with your actual Supabase credentials
   - Set a secure JWT secret

3. **Database Setup**
   - Create a Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Update environment variables with your Supabase URL and keys

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Production Start**
   ```bash
   npm start
   ```

## Environment Variables

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=your_openai_key (optional)
```

## Database Schema

The system uses the following main tables:
- `users` - User accounts and profiles
- `chat_sessions` - Chatbot conversation sessions
- `chat_messages` - Individual chat messages
- `career_assessments` - Career quiz results and recommendations
- `resumes` - Uploaded resume files and parsed content

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Row Level Security (RLS) policies
- Input validation and sanitization
- File upload restrictions
- CORS configuration

## API Response Format

All API responses follow a consistent format:

```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if applicable)"
}
```

## File Upload

Resume uploads support:
- PDF files (.pdf)
- Word documents (.doc, .docx)
- Maximum file size: 5MB

## Development

The backend is designed to work seamlessly with the React frontend. Make sure both servers are running:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## Future Enhancements

- OpenAI integration for advanced AI responses
- Real-time chat with WebSocket support
- Advanced resume parsing with ML
- Email notifications
- File storage with Supabase Storage
- Rate limiting and API throttling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.