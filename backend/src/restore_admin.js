const pool = require('./config/database');
let bcrypt;
try {
    bcrypt = require('bcrypt');
} catch (e) {
    bcrypt = require('bcryptjs');
}

async function restoreAdmin() {
    try {
        const colRes = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'admin_users' AND (column_name LIKE '%pass%' OR column_name LIKE '%hash%')
        `);

        const passCol = colRes.rows.length > 0 ? colRes.rows[0].column_name : 'password_hash';
        const hash = await bcrypt.hash('password', 10);

        const res = await pool.query(`UPDATE admin_users SET ${passCol} = $1 WHERE email = 'admin@tcil.net.in'`, [hash]);

        if (res.rowCount === 0) {
            try {
                await pool.query(`INSERT INTO admin_users (name, email, ${passCol}, role) VALUES ('Admin', 'admin@tcil.net.in', $1, 'superadmin')`, [hash]);
            } catch (err) {
                await pool.query(`INSERT INTO admin_users (email, ${passCol}) VALUES ('admin@tcil.net.in', $1)`, [hash]);
            }
        }
        console.log('✅ Admin credentials restored: admin@tcil.net.in / password');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error restoring admin:', error);
        process.exit(1);
    }
}
restoreAdmin();