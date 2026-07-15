const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, getPresignedUrl, deleteFile, BUCKETS } = require('../config/minio');
const { setCache, getCache, deleteCache } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET ALL NEWS - Public
// GET /api/news
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, lang = 'en', status = 'published' } = req.query;
        const offset = (page - 1) * limit;

        // Check cache first
        const cacheKey = `news_${page}_${limit}_${lang}_${status}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const result = await pool.query(
            `SELECT id, title_en, title_hi, body_en, body_hi, 
       image_key, status, published_at, created_at
       FROM news_articles 
       WHERE status = $1
       ORDER BY published_at DESC
       LIMIT $2 OFFSET $3`,
            [status, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM news_articles WHERE status = $1',
            [status]
        );

        const response = {
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult.rows[0].count / limit),
            },
        };

        // Save to cache for 5 minutes
        await setCache(cacheKey, response, 300);

        res.json(response);
    } catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET SINGLE NEWS - Public
// GET /api/news/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM news_articles WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'News article not found',
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE NEWS - Admin only
// POST /api/news
router.post('/', protect, authorize('super_admin', 'editor', 'publisher'),
    upload.single('image'), async (req, res) => {
        try {
            const { title_en, title_hi, body_en, body_hi, status } = req.body;

            if (!title_en || !body_en) {
                return res.status(400).json({
                    success: false,
                    message: 'Title and body in English are required',
                });
            }

            let image_key = null;

            // If an image was uploaded, send it to MinIO
            if (req.file) {
                const ext = req.file.originalname.split('.').pop();
                image_key = `news/${new Date().getFullYear()}/${uuidv4()}.${ext}`;
                await uploadFile(BUCKETS.MEDIA, image_key, req.file.buffer, req.file.mimetype);
            }

            const result = await pool.query(
                `INSERT INTO news_articles 
       (title_en, title_hi, body_en, body_hi, image_key, status, author_id, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
                [
                    title_en, title_hi, body_en, body_hi,
                    image_key,
                    status || 'draft',
                    req.user.id,
                    status === 'published' ? new Date() : null,
                ]
            );

            // Clear news cache
            await deleteCache('news_*');

            res.status(201).json({
                success: true,
                message: 'News article created successfully',
                data: result.rows[0],
            });
        } catch (error) {
            console.error('Create news error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

// UPDATE NEWS - Admin only
// PUT /api/news/:id
router.put('/:id', protect, authorize('super_admin', 'editor', 'publisher'),
    upload.single('image'), async (req, res) => {
        try {
            const { title_en, title_hi, body_en, body_hi, status } = req.body;

            // Check if article exists
            const existing = await pool.query(
                'SELECT * FROM news_articles WHERE id = $1',
                [req.params.id]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'News article not found',
                });
            }

            let image_key = existing.rows[0].image_key;

            // If new image uploaded, replace old one
            if (req.file) {
                if (image_key) {
                    await deleteFile(BUCKETS.MEDIA, image_key);
                }
                const ext = req.file.originalname.split('.').pop();
                image_key = `news/${new Date().getFullYear()}/${uuidv4()}.${ext}`;
                await uploadFile(BUCKETS.MEDIA, image_key, req.file.buffer, req.file.mimetype);
            }

            const result = await pool.query(
                `UPDATE news_articles SET
       title_en = $1, title_hi = $2, body_en = $3, body_hi = $4,
       image_key = $5, status = $6,
       published_at = CASE WHEN $6 = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END,
       updated_at = NOW()
       WHERE id = $7 RETURNING *`,
                [title_en, title_hi, body_en, body_hi, image_key, status, req.params.id]
            );

            res.json({
                success: true,
                message: 'News article updated successfully',
                data: result.rows[0],
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

// DELETE NEWS - Super Admin only
// DELETE /api/news/:id
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const existing = await pool.query(
            'SELECT * FROM news_articles WHERE id = $1',
            [req.params.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'News article not found',
            });
        }

        // Delete image from MinIO if exists
        if (existing.rows[0].image_key) {
            await deleteFile(BUCKETS.MEDIA, existing.rows[0].image_key);
        }

        await pool.query('DELETE FROM news_articles WHERE id = $1', [req.params.id]);

        res.json({
            success: true,
            message: 'News article deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
