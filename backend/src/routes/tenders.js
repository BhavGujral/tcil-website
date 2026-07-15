const express = require('express');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, getPresignedUrl, deleteFile, BUCKETS } = require('../config/minio');
const { setCache, getCache, deleteCache } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET ALL TENDERS - Public
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, department } = req.query;
        const offset = (page - 1) * limit;

        const cacheKey = `tenders_${page}_${limit}_${status}_${department}`;
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        let query = `SELECT id, ref_number, title_en, title_hi, 
                 department, deadline, value, status, created_at
                 FROM tenders WHERE 1=1`;
        const params = [];

        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }

        if (department) {
            params.push(department);
            query += ` AND department = $${params.length}`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        const response = {
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
            },
        };

        await setCache(cacheKey, response, 300);
        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET SINGLE TENDER - Public
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tenders WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tender not found',
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DOWNLOAD TENDER PDF - Public (presigned URL)
router.get('/:id/download', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT pdf_key, title_en FROM tenders WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0 || !result.rows[0].pdf_key) {
            return res.status(404).json({
                success: false,
                message: 'Tender PDF not found',
            });
        }

        // Generate a presigned URL valid for 15 minutes
        const url = await getPresignedUrl(BUCKETS.TENDERS, result.rows[0].pdf_key, 900);

        res.json({
            success: true,
            downloadUrl: url,
            expiresIn: '15 minutes',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE TENDER - Admin only
router.post('/', protect, authorize('super_admin', 'publisher'),
    upload.single('pdf'), async (req, res) => {
        try {
            const {
                ref_number, title_en, title_hi,
                description_en, description_hi,
                department, deadline, value, status,
            } = req.body;

            if (!ref_number || !title_en) {
                return res.status(400).json({
                    success: false,
                    message: 'Reference number and title are required',
                });
            }

            let pdf_key = null;

            if (req.file) {
                pdf_key = `tenders/${new Date().getFullYear()}/${uuidv4()}-${req.file.originalname}`;
                await uploadFile(BUCKETS.TENDERS, pdf_key, req.file.buffer, 'application/pdf');
            }

            const result = await pool.query(
                `INSERT INTO tenders
       (ref_number, title_en, title_hi, description_en, description_hi,
        department, deadline, value, pdf_key, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
                [
                    ref_number, title_en, title_hi,
                    description_en, description_hi,
                    department, deadline, value,
                    pdf_key, status || 'open', req.user.id,
                ]
            );

            await deleteCache('tenders_*');

            res.status(201).json({
                success: true,
                message: 'Tender created successfully',
                data: result.rows[0],
            });
        } catch (error) {
            console.error('Create tender error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

// UPDATE TENDER STATUS - Admin only
router.put('/:id', protect, authorize('super_admin', 'publisher'),
    upload.single('pdf'), async (req, res) => {
        try {
            const {
                title_en, title_hi, description_en,
                description_hi, department, deadline, value, status,
            } = req.body;

            const existing = await pool.query(
                'SELECT * FROM tenders WHERE id = $1',
                [req.params.id]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Tender not found' });
            }

            let pdf_key = existing.rows[0].pdf_key;

            if (req.file) {
                if (pdf_key) await deleteFile(BUCKETS.TENDERS, pdf_key);
                pdf_key = `tenders/${new Date().getFullYear()}/${uuidv4()}-${req.file.originalname}`;
                await uploadFile(BUCKETS.TENDERS, pdf_key, req.file.buffer, 'application/pdf');
            }

            const result = await pool.query(
                `UPDATE tenders SET
       title_en=$1, title_hi=$2, description_en=$3, description_hi=$4,
       department=$5, deadline=$6, value=$7, pdf_key=$8, status=$9,
       updated_at=NOW()
       WHERE id=$10 RETURNING *`,
                [title_en, title_hi, description_en, description_hi,
                    department, deadline, value, pdf_key, status, req.params.id]
            );

            res.json({
                success: true,
                message: 'Tender updated successfully',
                data: result.rows[0],
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

// DELETE TENDER - Super Admin only
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const existing = await pool.query(
            'SELECT * FROM tenders WHERE id = $1',
            [req.params.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tender not found' });
        }

        if (existing.rows[0].pdf_key) {
            await deleteFile(BUCKETS.TENDERS, existing.rows[0].pdf_key);
        }

        await pool.query('DELETE FROM tenders WHERE id = $1', [req.params.id]);

        res.json({ success: true, message: 'Tender deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;