require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { helmetConfig, apiLimiter, getCorsOptions } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmetConfig);
app.use(cors(getCorsOptions()));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/', apiLimiter);

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  
  if (dbState === 1) {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API' });
});

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;