const express = require('express');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, deleteFile, BUCKETS } = require('../config/minio');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET ALL ACTIVE BANNERS - Public
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM banners WHERE active = true ORDER BY sort_order ASC'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE BANNER - Admin only
router.post('/', protect, authorize('super_admin'),
    upload.single('image'), async (req, res) => {
        try {
            const { title_en, title_hi, subtitle_en, subtitle_hi, link_url, sort_order } = req.body;
            if (!req.file) return res.status(400).json({ success: false, message: 'Banner image is required' });

            const ext = req.file.originalname.split('.').pop();
            const image_key = `banners/${uuidv4()}.${ext}`;
            await uploadFile(BUCKETS.BANNERS, image_key, req.file.buffer, req.file.mimetype);

            const result = await pool.query(
                `INSERT INTO banners (title_en, title_hi, subtitle_en, subtitle_hi, image_key, link_url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [title_en, title_hi, subtitle_en, subtitle_hi, image_key, link_url, sort_order || 0]
            );

            res.status(201).json({ success: true, message: 'Banner created', data: result.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

// DELETE BANNER - Super Admin only
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const existing = await pool.query('SELECT * FROM banners WHERE id = $1', [req.params.id]);
        if (existing.rows.length === 0) return res.status(404).json({ success: false, message: 'Banner not found' });

        await deleteFile(BUCKETS.BANNERS, existing.rows[0].image_key);
        await pool.query('DELETE FROM banners WHERE id = $1', [req.params.id]);

        res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;