const pool = require('./config/database');

async function seedFull() {
    try {
        const adminRes = await pool.query("SELECT id FROM admin_users LIMIT 1");
        const adminId = adminRes.rows.length > 0 ? adminRes.rows[0].id : null;

        await pool.query("TRUNCATE news_articles, tenders, career_openings CASCADE;");

        await pool.query(`
            INSERT INTO news_articles (title_en, title_hi, body_en, body_hi, status, author_id, published_at)
            VALUES (
                'TCIL Wins Major Telecom Project', 
                'टीसीआईएल ने जीता प्रमुख टेलीकॉम प्रोजेक्ट', 
                'TCIL has successfully secured a major international telecom project.', 
                'टीसीआईएल ने एक प्रमुख अंतरराष्ट्रीय टेलीकॉम प्रोजेक्ट हासिल किया है।', 
                'published', 
                $1, 
                NOW()
            );
        `, [adminId]);

        await pool.query(`
            INSERT INTO tenders (ref_number, title_en, title_hi, description_en, description_hi, department, deadline, status, created_by)
            VALUES (
                'TCIL/OFC/2026/01', 
                'Supply of Optic Fiber Cables', 
                'ऑप्टिक फाइबर केबल की आपूर्ति', 
                'Supply and installation of Optic Fiber Cables.', 
                'ऑप्टिक फाइबर केबल की आपूर्ति और स्थापना।', 
                'Procurement', 
                NOW() + INTERVAL '30 days', 
                'open', 
                $1
            );
        `, [adminId]);

        await pool.query(`
            INSERT INTO career_openings (post_name, post_name_hi, department, vacancies, pay_level, last_date, status, created_by)
            VALUES (
                'Senior Telecom Engineer', 
                'वरिष्ठ दूरसंचार इंजीनियर', 
                'Engineering', 
                5, 
                'E-4 Level', 
                NOW() + INTERVAL '15 days', 
                'active', 
                $1
            );
        `, [adminId]);

        console.log('✅ All content populated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding content:', error);
        process.exit(1);
    }
}
seedFull();