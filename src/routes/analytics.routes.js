const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/AnalyticsController');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

router.use(protect);

router.post('/focus', validate('logFocus'), analyticsController.logFocus.bind(analyticsController));
router.get('/daily', analyticsController.getDaily.bind(analyticsController));
router.get('/weekly', analyticsController.getWeekly.bind(analyticsController));

module.exports = router;
