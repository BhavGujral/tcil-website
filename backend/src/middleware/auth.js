const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// This middleware checks if the user has a valid login token
const protect = async (req, res, next) => {
    try {
        // Get the token from the request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login first.',
            });
        }

        // Extract just the token part (remove "Bearer " from the start)
        const token = authHeader.split(' ')[1];

        // Verify the token is valid and not expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get the user from database to make sure they still exist and are active
        const result = await pool.query(
            'SELECT id, name, email, role, department, active FROM admin_users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0 || !result.rows[0].active) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists or is deactivated.',
            });
        }

        // Attach user info to the request so routes can use it
        req.user = result.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.',
        });
    }
};

// This middleware checks if user has the right role
// For example: only super_admin can delete things
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized for this action.`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };