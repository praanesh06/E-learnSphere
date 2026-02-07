const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create subdirectories based on type
        const type = req.query.type || 'general';
        const typeDir = path.join(uploadsDir, type);
        if (!fs.existsSync(typeDir)) {
            fs.mkdirSync(typeDir, { recursive: true });
        }
        cb(null, typeDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        videos: ['video/mp4', 'video/webm', 'video/ogg'],
        all: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'video/mp4', 'video/webm', 'video/ogg']
    };

    const type = req.query.type || 'all';
    const allowed = allowedTypes[type] || allowedTypes.all;

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} not allowed for ${type}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Upload single file
router.post('/single', auth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const type = req.query.type || 'general';
        const fileUrl = `/uploads/${type}/${req.file.filename}`;

        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                url: fileUrl
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload multiple files
router.post('/multiple', auth, upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const type = req.query.type || 'general';
        const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${type}/${file.filename}`
        }));

        res.json({ success: true, data: files });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete file
router.delete('/:type/:filename', auth, (req, res) => {
    try {
        const { type, filename } = req.params;
        const filePath = path.join(uploadsDir, type, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'File deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'File too large. Maximum size is 50MB.' });
        }
        return res.status(400).json({ success: false, error: error.message });
    }
    if (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
    next();
});

module.exports = router;
