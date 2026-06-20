const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

console.log('🚀 Starting HaloCab Dev Environment...\n');

// Check if a port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        server.close();
        resolve(false);
      });
    server.listen(port, '127.0.0.1');
  });
};

(async () => {
  const mongoRunning = await isPortInUse(27017);
  let serverCmd = 'npm';
  let serverArgs = ['run', 'dev']; // Defaults to nodemon server.js (using local MongoDB)

  if (!mongoRunning) {
    console.log('📦 No local MongoDB detected on port 27017. Will start MongoDB Memory Server...');
    serverCmd = 'node';
    serverArgs = ['start-dev.js']; // Starts MongoMemoryServer + dev server
  } else {
    console.log('✅ Local MongoDB detected on port 27017. Connecting to local DB.');
  }

  // Start Server
  console.log('📡 Starting backend server...');
  const serverProcess = spawn(serverCmd, serverArgs, {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit',
    shell: true
  });

  // Start Client
  console.log('💻 Starting frontend client...');
  const clientProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });

  // Handle exits
  const killProcesses = () => {
    console.log('\n🛑 Shutting down backend and frontend dev servers...');
    serverProcess.kill();
    clientProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', killProcesses);
  process.on('SIGTERM', killProcesses);
})();
