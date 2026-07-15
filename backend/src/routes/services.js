const express = require('express');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, deleteFile, BUCKETS } = require('../config/minio');
const { setCache, getCache, deleteCache } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET ALL SERVICES - Public
router.get('/', async (req, res) => {
    try {
        const cached = await getCache('services_all');
        if (cached) return res.json(cached);

        const result = await pool.query(
            `SELECT * FROM service_pages
       WHERE status = 'published'
       ORDER BY sort_order ASC`
        );

        const response = { success: true, data: result.rows };
        await setCache('services_all', response, 600);
        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET SINGLE SERVICE BY SLUG - Public
router.get('/:slug', async (req, res) => {
    try {
        const cacheKey = `service_${req.params.slug}`;
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const result = await pool.query(
            'SELECT * FROM service_pages WHERE slug = $1',
            [req.params.slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service page not found',
            });
        }

        const response = { success: true, data: result.rows[0] };
        await setCache(cacheKey, response, 600);
        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE SERVICE PAGE - Admin only
router.put('/:id', protect, authorize('super_admin', 'editor'),
    upload.single('hero_image'), async (req, res) => {
        try {
            const {
                title_en, title_hi, body_en,
                body_hi, category, sort_order, status,
            } = req.body;

            const existing = await pool.query(
                'SELECT * FROM service_pages WHERE id = $1',
                [req.params.id]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Service page not found',
                });
            }

            let hero_image_key = existing.rows[0].hero_image_key;

            if (req.file) {
                if (hero_image_key) {
                    await deleteFile(BUCKETS.SERVICES, hero_image_key);
                }
                const ext = req.file.originalname.split('.').pop();
                hero_image_key = `services/${uuidv4()}.${ext}`;
                await uploadFile(
                    BUCKETS.SERVICES,
                    hero_image_key,
                    req.file.buffer,
                    req.file.mimetype
                );
            }

            const result = await pool.query(
                `UPDATE service_pages SET
       title_en=$1, title_hi=$2, body_en=$3, body_hi=$4,
       hero_image_key=$5, category=$6, sort_order=$7,
       status=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
                [
                    title_en, title_hi, body_en, body_hi,
                    hero_image_key, category, sort_order,
                    status, req.params.id,
                ]
            );

            await deleteCache('services_all');
            await deleteCache(`service_${existing.rows[0].slug}`);

            res.json({
                success: true,
                message: 'Service page updated successfully',
                data: result.rows[0],
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

module.exports = router;