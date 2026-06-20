const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');

(async () => {
  try {
    console.log('Starting MongoDB Memory Server...');
    const mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
    const uri = mongod.getUri();
    console.log(`Memory MongoDB is running on: ${uri}`);
    
    console.log('Seeding the database...');
    const seedProcess = spawn('node', ['seeds/seed.js'], { 
      env: { ...process.env, MONGODB_URI: uri }, 
      stdio: 'inherit',
      shell: true
    });

    seedProcess.on('close', (code) => {
      console.log('Starting the Node.js development server...');
      const serverProcess = spawn('npm', ['run', 'dev'], {
        env: { ...process.env, MONGODB_URI: uri },
        stdio: 'inherit',
        shell: true
      });
      
      serverProcess.on('close', () => {
        mongod.stop();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start memory db workflow:', err);
    process.exit(1);
  }
})();
