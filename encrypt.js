const crypto = require('crypto');
const fs = require('fs');

// Master secret (must match the one used at runtime)
const masterSecret = 'my-super-secret-passphrase';

// Variables to encrypt
const variablesToEncrypt = {
  DB_PASSWORD: 'myDatabasePassword123',
  API_KEY: 'myApiKey456',
  MQTT_PASSWORD: 'myMqttPassword789'
};

// Function to encrypt a value
function encryptValue(value, masterSecret) {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.pbkdf2Sync(masterSecret, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `ENC:${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
}

// Encrypt all variables
const encryptedValues = {};
for (const [key, value] of Object.entries(variablesToEncrypt)) {
  encryptedValues[key] = encryptValue(value, masterSecret);
}

// Update .env file with encrypted values
let envContent = '';
try {
  envContent = fs.readFileSync('.env', 'utf8');
} catch (err) {
  // If .env doesn't exist, we'll create it
  console.log('.env file not found, creating a new one');
}

const updatedEnvContent = Object.entries(encryptedValues)
  .reduce((content, [key, value]) => {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (content.match(regex)) {
      return content.replace(regex, `${key}=${value}`);
    }
    return content + (content ? '\n' : '') + `${key}=${value}`;
  }, envContent.trim());

fs.writeFileSync('.env', updatedEnvContent + '\n');

console.log('Updated .env with encrypted values:');
console.log(encryptedValues);