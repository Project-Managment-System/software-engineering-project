// Integration / API tests for the CEMS backend.
//
// The real server (server.js, unchanged) is started as a child process against a throwaway
// LOCAL MongoDB database, and every route group is exercised over HTTP with Supertest.
// Requires a MongoDB server on 127.0.0.1:27017 (override with TEST_MONGO_HOST).
// The test database is dropped when the suite finishes.
const request = require('supertest');
const { startServer, connectTestDb } = require('../helpers/testServer');

jest.setTimeout(30000);

const PORT = 5055;
const DB_NAME = `cems_integration_test_${process.pid}`;
const DIVISION = 'Anuradhapura-East';
const ENGINEER = { employeeId: 'it-eng-01', password: 'EngPass#2026', fullName: 'Test Engineer' };
const ADMIN = { employeeId: 'it-admin-01', password: 'AdminPass#2026', fullName: 'Test Admin' };

let server;
let db;
let api;
const ids = {};

const jobPayload = (overrides = {}) => ({
  jobName: 'Construction of classroom block',
  ministry: 'CHIEF MINISTRY',
  department: 'DEPARTMENT OF EDUCATION',
  division: DIVISION,
  dsDivision: 'Test DS',
  work: 'N',
  allocation: '2500000',
  dateReq: '2026-07-01',
  ref: 'REF/IT/001',
  historyActor: { name: 'Test Clerk', role: 'clerk' },
  ...overrides,
});

beforeAll(async () => {
  server = await startServer({ port: PORT, dbName: DB_NAME });
  api = request(server.baseUrl);
  db = await connectTestDb(server.uri);
  // Accounts that no API endpoint can create are seeded directly, exactly as seedDefaultUsers.js does.
  const eng = await db.User.create({ ...ENGINEER, email: 'it-eng@cems.test', role: 'engineer', division: DIVISION });
  const admin = await db.User.create({ ...ADMIN, email: 'it-admin@cems.test', role: 'admin' });
  ids.engineer = String(eng._id);
  ids.admin = String(admin._id);
});

afterAll(async () => {
  if (db) await db.drop();
  if (server) await server.stop();
});

