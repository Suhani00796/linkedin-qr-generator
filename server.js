const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// This makes the "uploads" folder public so people can see the images
app.use('/uploads', express.static('uploads'));

// Setup where to save uploaded certificates
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'cert-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images allowed.'));
        }
    }
});

app.post('/generate-certificate-qr', upload.single('certificate'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!req.body.domain) {
            return res.status(400).json({ error: 'Domain name is required' });
        }

        let domainName = req.body.domain.trim();
        
        // Remove www. if present for URL construction
        if (domainName.startsWith('www.')) {
            domainName = domainName.substring(4);
        }
        
        // Add https:// if not present
        if (!domainName.startsWith('http://') && !domainName.startsWith('https://')) {
            domainName = 'https://' + domainName;
        }
        
        const fileName = req.file.filename;
        const verificationUrl = `${domainName}/verify.html?id=${fileName}`;
        
        const qrImage = await QRCode.toDataURL(verificationUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        res.json({ 
            qrCodeUrl: qrImage, 
            verificationUrl: verificationUrl,
            fileName: fileName
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error generating QR code: ' + err.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Uploads folder: ${path.resolve('./uploads')}`);
});