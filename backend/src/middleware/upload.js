const multer = require('multer');

// Store files in memory temporarily before sending to MinIO
// We don't save files on the server - they go straight to MinIO
const storage = multer.memoryStorage();

// Filter - only allow certain file types
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
    }
};

// Create upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // Max 50MB per file
    },
});

module.exports = upload;