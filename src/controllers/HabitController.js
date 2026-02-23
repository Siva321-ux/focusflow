const habitService = require('../services/HabitService');

class HabitController {
    async createHabit(req, res) {
        const habit = await habitService.createHabit(req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Habit created', data: { habit } });
    }

    async getHabits(req, res) {
        const habits = await habitService.getHabits(req.user.id);
        res.status(200).json({ success: true, data: { habits, count: habits.length } });
    }

    async checkIn(req, res) {
        const habit = await habitService.checkIn(req.user.id, req.params.id);
        res.status(200).json({
            success: true,
            message: `Check-in recorded! Current streak: ${habit.streak} 🔥`,
            data: { habit },
        });
    }

    async deleteHabit(req, res) {
        await habitService.deleteHabit(req.user.id, req.params.id);
        res.status(200).json({ success: true, message: 'Habit removed' });
    }
}

module.exports = new HabitController();
