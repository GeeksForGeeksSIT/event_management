import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import adminRouter from './routes/admin.js';
import usersRouter from './routes/users.js';
import eventRouter from './routes/events.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to GFG Event Management API',
    status: 'Server is running',
    version: '1.0.0',
    endpoints: {
      root: '/',
      admin: '/admin/onboard',
      events: '/events',
      health: '/health',
      users: '/users/register, /users/login, /users/:userId',
      admin: '/admin/onboard',
    },
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// Routes
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/events', eventRouter);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler (MUST be last)
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});