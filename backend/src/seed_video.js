const pool = require('./config/database');

async function seedVideoContent() {
    try {
        const adminRes = await pool.query("SELECT id FROM admin_users LIMIT 1");
        const adminId = adminRes.rows.length > 0 ? adminRes.rows[0].id : null;

        await pool.query("TRUNCATE news_articles, tenders, career_openings, annual_reports, contact_messages, grievances CASCADE;");

        await pool.query(`
            INSERT INTO news_articles (title_en, title_hi, body_en, body_hi, status, author_id, published_at) VALUES 
            ('TCIL wins major telecom project in Africa', 'टीसीआईएल ने अफ्रीका में बड़ा दूरसंचार प्रोजेक्ट जीता', 'TCIL has been awarded a major telecommunications infrastructure project in East Africa worth $50 million.', '...', 'published', $1, NOW() - INTERVAL '2 days'),
            ('TCIL signs MoU with Ministry of Health', 'टीसीआईएल ने स्वास्थ्य मंत्रालय के साथ समझौता किया', 'TCIL has signed a Memorandum of Understanding with the Ministry of Health...', '...', 'published', $1, NOW() - INTERVAL '4 days'),
            ('TCIL celebrates 52nd Foundation Day', 'टीसीआईएल ने 52वां स्थापना दिवस मनाया', 'TCIL celebrated its 52nd Foundation Day with great enthusiasm...', '...', 'published', $1, NOW() - INTERVAL '7 days');
        `, [adminId]);

        await pool.query(`
            INSERT INTO tenders (ref_number, title_en, department, deadline, status, created_by) VALUES 
            ('TCIL/IT/2026/001', 'Supply and Installation of Network Equipment', 'IT Division', '2026-07-28', 'open', $1),
            ('TCIL/CIVIL/2026/002', 'Construction of TCIL Regional Office Building', 'Civil Works', '2026-08-12', 'open', $1),
            ('TCIL/TELECOM/2026/003', 'Procurement of Optical Fiber Cable', 'Telecom Division', '2026-07-18', 'open', $1),
            ('TCIL/IT/2026/004', 'Annual Maintenance Contract for IT Systems', 'IT Division', '2026-07-13', 'open', $1),
            ('TCIL/HR/2026/005', 'Manpower Supply for Data Entry Operations', 'HR Division', '2026-06-23', 'closed', $1);
        `, [adminId]);

        await pool.query(`
            INSERT INTO career_openings (post_name, department, vacancies, pay_level, last_date, status, created_by) VALUES 
            ('Senior Telecom Engineer', 'Telecom Division', 5, 'Level-7 (₹44,900 - ₹1,42,400)', '2026-07-28', 'active', $1),
            ('Finance Officer', 'Finance Division', 2, 'Level-8 (₹47,600 - ₹1,51,100)', '2026-08-12', 'active', $1),
            ('Project Manager', 'Telecom Division', 3, 'Level-9 (₹53,100 - ₹1,67,800)', '2026-08-07', 'active', $1),
            ('IT Specialist', 'IT Division', 10, 'Level-7 (₹44,900 - ₹1,42,400)', '2026-08-12', 'active', $1),
            ('HR Executive', 'HR Division', 4, 'Level-6 (₹35,400 - ₹1,12,400)', '2026-07-13', 'active', $1);
        `, [adminId]);

        await pool.query(`
            INSERT INTO annual_reports (title_en, year, pdf_key, report_type) VALUES 
            ('final', 2026, 'dummy.pdf', 'annual'),
            ('4th report', 2026, 'dummy.pdf', 'annual'),
            ('3rd report', 2026, 'dummy.pdf', 'annual'),
            ('2nd report', 2026, 'dummy.pdf', 'annual'),
            ('1st report', 2026, 'dummy.pdf', 'annual');
        `);

        await pool.query(`
            INSERT INTO grievances (ticket_number, name, email, description, status, admin_response) VALUES 
            ('TCIL-GRV-202607-6203', 'BHAV GUJRAL', 'bhavgujral@gmail.com', 'I am unwell and i need to complete min 20 characters to submit this i think it would have been done', 'resolved', 'accepted'),
            ('TCIL-GRV-202607-8182', 'BHAV GUJRAL', 'bhavgujral@gmail.com', 'unwell unwell unwell unwell unwell unwell unwell unwell unwell unwell unwell unwell', 'resolved', 'accepted');
        `);

        await pool.query(`
            INSERT INTO contact_messages (name, email, subject, message, status) VALUES 
            ('BHAV GUJRAL', 'bhavgujral@gmail.com', 'Leave request', 'hi sir hi sir hi sir hi sir hi sir hi sir hi sir', 'resolved');
        `);

        await pool.query(`
            INSERT INTO service_pages (slug, title_en, title_hi, category, sort_order) VALUES
            ('telecom', 'Telecom Services', 'दूरसंचार सेवाएं', 'telecom', 1),
            ('it-services', 'IT Services', 'आईटी सेवाएं', 'it', 2),
            ('healthcare', 'Healthcare Services', 'स्वास्थ्य सेवाएं', 'healthcare', 3),
            ('solar', 'Solar Energy Services', 'सौर ऊर्जा सेवाएं', 'solar', 4),
            ('civil', 'Civil Works', 'नागरिक कार्य', 'civil', 5),
            ('e-governance', 'e-Governance', 'ई-गवर्नेंस', 'egovernance', 6)
            ON CONFLICT (slug) DO NOTHING;
        `);

        console.log('✅ Video content populated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding content:', error);
        process.exit(1);
    }
}
seedVideoContent();