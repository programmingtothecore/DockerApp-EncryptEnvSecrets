require('dotenv').config();
const { decryptAndSetEnvVars } = require('./decryptEnv.js');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

// Log environment variables before decryption (for debugging)
console.log('Environment Variables Before Decryption:', process.env);

// Decrypt all encrypted variables and set them in process.env
try {
  const masterSecret = process.env.MASTER_SECRET;
  decryptAndSetEnvVars(masterSecret);
} catch (err) {
  console.error('Decryption failed:', err.message);
  process.exit(1);
}

// Log environment variables after decryption (for debugging)
console.log('Environment Variables After Decryption:', process.env);

// Example usage of decrypted values
console.log('Connecting to database with password:', process.env.DB_PASSWORD);
console.log('Using API key:', process.env.API_KEY);
console.log('Connecting to MQTT with password:', process.env.MQTT_PASSWORD);

(async () => {
    console.log('Sleeping for 5 minutes to allow inspection...');
    await sleep(300000); // 5 minutes
    console.log('Sleep finished, container will exit.');
  })();