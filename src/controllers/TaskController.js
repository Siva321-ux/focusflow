const taskService = require('../services/TaskService');

class TaskController {
    async createTask(req, res) {
        const task = await taskService.createTask(req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Task created', data: { task } });
    }

    async getTasks(req, res) {
        const { status, priority, dueBefore, dueAfter } = req.query;
        const tasks = await taskService.getTasks(req.user.id, {
            status,
            priority,
            dueBefore,
            dueAfter,
        });
        res.status(200).json({ success: true, data: { tasks, count: tasks.length } });
    }

    async updateTask(req, res) {
        const task = await taskService.updateTask(req.user.id, req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Task updated', data: { task } });
    }

    async deleteTask(req, res) {
        await taskService.deleteTask(req.user.id, req.params.id);
        res.status(200).json({ success: true, message: 'Task deleted' });
    }
}

module.exports = new TaskController();
