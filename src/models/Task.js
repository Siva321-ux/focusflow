const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: '',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        dueDate: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ['pending', 'completed'],
            default: 'pending',
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Auto-set completedAt when status changes to 'completed'
taskSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    if (this.isModified('status') && this.status === 'pending') {
        this.completedAt = null;
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema);
