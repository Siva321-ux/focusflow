/**
 * Seed script — populates FocusFlow database with test data
 * Usage: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
require('dotenv').config({ path: require('path').join(__dirname, '../.env.example') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
const Habit = require('../src/models/Habit');
const ProductivityLog = require('../src/models/ProductivityLog');

const SEED_EMAIL = 'demo@focusflow.app';
const SEED_PASSWORD = 'Demo1234!';

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clean existing seed user
        const existing = await User.findOne({ email: SEED_EMAIL });
        if (existing) {
            await Task.deleteMany({ userId: existing._id });
            await Habit.deleteMany({ userId: existing._id });
            await ProductivityLog.deleteMany({ userId: existing._id });
            await User.deleteOne({ _id: existing._id });
            console.log('🧹 Cleared existing seed data');
        }

        // Create user
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(SEED_PASSWORD, salt);
        const user = await User.create({ name: 'Demo User', email: SEED_EMAIL, passwordHash });
        console.log(`👤 Created user: ${user.email}`);

        // Create tasks
        const tasks = await Task.insertMany([
            {
                userId: user._id,
                title: 'Complete project proposal',
                description: 'Write and submit the Q1 project proposal',
                priority: 'high',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                status: 'pending',
            },
            {
                userId: user._id,
                title: 'Read 30 pages of Deep Work',
                description: 'Continue reading Cal Newport\'s Deep Work',
                priority: 'medium',
                dueDate: new Date(),
                status: 'completed',
                completedAt: new Date(),
            },
            {
                userId: user._id,
                title: 'Team standup notes',
                priority: 'low',
                status: 'completed',
                completedAt: new Date(),
            },
        ]);
        console.log(`📋 Created ${tasks.length} tasks`);

        // Create habits
        const habits = await Habit.insertMany([
            {
                userId: user._id,
                name: 'Morning Meditation',
                description: '10 minutes of mindfulness',
                streak: 5,
                longestStreak: 5,
                lastCompletedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
            {
                userId: user._id,
                name: 'Daily Exercise',
                description: '30 minutes of physical activity',
                streak: 3,
                longestStreak: 7,
                lastCompletedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
        ]);
        console.log(`🔁 Created ${habits.length} habits`);

        // Create productivity log for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const log = await ProductivityLog.create({
            userId: user._id,
            date: today,
            tasksCompleted: 2,
            focusMinutes: 90,
            habitStreakBonus: 4,  // (5+3) * 0.5
            score: 2 * 2 + 90 / 30 + 4, // 4 + 3 + 4 = 11
        });
        console.log(`📊 Created productivity log (score: ${log.score})`);

        console.log('\n🎉 Seed complete!');
        console.log(`   Email:    ${SEED_EMAIL}`);
        console.log(`   Password: ${SEED_PASSWORD}`);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seed();
