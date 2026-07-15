const express = require('express');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, deleteFile, BUCKETS } = require('../config/minio');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET ALL ALBUMS - Public
router.get('/albums', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, COUNT(g.id) as photo_count
       FROM media_albums a
       LEFT JOIN media_gallery g ON a.id = g.album_id
       GROUP BY a.id
       ORDER BY a.event_date DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET PHOTOS IN ALBUM - Public
router.get('/albums/:id/photos', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM media_gallery
       WHERE album_id = $1
       ORDER BY created_at ASC`,
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE ALBUM - Admin only
router.post('/albums', protect, authorize('super_admin', 'editor'), async (req, res) => {
    try {
        const { title_en, title_hi, event_date } = req.body;

        const result = await pool.query(
            `INSERT INTO media_albums (title_en, title_hi, event_date)
       VALUES ($1, $2, $3) RETURNING *`,
            [title_en, title_hi, event_date]
        );

        res.status(201).json({
            success: true,
            message: 'Album created successfully',
            data: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPLOAD PHOTOS TO ALBUM - Admin only
router.post('/albums/:id/photos', protect,
    authorize('super_admin', 'editor'),
    upload.array('photos', 20), async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No photos uploaded',
                });
            }

            const uploadedPhotos = [];

            for (const file of req.files) {
                const ext = file.originalname.split('.').pop();
                const file_key = `gallery/${req.params.id}/${uuidv4()}.${ext}`;

                await uploadFile(BUCKETS.MEDIA, file_key, file.buffer, file.mimetype);

                const result = await pool.query(
                    `INSERT INTO media_gallery
         (album_id, file_key, caption_en, media_type)
         VALUES ($1, $2, $3, 'image')
         RETURNING *`,
                    [req.params.id, file_key, file.originalname]
                );

                uploadedPhotos.push(result.rows[0]);
            }

            res.status(201).json({
                success: true,
                message: `${uploadedPhotos.length} photos uploaded successfully`,
                data: uploadedPhotos,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

// DELETE PHOTO - Admin only
router.delete('/photos/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const existing = await pool.query(
            'SELECT * FROM media_gallery WHERE id = $1',
            [req.params.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Photo not found' });
        }

        await deleteFile(BUCKETS.MEDIA, existing.rows[0].file_key);
        await pool.query('DELETE FROM media_gallery WHERE id = $1', [req.params.id]);

        res.json({ success: true, message: 'Photo deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;