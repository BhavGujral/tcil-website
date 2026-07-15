const express = require('express');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, getPresignedUrl, deleteFile, BUCKETS } = require('../config/minio');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET ALL REPORTS - Public
router.get('/', async (req, res) => {
    try {
        const { type, year } = req.query;
        let query = 'SELECT id, title_en, title_hi, year, report_type, created_at FROM annual_reports WHERE 1=1';
        const params = [];

        if (type) { params.push(type); query += ` AND report_type = $${params.length}`; }
        if (year) { params.push(year); query += ` AND year = $${params.length}`; }

        query += ' ORDER BY year DESC, created_at DESC';

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DOWNLOAD REPORT - Public
router.get('/:id/download', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM annual_reports WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Report not found' });

        const url = await getPresignedUrl(BUCKETS.REPORTS, result.rows[0].pdf_key, 900);
        res.json({ success: true, downloadUrl: url, expiresIn: '15 minutes' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPLOAD REPORT - Admin only
router.post('/', protect, authorize('super_admin', 'publisher'), upload.single('pdf'), async (req, res) => {
    try {
        const { title_en, title_hi, year, report_type } = req.body;
        if (!req.file) return res.status(400).json({ success: false, message: 'PDF file is required' });

        const pdf_key = `reports/${year}/${uuidv4()}-${req.file.originalname}`;
        await uploadFile(BUCKETS.REPORTS, pdf_key, req.file.buffer, 'application/pdf');

        const result = await pool.query(
            'INSERT INTO annual_reports (title_en, title_hi, year, pdf_key, report_type) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [title_en, title_hi, year, pdf_key, report_type || 'annual']
        );

        res.status(201).json({ success: true, message: 'Report uploaded successfully', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE REPORT - Super Admin only
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const existing = await pool.query('SELECT * FROM annual_reports WHERE id = $1', [req.params.id]);
        if (existing.rows.length === 0) return res.status(404).json({ success: false, message: 'Report not found' });

        await deleteFile(BUCKETS.REPORTS, existing.rows[0].pdf_key);
        await pool.query('DELETE FROM annual_reports WHERE id = $1', [req.params.id]);

        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;