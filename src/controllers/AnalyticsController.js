const analyticsService = require('../services/AnalyticsService');

class AnalyticsController {
    async logFocus(req, res) {
        const { focusMinutes } = req.body;
        const log = await analyticsService.logFocusTime(req.user.id, focusMinutes);
        res.status(200).json({ success: true, message: 'Focus time logged', data: { log } });
    }

    async getDaily(req, res) {
        const log = await analyticsService.getDailyLog(req.user.id);
        res.status(200).json({ success: true, data: { log } });
    }

    async getWeekly(req, res) {
        const summary = await analyticsService.getWeeklySummary(req.user.id);
        res.status(200).json({ success: true, data: { summary } });
    }
}

module.exports = new AnalyticsController();
