const authService = require('../services/AuthService');

class AuthController {
    async register(req, res) {
        const { name, email, password } = req.body;
        const { user, token } = await authService.register({ name, email, password });
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user, token },
        });
    }

    async login(req, res) {
        const { email, password } = req.body;
        const { user, token } = await authService.login({ email, password });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { user, token },
        });
    }

    async getMe(req, res) {
        const user = await authService.getMe(req.user.id);
        res.status(200).json({ success: true, data: { user } });
    }

    async updateFcmToken(req, res) {
        const { fcmToken } = req.body;
        await authService.updateFcmToken(req.user.id, fcmToken);
        res.status(200).json({ success: true, message: 'FCM token updated' });
    }
}

module.exports = new AuthController();
