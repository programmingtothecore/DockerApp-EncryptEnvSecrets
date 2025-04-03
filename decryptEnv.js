const crypto = require('crypto');

// Function to decrypt a single value
function decryptValue(encryptedValue, masterSecret) {
  if (!encryptedValue || !encryptedValue.startsWith('ENC:')) {
    throw new Error('Invalid or missing encrypted value');
  }
  const [, saltHex, ivHex, encryptedHex] = encryptedValue.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const derivedKey = crypto.pbkdf2Sync(masterSecret, salt, 100000, 32, 'sha256');
  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Function to decrypt all encrypted variables and set them in process.env
function decryptAndSetEnvVars(masterSecret) {
  if (!masterSecret) {
    throw new Error('MASTER_SECRET not provided!');
  }

  // Iterate over all environment variables
  for (const [key, value] of Object.entries(process.env)) {
    if (value && value.startsWith('ENC:')) {
      try {
        const decryptedValue = decryptValue(value, masterSecret);
        // Set the decrypted value back into process.env
        process.env[key] = decryptedValue;
      } catch (err) {
        console.error(`Failed to decrypt ${key}:`, err.message);
        throw err; // Rethrow to let the caller handle the error
      }
    }
  }
}

// Export the decryption function for reuse
module.exports = { decryptAndSetEnvVars };