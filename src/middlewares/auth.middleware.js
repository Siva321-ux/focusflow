const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userRepository.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        req.user = { id: user._id.toString(), email: user.email, name: user.name };
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        next(err);
    }
};

module.exports = { protect };
