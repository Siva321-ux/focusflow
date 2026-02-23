const Habit = require('../models/Habit');

class HabitRepository {
    async create(data) {
        const habit = new Habit(data);
        return habit.save();
    }

    async findByUser(userId) {
        return Habit.find({ userId, isActive: true }).sort({ createdAt: -1 });
    }

    async findByIdAndUser(habitId, userId) {
        return Habit.findOne({ _id: habitId, userId });
    }

    async update(habitId, userId, data) {
        return Habit.findOneAndUpdate({ _id: habitId, userId }, data, { new: true, runValidators: true });
    }

    async delete(habitId, userId) {
        return Habit.findOneAndUpdate({ _id: habitId, userId }, { isActive: false }, { new: true });
    }

    async getTotalStreakBonus(userId) {
        const habits = await Habit.find({ userId, isActive: true });
        return habits.reduce((sum, h) => sum + (h.streak || 0) * 0.5, 0);
    }
}

module.exports = new HabitRepository();
