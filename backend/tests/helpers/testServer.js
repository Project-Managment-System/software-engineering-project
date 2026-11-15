// Starts the real, unmodified backend (server.js) as a child process against a throwaway
// LOCAL MongoDB database, for the integration and load tests.
//
// Safety: the tests create and delete jobs, users and messages, so they must never run against
// the production database configured in backend/.env. The URI is built from TEST_MONGO_HOST
// (default 127.0.0.1:27017) and the helper refuses to start unless that host is local.
const { spawn } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');

const BACKEND_DIR = path.join(__dirname, '..', '..');
const LOCAL_HOSTS = ['127.0.0.1', 'localhost'];

function buildTestUri(dbName) {
  const host = process.env.TEST_MONGO_HOST || '127.0.0.1:27017';
  const hostname = host.split(':')[0];
  if (!LOCAL_HOSTS.includes(hostname)) {
    throw new Error(`Refusing to run tests against non-local MongoDB host "${host}".`);
  }
  return `mongodb://${host}/${dbName}`;
}

// Resolves once both "Server active" and "DATABASE SYNCED" have been logged.
function startServer({ port, dbName, timeoutMs = 20000 }) {
  const uri = buildTestUri(dbName);
  const child = spawn(process.execPath, ['server.js'], {
    cwd: BACKEND_DIR,
    env: { ...process.env, MONGODB_URI: uri, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start within ${timeoutMs} ms:\n${output}`)), timeoutMs);
    const onData = (chunk) => {
      output += chunk.toString();
      if (output.includes('Server active') && output.includes('DATABASE SYNCED:') && !output.includes('SYNCED: FAILED')) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code) => { clearTimeout(timer); reject(new Error(`Server exited (code ${code}):\n${output}`)); });
  });

  return ready.then(() => ({
    baseUrl: `http://127.0.0.1:${port}`,
    uri,
    stop: () => new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      child.removeAllListeners('exit');
      child.once('exit', () => resolve());
      child.kill();
    }),
  }));
}

// Opens a direct Mongoose connection to the same test database (used to seed accounts that
// no API endpoint can create, such as the Division Engineer, and to drop the database afterwards).
async function connectTestDb(uri) {
  await mongoose.connect(uri);
  return {
    User: require('../../models/User'),
    Project: require('../../models/Project'),
    Message: require('../../models/Message'),
    drop: async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    },
  };
}

module.exports = { startServer, connectTestDb, buildTestUri };
