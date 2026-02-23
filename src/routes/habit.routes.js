const express = require('express');
const router = express.Router();
const habitController = require('../controllers/HabitController');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

router.use(protect);

router.post('/', validate('createHabit'), habitController.createHabit.bind(habitController));
router.get('/', habitController.getHabits.bind(habitController));
router.put('/:id/checkin', habitController.checkIn.bind(habitController));
router.delete('/:id', habitController.deleteHabit.bind(habitController));

module.exports = router;
