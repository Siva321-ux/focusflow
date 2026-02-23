const logRepository = require('../repositories/LogRepository');
const taskRepository = require('../repositories/TaskRepository');
const habitRepository = require('../repositories/HabitRepository');

class AnalyticsService {
    /**
     * Productivity Score Formula:
     *   score = (tasksCompleted × 2) + (focusMinutes / 30) + habitStreakBonus
     *
     * habitStreakBonus = sum of (streak × 0.5) across all active habits
     */
    _calculateScore(tasksCompleted, focusMinutes, habitStreakBonus) {
        const score =
            tasksCompleted * 2 + focusMinutes / 30 + habitStreakBonus;
        return Math.round(score * 10) / 10; // 1 decimal place
    }

    async logFocusTime(userId, focusMinutes) {
        if (focusMinutes <= 0) {
            const err = new Error('focusMinutes must be a positive number');
            err.statusCode = 400;
            throw err;
        }

        const today = new Date();

        // Get today's completed-task count
        const tasksCompleted = await taskRepository.countCompletedToday(userId);
        // Get total habit streak bonus
        const habitStreakBonus = await habitRepository.getTotalStreakBonus(userId);

        // Fetch existing log to accumulate focus minutes
        const existing = await logRepository.findByUserAndDate(userId, today);
        const accumulatedFocus = (existing ? existing.focusMinutes : 0) + focusMinutes;

        const score = this._calculateScore(tasksCompleted, accumulatedFocus, habitStreakBonus);

        return logRepository.upsert(userId, today, {
            tasksCompleted,
            focusMinutes: accumulatedFocus,
            habitStreakBonus,
            score,
        });
    }

    async getDailyLog(userId) {
        const today = new Date();
        const tasksCompleted = await taskRepository.countCompletedToday(userId);
        const habitStreakBonus = await habitRepository.getTotalStreakBonus(userId);

        let log = await logRepository.findByUserAndDate(userId, today);
        const focusMinutes = log ? log.focusMinutes : 0;
        const score = this._calculateScore(tasksCompleted, focusMinutes, habitStreakBonus);

        // Upsert so daily snapshot is always current
        log = await logRepository.upsert(userId, today, {
            tasksCompleted,
            focusMinutes,
            habitStreakBonus,
            score,
        });

        return log;
    }

    async getWeeklySummary(userId) {
        const logs = await logRepository.getWeeklySummary(userId);

        const totalTasks = logs.reduce((s, l) => s + l.tasksCompleted, 0);
        const totalFocus = logs.reduce((s, l) => s + l.focusMinutes, 0);
        const avgScore =
            logs.length > 0
                ? Math.round((logs.reduce((s, l) => s + l.score, 0) / logs.length) * 10) / 10
                : 0;

        return {
            period: {
                from: logs.length > 0 ? logs[0].date : null,
                to: logs.length > 0 ? logs[logs.length - 1].date : null,
            },
            totalTasksCompleted: totalTasks,
            totalFocusMinutes: totalFocus,
            averageScore: avgScore,
            dailyLogs: logs,
        };
    }
}

module.exports = new AnalyticsService();
