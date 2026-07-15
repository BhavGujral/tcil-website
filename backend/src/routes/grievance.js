const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Generate ticket number
const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `TCIL-GRV-${year}${month}-${random}`;
};

// SUBMIT GRIEVANCE - Public
router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('description').isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, phone, category, description } = req.body;
        const ticket_number = generateTicketNumber();

        const result = await pool.query(
            `INSERT INTO grievances
       (ticket_number, name, email, phone, category, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, ticket_number, created_at`,
            [ticket_number, name, email, phone, category, description]
        );

        res.status(201).json({
            success: true,
            message: 'Grievance submitted successfully',
            data: {
                ticket_number: result.rows[0].ticket_number,
                id: result.rows[0].id,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// TRACK GRIEVANCE BY TICKET NUMBER - Public
router.get('/track/:ticket_number', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ticket_number, name, category, description,
       status, admin_response, created_at, updated_at
       FROM grievances WHERE ticket_number = $1`,
            [req.params.ticket_number]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found with this ticket number',
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET ALL GRIEVANCES - Admin only
router.get('/', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM grievances WHERE 1=1';
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

// RESPOND TO GRIEVANCE - Admin only
router.put('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { status, admin_response } = req.body;

        const result = await pool.query(
            `UPDATE grievances SET
       status = $1, admin_response = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
            [status, admin_response, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found',
            });
        }

        res.json({
            success: true,
            message: 'Grievance updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;