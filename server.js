const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const app = express();

app.use(cors()); // Allows your frontend to talk to the backend

app.get('/generate-qr', async (req, res) => {
    const linkedinUrl = "https://www.linkedin.com/in/sandali-snigdha-3b2723362";
    try {
        // Generates the QR code as a base64 image string
        const qrImage = await QRCode.toDataURL(linkedinUrl);
        res.send({ qrCodeUrl: qrImage });
    } catch (err) {
        res.status(500).send("Error generating QR code");
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));