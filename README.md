# Team Task Manager

A full-stack collaborative web application built with the MERN stack (MongoDB, Express, React, Node.js) that enables multiple users to manage tasks efficiently within teams.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Project Management**: Create projects, add/remove team members with role-based access (Admin/Member)
- **Task Management**: Create, assign, and track tasks with status updates (To Do, In Progress, Done)
- **Dashboard**: View task metrics including total tasks, status breakdown, assignee distribution, and overdue tasks
- **Role-Based Access Control**: Admins can manage projects and tasks, Members can update their assigned tasks

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **express-validator** for input validation
- **CORS** for cross-origin requests

### Frontend
- **React 18+** with **React Router**
- **Axios** for HTTP requests
- **Tailwind CSS** for styling
- **Vite** for build tooling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd team-task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/team-task-manager

# JWT Configuration
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3001
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Running the Application

### Start MongoDB

Make sure MongoDB is running locally or you have a connection to MongoDB Atlas.

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend API will run on `http://localhost:3000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3001` (or the port shown in terminal)

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (requires authentication)

### Projects

- `POST /api/projects` - Create a new project (requires authentication)
- `GET /api/projects` - Get all user's projects (requires authentication)
- `POST /api/projects/:projectId/members` - Add member to project (requires admin)
- `DELETE /api/projects/:projectId/members/:userId` - Remove member from project (requires admin)

### Tasks

- `POST /api/tasks` - Create a new task (requires admin)
- `GET /api/tasks` - Get user's assigned tasks (requires authentication)
- `GET /api/tasks?projectId=<id>` - Get project tasks (requires project access)
- `PUT /api/tasks/:taskId/assign` - Assign task to user (requires admin)
- `PUT /api/tasks/:taskId/status` - Update task status (requires admin or assignee)

### Dashboard

- `GET /api/dashboard/metrics` - Get dashboard metrics (requires authentication)

### Health Check

- `GET /api/health` - Check API and database health

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection
```javascript
{
  _id: ObjectId,
  name: String,
  adminId: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  dueDate: Date,
  priority: String (enum: Low, Medium, High),
  status: String (enum: To Do, In Progress, Done),
  projectId: ObjectId (ref: Project),
  assigneeId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

```bash
cd backend
npm test
```

## 📦 Building for Production

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run start
```

## 🚢 Deployment to Railway

### Prerequisites
- GitHub repository
- Railway account

### Steps

1. **Push code to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create Railway Project**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add MongoDB**
   - In Railway dashboard, click "New"
   - Select "Database" → "Add MongoDB"
   - Or use MongoDB Atlas and add connection string to environment variables

4. **Configure Environment Variables**

Backend service:
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
FRONTEND_URL=<your-frontend-url>
```

Frontend service:
```
VITE_API_URL=<your-backend-url>/api
```

5. **Deploy**
   - Railway will automatically deploy on push to main branch
   - Access your app via the generated Railway URL

## 📝 Current Implementation Status

### ✅ Completed (Backend)
- MongoDB connection and configuration
- Mongoose models (User, Project, Task)
- Authentication service with JWT
- Project service with role-based access
- Task service with assignment and status management
- Dashboard service with metrics calculation
- All API routes and endpoints
- Input validation and error handling
- Health check endpoint

### 🚧 To Be Completed (Frontend)
- React application setup
- Authentication UI (Login/Register pages)
- Project management UI
- Task management UI
- Dashboard UI
- API integration with Axios
- State management with Context API
- Routing with React Router
- Responsive design with Tailwind CSS

### 📋 Next Steps

1. **Complete Frontend Implementation** (Tasks 18-25)
   - Set up React project structure
   - Create authentication pages
   - Build project and task management interfaces
   - Implement dashboard with metrics visualization

2. **Add Security Middleware** (Task 15.3)
   - Implement helmet for security headers
   - Add rate limiting
   - Configure CORS properly

3. **Testing** (Optional tasks marked with *)
   - Write unit tests for services
   - Write integration tests for API endpoints
   - Write property-based tests for validation functions

4. **Documentation** (Task 28)
   - Complete API documentation
   - Add deployment guide
   - Create demo video

## 🤝 Contributing

This is a coding assignment project. For production use, consider adding:
- Comprehensive test coverage
- CI/CD pipeline
- Logging and monitoring
- Rate limiting and security hardening
- Email verification
- Password reset functionality
- Real-time updates with WebSockets

## 📄 License

ISC

## 👤 Author

Lawish

---

**Note**: This application was built as part of a full-stack coding assignment. The backend is fully functional and ready for frontend integration.
