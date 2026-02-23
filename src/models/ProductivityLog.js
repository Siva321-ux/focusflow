const mongoose = require('mongoose');

const productivityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
        },
        tasksCompleted: {
            type: Number,
            default: 0,
            min: 0,
        },
        focusMinutes: {
            type: Number,
            default: 0,
            min: 0,
        },
        habitStreakBonus: {
            type: Number,
            default: 0,
            min: 0,
        },
        score: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

// Compound index: one log per user per day
productivityLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ProductivityLog', productivityLogSchema);
