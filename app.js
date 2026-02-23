require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');
const taskRoutes = require('./src/routes/task.routes');
const habitRoutes = require('./src/routes/habit.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const { errorHandler, notFound } = require('./src/middlewares/error.middleware');
const logger = require('./src/utils/logger');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
}));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FocusFlow API is running 🚀',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
