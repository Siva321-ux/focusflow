const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Habit name is required'],
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: '',
        },
        frequency: {
            type: String,
            enum: ['daily'],
            default: 'daily',
        },
        streak: {
            type: Number,
            default: 0,
            min: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastCompletedDate: {
            type: Date,
            default: null,
        },
        completedDates: {
            type: [Date],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Virtual: is today's check-in done?
habitSchema.virtual('completedToday').get(function () {
    if (!this.lastCompletedDate) return false;
    const today = new Date();
    const last = new Date(this.lastCompletedDate);
    return (
        today.getFullYear() === last.getFullYear() &&
        today.getMonth() === last.getMonth() &&
        today.getDate() === last.getDate()
    );
});

habitSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Habit', habitSchema);
