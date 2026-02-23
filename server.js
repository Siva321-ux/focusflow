const app = require('./app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`FocusFlow API server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});
