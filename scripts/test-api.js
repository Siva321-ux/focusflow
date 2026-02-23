/**
 * FocusFlow Backend — API Integration Test
 * Uses mongodb-memory-server so no external MongoDB is needed.
 * Usage: node scripts/test-api.js
 */
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const http = require('http');

let mongoServer;
let server;
let TOKEN = '';
let TASK_ID = '';
let HABIT_ID = '';
const BASE = 'http://localhost:5001/api';
const PORT = 5001;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function request(method, path, body, auth) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const headers = { 'Content-Type': 'application/json' };
        if (auth) headers['Authorization'] = `Bearer ${TOKEN}`;
        if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

        const req = http.request(`${BASE}${path}`, { method, headers }, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

let passed = 0;
let failed = 0;

function check(label, cond, detail = '') {
    if (cond) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
        failed++;
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

async function runTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FocusFlow API Integration Tests');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ── Health check ───────────────────────────────────────────────────────────
    console.log('[ Health ]');
    const health = await request('GET', '/../health');
    check('GET /health → 200', health.status === 200);

    // ── Auth ───────────────────────────────────────────────────────────────────
    console.log('\n[ Auth — Register ]');
    const reg = await request('POST', '/auth/register', {
        name: 'Test User',
        email: 'test@focusflow.app',
        password: 'Test1234!',
    });
    check('POST /auth/register → 201', reg.status === 201, JSON.stringify(reg.body?.message));
    check('Response has token', !!reg.body?.data?.token);
    check('Response has user', !!reg.body?.data?.user?.email);
    if (reg.body?.data?.token) TOKEN = reg.body.data.token;

    console.log('\n[ Auth — Duplicate Register ]');
    const dupReg = await request('POST', '/auth/register', {
        name: 'Test User',
        email: 'test@focusflow.app',
        password: 'Test1234!',
    });
    check('Duplicate email → 409', dupReg.status === 409);

    console.log('\n[ Auth — Login ]');
    const login = await request('POST', '/auth/login', {
        email: 'test@focusflow.app',
        password: 'Test1234!',
    });
    check('POST /auth/login → 200', login.status === 200);
    check('Login returns token', !!login.body?.data?.token);
    if (login.body?.data?.token) TOKEN = login.body.data.token;

    console.log('\n[ Auth — Bad Password ]');
    const badLogin = await request('POST', '/auth/login', {
        email: 'test@focusflow.app',
        password: 'WrongPass',
    });
    check('Wrong password → 401', badLogin.status === 401);

    console.log('\n[ Auth — Get Me ]');
    const me = await request('GET', '/auth/me', null, true);
    check('GET /auth/me → 200', me.status === 200, JSON.stringify(me.body?.message));
    check('Returns user name', me.body?.data?.user?.name === 'Test User');

    console.log('\n[ Auth — Protected without token ]');
    const noToken = await request('GET', '/auth/me', null, false);
    check('Missing token → 401', noToken.status === 401);

    // ── Tasks ──────────────────────────────────────────────────────────────────
    console.log('\n[ Tasks — Create ]');
    const createTask = await request('POST', '/tasks', {
        title: 'Write project report',
        description: 'Q1 summary document',
        priority: 'high',
        dueDate: '2026-03-15T09:00:00Z',
    }, true);
    check('POST /tasks → 201', createTask.status === 201, JSON.stringify(createTask.body?.message));
    check('Returns task with id', !!createTask.body?.data?.task?._id);
    if (createTask.body?.data?.task?._id) TASK_ID = createTask.body.data.task._id;

    console.log('\n[ Tasks — Validation ]');
    const emptyTask = await request('POST', '/tasks', { description: 'no title' }, true);
    check('Missing title → 422', emptyTask.status === 422);

    console.log('\n[ Tasks — Get ]');
    const getTasks = await request('GET', '/tasks', null, true);
    check('GET /tasks → 200', getTasks.status === 200);
    check('Tasks array returned', Array.isArray(getTasks.body?.data?.tasks));
    check('Count is 1', getTasks.body?.data?.count === 1);

    console.log('\n[ Tasks — Filter by status ]');
    const pending = await request('GET', '/tasks?status=pending', null, true);
    check('Filter pending → 200', pending.status === 200);
    check('1 pending task returned', pending.body?.data?.count === 1);

    console.log('\n[ Tasks — Update (complete) ]');
    const complete = await request('PUT', `/tasks/${TASK_ID}`, { status: 'completed' }, true);
    check('PUT /tasks/:id → 200', complete.status === 200);
    check('Status is completed', complete.body?.data?.task?.status === 'completed');
    check('completedAt set', !!complete.body?.data?.task?.completedAt);

    console.log('\n[ Tasks — Delete ]');
    const del = await request('DELETE', `/tasks/${TASK_ID}`, null, true);
    check('DELETE /tasks/:id → 200', del.status === 200);
    const afterDel = await request('GET', '/tasks', null, true);
    check('Task list now empty', afterDel.body?.data?.count === 0);

    console.log('\n[ Tasks — Delete non-existent ]');
    const delFake = await request('DELETE', `/tasks/${TASK_ID}`, null, true);
    check('Delete non-existent → 404', delFake.status === 404);

    // ── Habits ─────────────────────────────────────────────────────────────────
    console.log('\n[ Habits — Create ]');
    const createHabit = await request('POST', '/habits', {
        name: 'Morning Meditation',
        description: '10 mins mindfulness',
    }, true);
    check('POST /habits → 201', createHabit.status === 201);
    check('Streak starts at 0', createHabit.body?.data?.habit?.streak === 0);
    if (createHabit.body?.data?.habit?._id) HABIT_ID = createHabit.body.data.habit._id;

    console.log('\n[ Habits — Get ]');
    const getHabits = await request('GET', '/habits', null, true);
    check('GET /habits → 200', getHabits.status === 200);
    check('1 habit returned', getHabits.body?.data?.count === 1);

    console.log('\n[ Habits — Check-In ]');
    const checkIn = await request('PUT', `/habits/${HABIT_ID}/checkin`, null, true);
    check('PUT /habits/:id/checkin → 200', checkIn.status === 200);
    check('Streak incremented to 1', checkIn.body?.data?.habit?.streak === 1);
    check('completedToday is true', checkIn.body?.data?.habit?.completedToday === true);

    console.log('\n[ Habits — Double Check-In ]');
    const doubleCheckIn = await request('PUT', `/habits/${HABIT_ID}/checkin`, null, true);
    check('Double check-in → 400', doubleCheckIn.status === 400);

    console.log('\n[ Habits — Validation ]');
    const emptyHabit = await request('POST', '/habits', { description: 'no name' }, true);
    check('Missing name → 422', emptyHabit.status === 422);

    // ── Analytics ──────────────────────────────────────────────────────────────
    console.log('\n[ Analytics — Log Focus ]');

    // Create and complete a task first to get tasksCompleted > 0
    const t = await request('POST', '/tasks', { title: 'Focus task', priority: 'medium' }, true);
    const tid = t.body?.data?.task?._id;
    await request('PUT', `/tasks/${tid}`, { status: 'completed' }, true);

    const logFocus = await request('POST', '/analytics/focus', { focusMinutes: 25 }, true);
    check('POST /analytics/focus → 200', logFocus.status === 200);
    check('focusMinutes is 25', logFocus.body?.data?.log?.focusMinutes === 25);
    check('Score > 0', logFocus.body?.data?.log?.score > 0);

    console.log('\n[ Analytics — Log Focus Accumulates ]');
    const logFocus2 = await request('POST', '/analytics/focus', { focusMinutes: 30 }, true);
    check('Second focus log → 200', logFocus2.status === 200);
    check('focusMinutes accumulated (55)', logFocus2.body?.data?.log?.focusMinutes === 55);

    console.log('\n[ Analytics — Daily ]');
    const daily = await request('GET', '/analytics/daily', null, true);
    check('GET /analytics/daily → 200', daily.status === 200);
    check('Daily log has score', daily.body?.data?.log?.score !== undefined);

    const score = daily.body?.data?.log?.score;
    // Expected: tasksCompleted=1 → 2pts, focusMinutes=55 → 1.83pts, habitBonus=0.5 → ~4.33
    console.log(`  📊 Score formula check: score=${score}`);
    check('Score formula: score > 0', score > 0);

    console.log('\n[ Analytics — Weekly ]');
    const weekly = await request('GET', '/analytics/weekly', null, true);
    check('GET /analytics/weekly → 200', weekly.status === 200);
    check('Weekly has dailyLogs array', Array.isArray(weekly.body?.data?.summary?.dailyLogs));
    check('Weekly has averageScore', weekly.body?.data?.summary?.averageScore !== undefined);

    console.log('\n[ Analytics — Validation ]');
    const badFocus = await request('POST', '/analytics/focus', { focusMinutes: -5 }, true);
    check('Negative minutes → 422', badFocus.status === 422);

    // ── 404 route ──────────────────────────────────────────────────────────────
    console.log('\n[ 404 Handling ]');
    const notFound = await request('GET', '/nonexistent-route', null, false);
    check('Unknown route → 404', notFound.status === 404);

    // ── Summary ────────────────────────────────────────────────────────────────
    const total = passed + failed;
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Results: ${passed}/${total} passed  |  ${failed} failed`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    if (failed > 0) process.exit(1);
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚀 Starting in-memory MongoDB...');
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.JWT_SECRET = 'test_secret_key_for_integration_tests';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.NODE_ENV = 'test';
    process.env.PORT = PORT;

    const app = require('../app');
    await new Promise((resolve) => {
        server = app.listen(PORT, resolve);
    });
    console.log(`✅ App running on port ${PORT}\n`);

    try {
        await runTests();
    } finally {
        console.log('🧹 Shutting down...');
        server.close();
        await mongoServer.stop();
    }
}

main().catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
