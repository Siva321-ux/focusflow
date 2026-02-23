const Task = require('../models/Task');

class TaskRepository {
    async create(data) {
        const task = new Task(data);
        return task.save();
    }

    async findByUser(userId, filters = {}) {
        const query = { userId };
        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.dueBefore) query.dueDate = { ...query.dueDate, $lte: new Date(filters.dueBefore) };
        if (filters.dueAfter) query.dueDate = { ...query.dueDate, $gte: new Date(filters.dueAfter) };

        return Task.find(query).sort({ createdAt: -1 });
    }

    async findById(taskId) {
        return Task.findById(taskId);
    }

    async findByIdAndUser(taskId, userId) {
        return Task.findOne({ _id: taskId, userId });
    }

    async update(taskId, userId, data) {
        return Task.findOneAndUpdate({ _id: taskId, userId }, data, { new: true, runValidators: true });
    }

    async delete(taskId, userId) {
        return Task.findOneAndDelete({ _id: taskId, userId });
    }

    async countCompletedToday(userId) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return Task.countDocuments({
            userId,
            status: 'completed',
            completedAt: { $gte: start, $lte: end },
        });
    }

    async countCompletedInRange(userId, startDate, endDate) {
        return Task.countDocuments({
            userId,
            status: 'completed',
            completedAt: { $gte: startDate, $lte: endDate },
        });
    }
}

module.exports = new TaskRepository();
