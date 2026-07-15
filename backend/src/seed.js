const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function runSeed() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS admin_users CASCADE;
            DROP TABLE IF EXISTS news CASCADE;
            DROP TABLE IF EXISTS tenders CASCADE;
            DROP TABLE IF EXISTS services CASCADE;

            CREATE TABLE admin_users (
                id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) UNIQUE,
                password_hash VARCHAR(255), role VARCHAR(50), department VARCHAR(100),
                active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE news (
                id SERIAL PRIMARY KEY, title_en VARCHAR(255), title_hi VARCHAR(255),
                body_en TEXT, body_hi TEXT, status VARCHAR(50), featured_image VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE tenders (
                id SERIAL PRIMARY KEY, title_en VARCHAR(255), title_hi VARCHAR(255),
                reference_no VARCHAR(100), department VARCHAR(100), closing_date TIMESTAMP,
                status VARCHAR(50), document_url VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE services (
                id SERIAL PRIMARY KEY, title_en VARCHAR(255), title_hi VARCHAR(255),
                description_en TEXT, description_hi TEXT, slug VARCHAR(100) UNIQUE,
                icon VARCHAR(255), image VARCHAR(255), status VARCHAR(50) DEFAULT 'active'
            );
        `);

        const hash = await bcrypt.hash('password', 10);

        await pool.query(`
            INSERT INTO admin_users (name, email, password_hash, role, department, active)
            VALUES ('Admin User', 'admin@tcil.net.in', $1, 'admin', 'IT', true);
        `, [hash]);

        await pool.query(`
            INSERT INTO news (title_en, title_hi, body_en, body_hi, status)
            VALUES 
            ('TCIL Wins Major Telecom Project', 'टीसीआईएल ने जीता प्रमुख टेलीकॉम प्रोजेक्ट', 'TCIL has successfully secured a major international telecom project.', 'टीसीआईएल ने एक प्रमुख अंतरराष्ट्रीय टेलीकॉम प्रोजेक्ट हासिल किया है।', 'published');
        `);

        await pool.query(`
            INSERT INTO tenders (title_en, title_hi, reference_no, department, closing_date, status)
            VALUES 
            ('Supply of Optic Fiber Cables', 'ऑप्टिक फाइबर केबल की आपूर्ति', 'TCIL/OFC/2026/01', 'Procurement', NOW() + INTERVAL '30 days', 'open');
        `);

        await pool.query(`
            INSERT INTO services (title_en, title_hi, description_en, description_hi, slug)
            VALUES 
            ('Telecom Consultancy', 'दूरसंचार परामर्श', 'Expert consultancy services for telecom infrastructure.', 'दूरसंचार बुनियादी ढांचे के लिए विशेषज्ञ परामर्श सेवाएं।', 'telecom-consultancy');
        `);

        console.log('✅ Database fully restored with content and admin access.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed database:', error);
        process.exit(1);
    }
}

runSeed();