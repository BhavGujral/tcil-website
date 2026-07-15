const pool = require('./config/database');

async function seedHindiContent() {
    try {
        const adminRes = await pool.query("SELECT id FROM admin_users LIMIT 1");
        const adminId = adminRes.rows.length > 0 ? adminRes.rows[0].id : null;

        // Clear only the tables that need bilingual content updates
        await pool.query("TRUNCATE news_articles, tenders, career_openings CASCADE;");

        // Seed News Articles with both English and Hindi titles/bodies
        await pool.query(`
            INSERT INTO news_articles (title_en, title_hi, body_en, body_hi, status, author_id, published_at) VALUES 
            ('TCIL wins major telecom project in Africa', 'टीसीआईएल ने अफ्रीका में बड़ा दूरसंचार प्रोजेक्ट जीता', 'TCIL has been awarded a major telecommunications infrastructure project in East Africa worth $50 million.', 'टीसीआईएल को पूर्वी अफ्रीका में 50 मिलियन डॉलर का एक प्रमुख दूरसंचार बुनियादी ढांचा प्रोजेक्ट प्रदान किया गया है।', 'published', $1, NOW() - INTERVAL '2 days'),
            ('TCIL signs MoU with Ministry of Health', 'टीसीआईएल ने स्वास्थ्य मंत्रालय के साथ समझौता ज्ञापन पर हस्ताक्षर किए', 'TCIL has signed a Memorandum of Understanding with the Ministry of Health...', 'टीसीआईएल ने ई-हेल्थ प्लेटफॉर्म के कार्यान्वयन के लिए स्वास्थ्य और परिवार कल्याण मंत्रालय के साथ एक समझौता ज्ञापन पर हस्ताक्षर किए हैं।', 'published', $1, NOW() - INTERVAL '4 days'),
            ('TCIL celebrates 52nd Foundation Day', 'टीसीआईएल ने 52वां स्थापना दिवस मनाया', 'TCIL celebrated its 52nd Foundation Day with great enthusiasm...', 'टीसीआईएल ने अपना 52वां स्थापना दिवस बड़े उत्साह के साथ मनाया। यह आयोजन कंपनी के लिए एक महत्वपूर्ण मील का पत्थर है।', 'published', $1, NOW() - INTERVAL '7 days');
        `, [adminId]);

        // Seed Tenders with both English and Hindi titles
        await pool.query(`
            INSERT INTO tenders (ref_number, title_en, title_hi, department, deadline, status, created_by) VALUES 
            ('TCIL/IT/2026/001', 'Supply and Installation of Network Equipment', 'नेटवर्क उपकरण की आपूर्ति और स्थापना', 'IT Division', '2026-07-28', 'open', $1),
            ('TCIL/CIVIL/2026/002', 'Construction of TCIL Regional Office Building', 'टीसीआईएल क्षेत्रीय कार्यालय भवन का निर्माण', 'Civil Works', '2026-08-12', 'open', $1),
            ('TCIL/TELECOM/2026/003', 'Procurement of Optical Fiber Cable', 'ऑप्टिकल फाइबर केबल की खरीद', 'Telecom Division', '2026-07-18', 'open', $1),
            ('TCIL/IT/2026/004', 'Annual Maintenance Contract for IT Systems', 'आईटी सिस्टम के लिए वार्षिक रखरखाव अनुबंध', 'IT Division', '2026-07-13', 'open', $1),
            ('TCIL/HR/2026/005', 'Manpower Supply for Data Entry Operations', 'डेटा एंट्री ऑपरेशंस के लिए जनशक्ति आपूर्ति', 'HR Division', '2026-06-23', 'closed', $1);
        `, [adminId]);

        // Seed Careers with both English and Hindi post names
        await pool.query(`
            INSERT INTO career_openings (post_name, post_name_hi, department, vacancies, pay_level, last_date, status, created_by) VALUES 
            ('Senior Telecom Engineer', 'वरिष्ठ दूरसंचार इंजीनियर', 'Telecom Division', 5, 'Level-7 (₹44,900 - ₹1,42,400)', '2026-07-28', 'active', $1),
            ('Finance Officer', 'वित्त अधिकारी', 'Finance Division', 2, 'Level-8 (₹47,600 - ₹1,51,100)', '2026-08-12', 'active', $1),
            ('Project Manager', 'परियोजना प्रबंधक', 'Telecom Division', 3, 'Level-9 (₹53,100 - ₹1,67,800)', '2026-08-07', 'active', $1),
            ('IT Specialist', 'आईटी विशेषज्ञ', 'IT Division', 10, 'Level-7 (₹44,900 - ₹1,42,400)', '2026-08-12', 'active', $1),
            ('HR Executive', 'मानव संसाधन कार्यकारी', 'HR Division', 4, 'Level-6 (₹35,400 - ₹1,12,400)', '2026-07-13', 'active', $1);
        `, [adminId]);

        console.log('✅ Full Hindi dynamic content populated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding content:', error);
        process.exit(1);
    }
}
seedHindiContent();