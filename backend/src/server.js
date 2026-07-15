require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import database connections
const { connectRedis } = require('./config/redis');
const { initializeBuckets, minioClient } = require('./config/minio');

// Import all routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const tendersRoutes = require('./routes/tenders');
const careersRoutes = require('./routes/careers');
const servicesRoutes = require('./routes/services');
const galleryRoutes = require('./routes/gallery');
const reportsRoutes = require('./routes/reports');
const contactRoutes = require('./routes/contact');
const grievanceRoutes = require('./routes/grievance');
const searchRoutes = require('./routes/search');
const bannersRoutes = require('./routes/banners');
const adminRoutes = require('./routes/admin');


const app = express();

// SECURITY MIDDLEWARE
// crossOriginResourcePolicy: false allows the frontend to safely render streamed media files
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// CORS allows our frontend to talk to this backend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// Rate limiting - prevents someone from sending too many requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500000000, // max 500000000 requests per 15 minutes
    message: 'Too many requests, please try again later',
});
app.use('/api/', limiter);

// Parse JSON bodies - allows us to read JSON data sent to the server
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan logs every request to the console
app.use(morgan('dev'));

// HEALTH CHECK ROUTE
// Visit http://localhost:4000/health to see if server is running
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TCIL Backend is running',
        timestamp: new Date().toISOString(),
    });
});

// ALL API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tenders', tendersRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/grievance', grievanceRoutes);
app.use('/grievance', grievanceRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/admin', adminRoutes);

// FILE STREAMING PROXY ROUTE
// Securely streams data directly from MinIO to the browser, clearing signature issues
app.get('/api/media/stream-file', async (req, res) => {
    const { bucket, key } = req.query;
    if (!bucket || !key) {
        return res.status(400).send('Missing bucket or key parameters');
    }

    try {
        const stream = await minioClient.getObject(bucket, key);
        const lowerKey = key.toLowerCase();

        // Dynamically set content headers based on file extensions
        if (lowerKey.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
        } else if (lowerKey.endsWith('.jpg') || lowerKey.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (lowerKey.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        }

        stream.pipe(res);
    } catch (error) {
        console.error('❌ File streaming proxy error:', error);
        res.status(404).send('Requested file could not be retrieved');
    }
});

// 404 HANDLER - when someone visits a route that doesn't exist
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// ERROR HANDLER - catches any errors that happen in the app
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// START THE SERVER
const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        // Connect to Redis
        await connectRedis();

        // Initialize MinIO buckets
        await initializeBuckets();

        // Start listening for requests
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ TCIL Backend running on port ${PORT}`);
            console.log(`✅ Health check: http://localhost:${PORT}/health`);
            console.log(`✅ Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();