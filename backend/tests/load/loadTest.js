// Load / performance test for the CEMS API (run with: npm run test:load).
//
// Starts the real server (server.js, unchanged) against a throwaway LOCAL MongoDB database,
// seeds a realistic data set, then uses autocannon to measure the endpoints the dashboards call
// most often. Never point this at the production site: it sends thousands of requests per second.
const os = require('os');
const autocannon = require('autocannon');
const { startServer, connectTestDb } = require('../helpers/testServer');

const PORT = 5066;
const DB_NAME = `cems_load_test_${process.pid}`;
const DIVISION = 'Anuradhapura-East';
const JOBS = Number(process.env.LOAD_JOBS || 300);
const DURATION = Number(process.env.LOAD_DURATION || 10); // seconds per scenario
const CONNECTIONS = Number(process.env.LOAD_CONNECTIONS || 20); // concurrent clients

async function seed(db) {
  const engineer = await db.User.create({ employeeId: 'load-eng', fullName: 'Load Engineer', email: 'load-eng@cems.test', password: 'LoadPass#2026', role: 'engineer', division: DIVISION });
  const staff = await db.User.insertMany(Array.from({ length: 20 }, (_, i) => ({
    employeeId: `load-user-${i}`, fullName: `Field Officer ${i}`, email: `load-user-${i}@cems.test`,
    password: 'not-used-for-login', role: 'user', division: DIVISION, dsDivision: `DS ${i % 5}`,
  })));
  const statuses = ['Pending', 'Approved', 'Rejected'];
  const day = 86400000;
  await db.Project.insertMany(Array.from({ length: JOBS }, (_, i) => ({
    jobNo: `JB-${String(1000 + i)}`, estimationNo: `26-ANU E-612-N-${String(i + 1).padStart(2, '0')}`,
    jobName: `Load test job ${i}`, division: DIVISION, ministry: 'CHIEF MINISTRY', department: 'DEPARTMENT OF EDUCATION',
    work: i % 4 === 0 ? 'R' : 'N', allocation: String(500000 + (i % 37) * 75000), dateReq: new Date(Date.now() - (i % 200) * day),
    ref: `REF/LOAD/${i}`, dsDivision: `DS ${i % 5}`, status: statuses[i % 3], assignee: `Field Officer ${i % 20}`,
    drawingNeeded: i % 2 === 0, drawingReceived: i % 6 === 0,
    statusHistory: [{ event: 'Job created', by: 'Load Clerk', byRole: 'clerk', at: new Date(Date.now() - (i % 200) * day) }],
  })));
  await db.Message.insertMany(Array.from({ length: 300 }, (_, i) => ({
    sender: staff[i % 20]._id, recipient: engineer._id, content: `Update ${i}`, read: i % 3 === 0,
  })));
  return { engineerId: String(engineer._id) };
}

function run(baseUrl, { title, method = 'GET', path, body }) {
  return new Promise((resolve, reject) => {
    autocannon({
      url: baseUrl + path, method, duration: DURATION, connections: CONNECTIONS,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }, (err, r) => (err ? reject(err) : resolve({
      title,
      requests: r.requests.total,
      reqPerSec: Math.round(r.requests.average),
      latencyAvg: r.latency.average,
      latencyP50: r.latency.p50,
      latencyP99: r.latency.p99,
      latencyMax: r.latency.max,
      errors: r.errors + r.timeouts,
      non2xx: r.non2xx,
    })));
  });
}

async function main() {
  console.log(`Starting test server on port ${PORT} with local database ${DB_NAME} ...`);
  const server = await startServer({ port: PORT, dbName: DB_NAME });
  const db = await connectTestDb(server.uri);
  const results = [];
  try {
    const { engineerId } = await seed(db);
    const scenarios = [
      { title: `Division job list (${JOBS} jobs)`, path: `/api/projects/division/${DIVISION}` },
      { title: `All jobs (${JOBS} jobs)`, path: '/api/projects/all' },
      { title: 'Unread message counts (polled every 4 s)', path: `/api/messages/unread/${engineerId}` },
      { title: 'Division staff list', path: `/api/users/division/${DIVISION}` },
      { title: 'Single job details', path: '/api/projects/job/JB-1000' },
      { title: `Risk summary (${JOBS} jobs scored)`, path: `/api/projects/risk/summary?division=${DIVISION}` },
      { title: 'Chatbot summary query', method: 'POST', path: '/api/chatbot/query', body: { message: 'give me a summary', division: DIVISION } },
    ];
    for (const s of scenarios) {
      process.stdout.write(`Running: ${s.title} ... `);
      const r = await run(server.baseUrl, s);
      results.push(r);
      console.log(`${r.reqPerSec} req/s, avg ${r.latencyAvg} ms`);
    }
  } finally {
    await db.drop();
    await server.stop();
  }

  const cpus = os.cpus();
  console.log('\nEnvironment:', `${cpus[0].model.trim()} (${cpus.length} logical cores), ${Math.round(os.totalmem() / 1024 ** 3)} GB RAM,`,
    `Node.js ${process.version}, local MongoDB, ${CONNECTIONS} concurrent connections, ${DURATION} s per scenario`);
  console.table(results.map((r) => ({
    Scenario: r.title, Requests: r.requests, 'Req/s': r.reqPerSec, 'Avg ms': r.latencyAvg,
    'p50 ms': r.latencyP50, 'p99 ms': r.latencyP99, 'Max ms': r.latencyMax, Errors: r.errors, 'Non-2xx': r.non2xx,
  })));
  console.log('JSON:', JSON.stringify({ environment: { cpu: cpus[0].model.trim(), cores: cpus.length, node: process.version, connections: CONNECTIONS, duration: DURATION, jobs: JOBS }, results }));
  const failed = results.filter((r) => r.errors > 0 || r.non2xx > 0);
  if (failed.length) {
    console.error(`\n${failed.length} scenario(s) had errors or non-2xx responses.`);
    process.exitCode = 1;
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
