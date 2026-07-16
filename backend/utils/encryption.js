const crypto = require("crypto");

// Derives a stable 32-byte key from CHAT_SECRET (or falls back to JWT_SECRET
// so this works without adding a new .env variable, though a dedicated
// CHAT_SECRET is recommended).
function getKey() {
  const source = process.env.CHAT_SECRET || process.env.JWT_SECRET || "fallback_dev_secret";
  return crypto.scryptSync(source, "cupinul_chat_salt", 32);
}

function encryptText(plainText) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted, iv: iv.toString("hex") };
}

function decryptText(encrypted, ivHex) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), Buffer.from(ivHex, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encryptText, decryptText };
