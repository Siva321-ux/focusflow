const User = require('../models/User');

class UserRepository {
    async create(data) {
        const user = new User(data);
        return user.save();
    }

    async findByEmail(email) {
        return User.findOne({ email }).select('+passwordHash');
    }

    async findById(id) {
        return User.findById(id);
    }

    async updateFcmToken(userId, fcmToken) {
        return User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
    }
}

module.exports = new UserRepository();
