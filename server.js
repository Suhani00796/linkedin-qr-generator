const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
// This makes the "uploads" folder public so people can see the images
app.use('/uploads', express.static('uploads'));

// Setup where to save uploaded certificates
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'cert-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.post('/generate-certificate-qr', upload.single('certificate'), async (req, res) => {
    let domainName = req.body.domain.trim();
    
    // Add https:// if not present
    if (!domainName.startsWith('http://') && !domainName.startsWith('https://')) {
        domainName = 'https://' + domainName;
    }
    
    const fileName = req.file.filename;
    
    // The link the QR code will actually open:
    const verificationUrl = `${domainName}/verify.html?id=${fileName}`;
    
    try {
        const qrImage = await QRCode.toDataURL(verificationUrl);
        res.send({ 
            qrCodeUrl: qrImage, 
            verificationUrl: verificationUrl 
        });
    } catch (err) {
        res.status(500).send("Error generating QR");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    const fs = require('fs');
    if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});