// Quick script to check if server can start
const { testConnection } = require('./config/database');

async function check() {
  console.log('Checking database connection...');
  const connected = await testConnection();
  
  if (connected) {
    console.log('✅ Database OK!');
    console.log('✅ Backend can start!');
    process.exit(0);
  } else {
    console.log('❌ Database connection failed!');
    console.log('Please check:');
    console.log('1. XAMPP MySQL is running');
    console.log('2. Database mindpub_db exists');
    console.log('3. .env file configuration');
    process.exit(1);
  }
}

check();

