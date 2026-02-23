const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

router.post('/register', validate('register'), authController.register.bind(authController));
router.post('/login', validate('login'), authController.login.bind(authController));
router.get('/me', protect, authController.getMe.bind(authController));
router.put('/fcm-token', protect, validate('fcmToken'), authController.updateFcmToken.bind(authController));

module.exports = router;