// ─────────────────────────────────────────────────────────────── Authentication
describe('Authentication — /api/auth', () => {
  test('IT-01 login with valid credentials returns the profile (no token)', async () => {
    const res = await api.post('/api/auth/login').send({ employeeId: ENGINEER.employeeId, password: ENGINEER.password });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'LOGIN_SUCCESS', role: 'engineer', division: DIVISION, userId: ids.engineer });
    expect(res.body.password).toBeUndefined();
    expect(res.body.token).toBeUndefined();
  });

  test('IT-02 wrong password returns 401 INVALID_PASSWORD', async () => {
    const res = await api.post('/api/auth/login').send({ employeeId: ENGINEER.employeeId, password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_PASSWORD');
  });

  test('IT-03 unknown employee ID returns 404 USER_NOT_FOUND', async () => {
    const res = await api.post('/api/auth/login').send({ employeeId: 'nobody', password: 'x' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('USER_NOT_FOUND');
  });

  test('IT-04 missing fields return 400 MISSING_CREDENTIALS', async () => {
    const res = await api.post('/api/auth/login').send({ employeeId: ENGINEER.employeeId });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('MISSING_CREDENTIALS');
  });

  test('IT-05 enroll is non-functional (fails because employeeId is never set)', async () => {
    const res = await api.post('/api/auth/enroll').send({ fullName: 'X', email: 'x@cems.test', password: 'p', confirmPassword: 'p', role: 'user' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('REGISTRATION_FAILED');
  });

  test('IT-06 password reset is a stub', async () => {
    const res = await api.post('/api/auth/reset').send({});
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/not implemented/i);
  });
});

// ─────────────────────────────────────────────────────────────── Users
describe('Users — /api/users', () => {
  test('IT-07 engineer creates a field officer (role "user")', async () => {
    const res = await api.post('/api/users/add').send({
      employeeId: 'it-user-01', firstName: 'Field', secondName: 'Officer', email: 'it-user@cems.test',
      phoneNo: '0771234567', password: 'UserPass#2026', division: DIVISION, role: 'user',
    });
    expect(res.status).toBe(201);
    const created = await db.User.findOne({ employeeId: 'it-user-01' });
    expect(created.fullName).toBe('Field Officer');
    expect(created.password).not.toBe('UserPass#2026'); // stored as a bcrypt hash
    ids.user = String(created._id);
  });

  test('IT-08 creating a divisional assistant and a clerk succeeds', async () => {
    const da = await api.post('/api/users/add').send({ employeeId: 'it-da-01', fullName: 'Test DA', email: 'it-da@cems.test', password: 'DaPass#2026', division: DIVISION, role: 'division_assistant' });
    const clerk = await api.post('/api/users/add').send({ employeeId: 'it-clerk-01', fullName: 'Test Clerk', email: 'it-clerk@cems.test', password: 'ClerkPass#2026', division: DIVISION, role: 'clerk' });
    expect(da.status).toBe(201);
    expect(clerk.status).toBe(201);
    ids.da = String((await db.User.findOne({ employeeId: 'it-da-01' }))._id);
  });

  test('IT-09 role outside the staff whitelist is rejected (400)', async () => {
    const res = await api.post('/api/users/add').send({ employeeId: 'it-x', fullName: 'X', email: 'x2@cems.test', password: 'p', division: DIVISION, role: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid role/);
  });

  test('IT-10 duplicate employee ID is rejected (400)', async () => {
    const res = await api.post('/api/users/add').send({ employeeId: 'it-user-01', fullName: 'Dup', email: 'dup@cems.test', password: 'p', division: DIVISION, role: 'user' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Employee ID already exists');
  });

  test('IT-11 Head Office creates a branch director; a second director for the same branch is rejected', async () => {
    const first = await api.post('/api/users/branch-add').send({ employeeId: 'it-dir-01', fullName: 'Design Director', email: 'it-dir@cems.test', password: 'DirPass#2026', branch: 'design', role: 'branch_director' });
    const second = await api.post('/api/users/branch-add').send({ employeeId: 'it-dir-02', fullName: 'Second Director', email: 'it-dir2@cems.test', password: 'DirPass#2026', branch: 'design', role: 'branch_director' });
    expect(first.status).toBe(201);
    expect(second.status).toBe(400);
    expect(second.body.error).toMatch(/already has an assigned Director/);
  });

  test('IT-12 user lists never include password hashes', async () => {
    const all = await api.get('/api/users');
    const division = await api.get(`/api/users/division/${DIVISION}`);
    expect(all.status).toBe(200);
    expect(all.body.length).toBeGreaterThanOrEqual(5);
    expect(all.body.every((u) => u.password === undefined)).toBe(true);
    expect(division.body.every((u) => u.role !== 'admin' && u.password === undefined)).toBe(true);
  });

  test('IT-13 get a user by ID; unknown ID returns 404, malformed ID returns 400', async () => {
    const ok = await api.get(`/api/users/${ids.user}`);
    const missing = await api.get('/api/users/507f1f77bcf86cd799439011');
    const malformed = await api.get('/api/users/not-an-id');
    expect(ok.status).toBe(200);
    expect(ok.body.role).toBe('user');
    expect(missing.status).toBe(404);
    expect(malformed.status).toBe(400);
  });

  test('IT-14 generic user update ignores the password field', async () => {
    const res = await api.put(`/api/users/${ids.user}`).send({ phoneNo: '0710000000', password: 'hacked' });
    expect(res.status).toBe(200);
    expect(res.body.phoneNo).toBe('0710000000');
    const login = await api.post('/api/auth/login').send({ employeeId: 'it-user-01', password: 'UserPass#2026' });
    expect(login.status).toBe(200); // original password still valid
  });

  test('IT-15 profile update changes the allowed fields', async () => {
    const res = await api.patch(`/api/users/${ids.user}/profile`).send({ email: 'NEW-USER@CEMS.TEST' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('new-user@cems.test');
  });

  test('IT-16 password change validates the current password and length', async () => {
    const wrong = await api.patch(`/api/users/${ids.user}/password`).send({ currentPassword: 'bad', newPassword: 'NewPass#1' });
    const short = await api.patch(`/api/users/${ids.user}/password`).send({ currentPassword: 'UserPass#2026', newPassword: 'abc' });
    const ok = await api.patch(`/api/users/${ids.user}/password`).send({ currentPassword: 'UserPass#2026', newPassword: 'NewPass#1' });
    expect(wrong.status).toBe(401);
    expect(wrong.body.error).toBe('INCORRECT_CURRENT_PASSWORD');
    expect(short.status).toBe(400);
    expect(short.body.error).toBe('PASSWORD_TOO_SHORT');
    expect(ok.status).toBe(200);
    expect(ok.body.status).toBe('PASSWORD_UPDATED');
    const login = await api.post('/api/auth/login').send({ employeeId: 'it-user-01', password: 'NewPass#1' });
    expect(login.status).toBe(200);
  });

  test('IT-17 the route used by the DA dashboard for password changes does not exist (known defect)', async () => {
    const res = await api.patch(`/api/users/${ids.da}/change-password`).send({ currentPassword: 'DaPass#2026', newPassword: 'x1234' });
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────── Jobs
describe('Jobs — /api/projects', () => {
  test('IT-18 create a job: generated Job No., Estimation No. and first history entry', async () => {
    const res = await api.post('/api/projects/add').send(jobPayload());
    expect(res.status).toBe(201);
    const p = res.body.project;
    expect(p.jobNo).toMatch(/^JB-\d{4}$/);
    expect(p.estimationNo).toBe('26-ANU E-612-N-01');
    expect(p.status).toBe('Pending');
    expect(p.drawingWorkflowStatus).toBe('NotRequested');
    expect(p.statusHistory).toHaveLength(1);
    expect(p.statusHistory[0]).toMatchObject({ event: 'Job created', by: 'Test Clerk', byRole: 'clerk' });
    ids.jobNo = p.jobNo;
  });

  test('IT-19 a second job in the same division/department/work/year gets serial -02', async () => {
    const res = await api.post('/api/projects/add').send(jobPayload({ jobName: 'Repair of library roof', ref: 'REF/IT/002' }));
    expect(res.status).toBe(201);
    expect(res.body.project.estimationNo).toBe('26-ANU E-612-N-02');
    ids.jobNo2 = res.body.project.jobNo;
  });

  test('IT-20 creating a job without a required field fails', async () => {
    const res = await api.post('/api/projects/add').send(jobPayload({ ref: undefined }));
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error creating job');
  });

  test('IT-21 list endpoints exclude the drawing file; single-job endpoint includes it', async () => {
    await api.put(`/api/projects/update/${ids.jobNo}`).send({ drawingFileUrl: 'data:application/pdf;base64,AAAA' });
    const all = await api.get('/api/projects/all');
    const div = await api.get(`/api/projects/division/${DIVISION}`);
    const one = await api.get(`/api/projects/job/${ids.jobNo}`);
    expect(all.status).toBe(200);
    expect(div.body.length).toBe(2);
    expect(all.body.every((p) => p.drawingFileUrl === undefined)).toBe(true);
    expect(div.body.every((p) => p.drawingFileUrl === undefined)).toBe(true);
    expect(one.body.drawingFileUrl).toBe('data:application/pdf;base64,AAAA');
  });

  test('IT-22 unknown job returns 404', async () => {
    const res = await api.get('/api/projects/job/JB-0000');
    expect(res.status).toBe(404);
  });

  test('IT-23 engineer approves, then undoes the decision', async () => {
    const approve = await api.patch(`/api/projects/status/${ids.jobNo}`).send({ status: 'Approved', historyEvent: 'Approved by Engineer', historyActor: { name: 'Test Engineer', role: 'engineer' } });
    expect(approve.status).toBe(200);
    expect(approve.body.project.status).toBe('Approved');
    expect(approve.body.project.statusHistory.at(-1).event).toBe('Approved by Engineer');
    const undo = await api.patch(`/api/projects/undo/${ids.jobNo}`);
    expect(undo.body.project.status).toBe('Pending');
    await api.patch(`/api/projects/status/${ids.jobNo}`).send({ status: 'Approved' });
  });

  test('IT-24 assign a field officer', async () => {
    const res = await api.patch(`/api/projects/assign/${ids.jobNo}`).send({ assignee: 'Field Officer' });
    expect(res.status).toBe(200);
    expect(res.body.assignee).toBe('Field Officer');
  });

  test('IT-25 full drawing pipeline through the generic update endpoint records every step', async () => {
    const steps = [
      [{ drawingNeeded: true, drawingWorkflowStatus: 'PendingDA', estimateSubmitted: true }, 'Drawing requested by User', 'user'],
      [{ drawingDaStatus: 'Approved' }, 'Drawing request approved by DA', 'division_assistant'],
      [{ drawingWorkflowStatus: 'PendingDirectorAssignment' }, 'Drawing forwarded to Design Director', 'division_assistant'],
      [{ drawingWorkflowStatus: 'PendingEngineerDesign', assignedDesignEngineerName: 'Design Engineer' }, 'Assigned to Design Engineer', 'branch_director'],
      [{ drawingWorkflowStatus: 'PendingDirectorDesign', drawingFileUrl: 'data:application/pdf;base64,BBBB' }, 'Drawing attached by Design Engineer', 'branch_engineer'],
      [{ drawingWorkflowStatus: 'Completed', drawingReceived: true }, 'Drawing approved by Design Director', 'branch_director'],
    ];
    for (const [fields, event, role] of steps) {
      const res = await api.put(`/api/projects/update/${ids.jobNo}`).send({ ...fields, historyEvent: event, historyActor: { name: 'Tester', role } });
      expect(res.status).toBe(200);
    }
    const job = (await api.get(`/api/projects/job/${ids.jobNo}`)).body;
    expect(job.drawingWorkflowStatus).toBe('Completed');
    expect(job.drawingReceived).toBe(true);
    expect(job.statusHistory.map((h) => h.event)).toEqual(expect.arrayContaining(steps.map((s) => s[1])));
  });

  test('IT-26 two-stage estimate review, and the engineer-review undo', async () => {
    await api.put(`/api/projects/update/${ids.jobNo}`).send({ finalEstimateCost: 2400000, daReviewStatus: 'Pending', engineerReviewStatus: 'Pending' });
    await api.put(`/api/projects/update/${ids.jobNo}`).send({ daReviewStatus: 'Approved' });
    const eng = await api.put(`/api/projects/update/${ids.jobNo}`).send({ engineerReviewStatus: 'Approved' });
    expect(eng.body.project).toMatchObject({ daReviewStatus: 'Approved', engineerReviewStatus: 'Approved' });
    const undo = await api.patch(`/api/projects/undo-engineer-review/${ids.jobNo}`);
    expect(undo.status).toBe(200);
    expect(undo.body.project.engineerReviewStatus).toBe('Pending');
  });

  test('IT-27 the server does not validate workflow transitions (known limitation)', async () => {
    const res = await api.put(`/api/projects/update/${ids.jobNo2}`).send({ drawingWorkflowStatus: 'Completed' });
    expect(res.status).toBe(200); // a job can jump straight to Completed
    expect(res.body.project.drawingWorkflowStatus).toBe('Completed');
  });

  test('IT-28 risk summary for the division and risk breakdown for one job', async () => {
    const summary = await api.get(`/api/projects/risk/summary?division=${DIVISION}`);
    expect(summary.status).toBe(200);
    expect(summary.body).toMatchObject({ scope: DIVISION, classification: 'COMPUTED', method: 'RULE_BASED', totalProjects: 2 });
    const one = await api.get(`/api/projects/risk/${ids.jobNo}`);
    expect(one.status).toBe(200);
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(one.body.level);
    expect(one.body.factors.length).toBeGreaterThan(0);
  });

  test('IT-29 delete a job; it is then gone', async () => {
    const del = await api.delete(`/api/projects/delete/${ids.jobNo2}`);
    expect(del.status).toBe(200);
    const after = await api.get(`/api/projects/job/${ids.jobNo2}`);
    expect(after.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────── Messages
describe('Messages — /api/messages', () => {
  test('IT-30 send a message and read unread counts, previews and history', async () => {
    const sent = await api.post('/api/messages').send({ sender: ids.engineer, recipient: ids.user, content: 'Please visit the site' });
    expect(sent.status).toBe(201);
    ids.messageId = sent.body._id;
    const unread = await api.get(`/api/messages/unread/${ids.user}`);
    expect(unread.body[ids.engineer]).toBe(1);
    const previews = await api.get(`/api/messages/conversations/${ids.user}`);
    expect(previews.body[ids.engineer]).toMatchObject({ content: 'Please visit the site', isMine: false });
    const history = await api.get(`/api/messages/${ids.engineer}/${ids.user}`);
    expect(history.body).toHaveLength(1);
  });

  test('IT-31 mark as read clears the unread count', async () => {
    const res = await api.put(`/api/messages/read/${ids.engineer}/${ids.user}`);
    expect(res.status).toBe(200);
    const unread = await api.get(`/api/messages/unread/${ids.user}`);
    expect(unread.body[ids.engineer]).toBeUndefined();
  });

  test('IT-32 validation: missing participants, empty message, oversized attachment', async () => {
    const noRecipient = await api.post('/api/messages').send({ sender: ids.engineer, content: 'hi' });
    const empty = await api.post('/api/messages').send({ sender: ids.engineer, recipient: ids.user, content: '   ' });
    const big = await api.post('/api/messages').send({ sender: ids.engineer, recipient: ids.user, attachment: { fileName: 'big.bin', fileType: 'application/octet-stream', fileData: 'A'.repeat(7 * 1024 * 1024 + 1) } });
    expect(noRecipient.status).toBe(400);
    expect(empty.status).toBe(400);
    expect(big.status).toBe(413);
  });

  test('IT-33 only the sender can delete a message', async () => {
    const other = await api.delete(`/api/messages/${ids.messageId}?userId=${ids.user}`);
    expect(other.status).toBe(403);
    const own = await api.delete(`/api/messages/${ids.messageId}?userId=${ids.engineer}`);
    expect(own.status).toBe(200);
    const again = await api.delete(`/api/messages/${ids.messageId}?userId=${ids.engineer}`);
    expect(again.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────── Chatbot
describe('Chatbot — /api/chatbot', () => {
  test('IT-34 missing fields return 400', async () => {
    const res = await api.post('/api/chatbot/query').send({ message: 'summary' });
    expect(res.status).toBe(400);
  });

  test('IT-35 a summary question is answered with the summary intent', async () => {
    const res = await api.post('/api/chatbot/query').send({ message: 'give me a summary', division: DIVISION });
    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('summary');
    expect(res.body.response).toContain(DIVISION);
  });

  test('IT-36 a job number triggers a job lookup; with a risk word, a risk breakdown', async () => {
    const lookup = await api.post('/api/chatbot/query').send({ message: `details of ${ids.jobNo}`, division: DIVISION });
    const risk = await api.post('/api/chatbot/query').send({ message: `why is ${ids.jobNo} risky`, division: DIVISION });
    expect(lookup.body.intent).toBe('lookup');
    expect(lookup.body.response).toContain(ids.jobNo);
    expect(risk.body.intent).toBe('risk-lookup');
  });
});

// ─────────────────────────────────────────────────────────────── Cross-cutting
describe('Cross-cutting behaviour', () => {
  test('IT-37 security headers are set and responses are JSON', async () => {
    const res = await api.get('/api/projects/all');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  test('IT-38 API endpoints do not require authentication (known limitation)', async () => {
    const res = await api.get('/api/users'); // no credentials of any kind
    expect(res.status).toBe(200);
  });

  // Runs last: it exhausts the login rate limit for this test server.
  test('IT-39 login requests beyond the configured limit are rejected with 429', async () => {
    const first = await api.post('/api/auth/login').send({ employeeId: ADMIN.employeeId, password: ADMIN.password });
    const limit = Number(first.headers['ratelimit-limit']);
    expect(limit).toBeGreaterThan(0);
    let blocked = null;
    for (let i = 0; i < limit + 1 && !blocked; i += 1) {
      const res = await api.post('/api/auth/login').send({ employeeId: ADMIN.employeeId, password: ADMIN.password });
      if (res.status === 429) blocked = res;
    }
    expect(blocked).not.toBeNull();
    expect(blocked.body.error).toMatch(/Too many attempts/);
  });
});
