const express = require('express');
const router = express.Router();
const taskController = require('../controllers/TaskController');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

router.use(protect);

router.post('/', validate('createTask'), taskController.createTask.bind(taskController));
router.get('/', taskController.getTasks.bind(taskController));
router.put('/:id', validate('updateTask'), taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));

module.exports = router;
