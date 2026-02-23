const logger = require('../utils/logger');

// Global error handler — must have 4 arguments for Express to treat it as error middleware
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    logger.error(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${message}`, {
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

// 404 handler
const notFound = (req, res, next) => {
    const err = new Error(`Route not found: ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
};

module.exports = { errorHandler, notFound };
