const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET ALL ADMIN USERS - Super Admin only
router.get('/users', protect, authorize('super_admin'), async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, department, active, created_at FROM admin_users ORDER BY created_at DESC'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE ADMIN USER - Super Admin only
router.post('/users', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            `INSERT INTO admin_users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, department`,
            [name, email, password_hash, role || 'editor', department]
        );

        res.status(201).json({ success: true, message: 'Admin user created', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// TOGGLE USER ACTIVE STATUS - Super Admin only
router.put('/users/:id/toggle', protect, authorize('super_admin'), async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE admin_users SET active = NOT active WHERE id = $1 RETURNING id, name, active',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'User status updated', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET DASHBOARD STATS - Admin only
router.get('/stats', protect, async (req, res) => {
    try {
        const [news, tenders, careers, contacts, grievances] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM news_articles'),
            pool.query('SELECT COUNT(*) FROM tenders'),
            pool.query('SELECT COUNT(*) FROM career_openings'),
            pool.query("SELECT COUNT(*) FROM contact_messages WHERE status = 'unread'"),
            pool.query("SELECT COUNT(*) FROM grievances WHERE status = 'open'"),
        ]);

        res.json({
            success: true,
            data: {
                total_news: parseInt(news.rows[0].count),
                total_tenders: parseInt(tenders.rows[0].count),
                total_careers: parseInt(careers.rows[0].count),
                unread_contacts: parseInt(contacts.rows[0].count),
                open_grievances: parseInt(grievances.rows[0].count),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;