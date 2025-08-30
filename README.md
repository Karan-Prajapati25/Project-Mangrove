# 🌿 Mangrove Guardian Project

A comprehensive mangrove conservation platform with user authentication, incident reporting, educational content, and administrative tools.

## 🚀 Features

- **User Authentication**: Secure signup/login with email verification
- **Incident Reporting**: Report mangrove-related incidents with location tracking
- **Educational Content**: Courses, quizzes, and guides about mangrove conservation
- **Reward System**: Earn coins and points for contributions
- **Admin Dashboard**: Comprehensive administrative tools and analytics
- **Real-time Updates**: Live data synchronization with Supabase

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + JWT authentication
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT tokens
- **State Management**: React Query + Context API

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Project Mangrove"
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

Update `server/.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in `supabase/migrations/` in order
4. Ensure Row Level Security (RLS) policies are enabled

### 5. Start Development Servers

#### Terminal 1 - Backend
```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend
```bash
# In project root
npm run dev
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Reports
- `GET /api/reports` - List all reports
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/stats/overview` - Get report statistics

### Education
- `GET /api/education/courses` - List courses
- `GET /api/education/quizzes` - List quizzes
- `GET /api/education/guides` - List guides
- `POST /api/education/quizzes/:id/score` - Submit quiz score
- `GET /api/education/progress/courses` - Get course progress

### Admin (Protected)
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats/overview` - System statistics
- `PUT /api/admin/reports/:id/status` - Update report status

## 🔐 Authentication Flow

1. **Signup**: User creates account → Supabase creates user → Backend creates profile
2. **Signin**: User logs in → Supabase authenticates → JWT token generated
3. **API Calls**: Frontend includes JWT token in Authorization header
4. **Token Validation**: Backend validates JWT and Supabase session

## 📱 Frontend Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API service classes
├── config/             # Configuration files
├── integrations/       # External service integrations
└── lib/                # Utility functions
```

## 🗄️ Database Schema

### Core Tables
- `profiles` - User profile information
- `reports` - Incident reports
- `courses` - Educational courses
- `quizzes` - Assessment quizzes
- `guides` - Educational guides
- `coins` - User coin balance
- `achievements` - User achievements
- `admin_roles` - Administrator roles

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd server
npm run build
# Deploy with environment variables
```

## 🔧 Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier configuration
- Component-based architecture
- Custom hooks for business logic

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd server
npm run test
```

## 📊 Monitoring

- Health check endpoint: `/health`
- Request logging middleware
- Error tracking and reporting
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Updates

- **v1.0.0**: Initial release with core functionality
- Authentication system with Supabase
- Incident reporting system
- Educational content management
- Admin dashboard
- Reward system

---

**Built with ❤️ for mangrove conservation**
