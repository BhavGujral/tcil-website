const express = require('express');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, getPresignedUrl, deleteFile, BUCKETS } = require('../config/minio');
const { setCache, getCache, deleteCache } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET ALL CAREERS - Public
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'active', department } = req.query;
        const offset = (page - 1) * limit;

        const cacheKey = `careers_${page}_${limit}_${status}_${department}`;
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        let query = `SELECT id, post_name, post_name_hi, department,
                 vacancies, qualification, pay_level, last_date, status, created_at
                 FROM career_openings WHERE 1=1`;
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

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM career_openings WHERE status = $1',
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

        await setCache(cacheKey, response, 300);
        res.json(response);
    } catch (error) {
        console.error('Get careers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET SINGLE CAREER - Public
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM career_openings WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Career opening not found',
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DOWNLOAD CAREER PDF - Public
router.get('/:id/download', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT pdf_key, post_name FROM career_openings WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0 || !result.rows[0].pdf_key) {
            return res.status(404).json({
                success: false,
                message: 'Career PDF not found',
            });
        }

        const url = await getPresignedUrl(
            BUCKETS.CAREERS,
            result.rows[0].pdf_key,
            900
        );

        res.json({
            success: true,
            downloadUrl: url,
            expiresIn: '15 minutes',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE CAREER - Admin only
router.post('/', protect, authorize('super_admin', 'publisher'),
    upload.single('pdf'), async (req, res) => {
        try {
            const {
                post_name, post_name_hi, department,
                vacancies, qualification, qualification_hi,
                pay_level, last_date, status,
            } = req.body;

            if (!post_name) {
                return res.status(400).json({
                    success: false,
                    message: 'Post name is required',
                });
            }

            let pdf_key = null;

            if (req.file) {
                pdf_key = `careers/${new Date().getFullYear()}/${uuidv4()}-${req.file.originalname}`;
                await uploadFile(
                    BUCKETS.CAREERS,
                    pdf_key,
                    req.file.buffer,
                    'application/pdf'
                );
            }

            const result = await pool.query(
                `INSERT INTO career_openings
       (post_name, post_name_hi, department, vacancies,
        qualification, qualification_hi, pay_level,
        last_date, pdf_key, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
                [
                    post_name, post_name_hi, department,
                    vacancies, qualification, qualification_hi,
                    pay_level, last_date, pdf_key,
                    status || 'active', req.user.id,
                ]
            );

            await deleteCache('careers_*');

            res.status(201).json({
                success: true,
                message: 'Career opening created successfully',
                data: result.rows[0],
            });
        } catch (error) {
            console.error('Create career error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

// UPDATE CAREER - Admin only
router.put('/:id', protect, authorize('super_admin', 'publisher'),
    upload.single('pdf'), async (req, res) => {
        try {
            const {
                post_name, post_name_hi, department,
                vacancies, qualification, qualification_hi,
                pay_level, last_date, status,
            } = req.body;

            const existing = await pool.query(
                'SELECT * FROM career_openings WHERE id = $1',
                [req.params.id]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Career opening not found',
                });
            }

            let pdf_key = existing.rows[0].pdf_key;

            if (req.file) {
                if (pdf_key) await deleteFile(BUCKETS.CAREERS, pdf_key);
                pdf_key = `careers/${new Date().getFullYear()}/${uuidv4()}-${req.file.originalname}`;
                await uploadFile(
                    BUCKETS.CAREERS,
                    pdf_key,
                    req.file.buffer,
                    'application/pdf'
                );
            }

            const result = await pool.query(
                `UPDATE career_openings SET
       post_name=$1, post_name_hi=$2, department=$3,
       vacancies=$4, qualification=$5, qualification_hi=$6,
       pay_level=$7, last_date=$8, pdf_key=$9, status=$10,
       updated_at=NOW()
       WHERE id=$11 RETURNING *`,
                [
                    post_name, post_name_hi, department,
                    vacancies, qualification, qualification_hi,
                    pay_level, last_date, pdf_key, status,
                    req.params.id,
                ]
            );

            res.json({
                success: true,
                message: 'Career opening updated successfully',
                data: result.rows[0],
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

// DELETE CAREER - Super Admin only
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const existing = await pool.query(
            'SELECT * FROM career_openings WHERE id = $1',
            [req.params.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Career opening not found',
            });
        }

        if (existing.rows[0].pdf_key) {
            await deleteFile(BUCKETS.CAREERS, existing.rows[0].pdf_key);
        }

        await pool.query(
            'DELETE FROM career_openings WHERE id = $1',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Career opening deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;