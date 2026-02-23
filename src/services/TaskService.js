const taskRepository = require('../repositories/TaskRepository');

class TaskService {
    async createTask(userId, data) {
        return taskRepository.create({ ...data, userId });
    }

    async getTasks(userId, filters) {
        return taskRepository.findByUser(userId, filters);
    }

    async updateTask(userId, taskId, data) {
        const task = await taskRepository.findByIdAndUser(taskId, userId);
        if (!task) {
            const err = new Error('Task not found');
            err.statusCode = 404;
            throw err;
        }

        // If marking complete, Mongoose pre-save hook sets completedAt
        if (data.status === 'completed' && task.status !== 'completed') {
            data.completedAt = new Date();
        } else if (data.status === 'pending') {
            data.completedAt = null;
        }

        return taskRepository.update(taskId, userId, data);
    }

    async deleteTask(userId, taskId) {
        const task = await taskRepository.findByIdAndUser(taskId, userId);
        if (!task) {
            const err = new Error('Task not found');
            err.statusCode = 404;
            throw err;
        }
        return taskRepository.delete(taskId, userId);
    }

    async getCompletedTodayCount(userId) {
        return taskRepository.countCompletedToday(userId);
    }
}

module.exports = new TaskService();
