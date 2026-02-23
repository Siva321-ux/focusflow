const habitRepository = require('../repositories/HabitRepository');

class HabitService {
    async createHabit(userId, data) {
        return habitRepository.create({ ...data, userId });
    }

    async getHabits(userId) {
        return habitRepository.findByUser(userId);
    }

    async checkIn(userId, habitId) {
        const habit = await habitRepository.findByIdAndUser(habitId, userId);
        if (!habit) {
            const err = new Error('Habit not found');
            err.statusCode = 404;
            throw err;
        }

        const now = new Date();

        // Already checked in today?
        if (habit.completedToday) {
            const err = new Error('Already checked in today for this habit');
            err.statusCode = 400;
            throw err;
        }

        // Streak logic: if last completed was yesterday, continue streak; else reset
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        let newStreak = 1;
        if (habit.lastCompletedDate) {
            const last = new Date(habit.lastCompletedDate);
            last.setHours(0, 0, 0, 0);
            if (last.getTime() === yesterday.getTime()) {
                newStreak = habit.streak + 1;
            }
        }

        const longestStreak = Math.max(habit.longestStreak, newStreak);
        const completedDates = [...habit.completedDates, now];

        return habitRepository.update(habitId, userId, {
            streak: newStreak,
            longestStreak,
            lastCompletedDate: now,
            completedDates,
        });
    }

    async deleteHabit(userId, habitId) {
        const habit = await habitRepository.findByIdAndUser(habitId, userId);
        if (!habit) {
            const err = new Error('Habit not found');
            err.statusCode = 404;
            throw err;
        }
        return habitRepository.delete(habitId, userId);
    }

    async getTotalStreakBonus(userId) {
        return habitRepository.getTotalStreakBonus(userId);
    }
}

module.exports = new HabitService();
