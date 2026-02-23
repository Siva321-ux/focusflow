const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

class AuthService {
    async register({ name, email, password }) {
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            const err = new Error('Email already registered');
            err.statusCode = 409;
            throw err;
        }

        const user = await userRepository.create({ name, email, passwordHash: password });
        const token = this._signToken(user._id);
        return { user, token };
    }

    async login({ email, password }) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            throw err;
        }

        const valid = await user.comparePassword(password);
        if (!valid) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            throw err;
        }

        const token = this._signToken(user._id);
        // Remove passwordHash from returned object
        user.passwordHash = undefined;
        return { user, token };
    }

    async getMe(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }
        return user;
    }

    async updateFcmToken(userId, fcmToken) {
        return userRepository.updateFcmToken(userId, fcmToken);
    }

    _signToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });
    }
}

module.exports = new AuthService();
