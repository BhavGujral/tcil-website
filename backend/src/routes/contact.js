const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// SUBMIT CONTACT FORM - Public
router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { name, email, phone, subject, message } = req.body;

        const result = await pool.query(
            `INSERT INTO contact_messages
       (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
            [name, email, phone, subject, message]
        );

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon.',
            data: { id: result.rows[0].id },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET ALL MESSAGES - Admin only
router.get('/', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM contact_messages WHERE 1=1';
        const params = [];

        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE MESSAGE STATUS - Admin only
router.put('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { status } = req.body;

        await pool.query(
            'UPDATE contact_messages SET status = $1 WHERE id = $2',
            [status, req.params.id]
        );

        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;