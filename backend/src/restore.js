const fs = require('fs');
const path = require('path');
const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function restore() {
    try {
        await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;');

        const sql = fs.readFileSync(path.join(__dirname, 'config', 'init.sql'), 'utf8');
        await pool.query(sql);

        const hash = await bcrypt.hash('password', 10);
        await pool.query('UPDATE admin_users SET password_hash = $1 WHERE email = $2', [hash, 'admin@tcil.net.in']);

        console.log('✅ Database fully restored from original init.sql!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error restoring database:', error);
        process.exit(1);
    }
}
restore();