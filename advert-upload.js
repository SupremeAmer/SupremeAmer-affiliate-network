const express = require('express');
const multer = require('multer');
const router = express.Router();

// Simulated user data
let user = { balance: 1000 }; // Example balance

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage: storage });

// Deduct tokens API
router.post('/deduct-tokens', (req, res) => {
    const { cost } = req.body;

    if (user.balance < cost) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }

    user.balance -= cost;
    res.json({ success: true, balance: user.balance });
});

// Upload advert API
router.post('/upload-advert', upload.array('images', 2), (req, res) => {
    const { clicks, socialMedia, redirectUrl } = req.body;

    const advert = {
        images: req.files.map(file => file.filename),
        clicks,
        socialMedia,
        redirectUrl,
        status: 'Verifying',
    };

    console.log('Advert created:', advert);
    res.json({ success: true, advert });
});

module.exports = router;
