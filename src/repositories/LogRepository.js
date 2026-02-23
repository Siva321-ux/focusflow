const ProductivityLog = require('../models/ProductivityLog');

class LogRepository {
    // Upsert a log entry for a given date
    async upsert(userId, date, data) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        return ProductivityLog.findOneAndUpdate(
            { userId, date: dayStart },
            { ...data, userId, date: dayStart },
            { upsert: true, new: true, runValidators: true }
        );
    }

    async findByUserAndDate(userId, date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        return ProductivityLog.findOne({ userId, date: dayStart });
    }

    async findByUserInRange(userId, startDate, endDate) {
        return ProductivityLog.find({
            userId,
            date: { $gte: startDate, $lte: endDate },
        }).sort({ date: 1 });
    }

    async getWeeklySummary(userId) {
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const logs = await this.findByUserInRange(userId, startDate, endDate);
        return logs;
    }
}

module.exports = new LogRepository();
