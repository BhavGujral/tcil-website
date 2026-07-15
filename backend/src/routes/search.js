const express = require('express');
const pool = require('../config/database');
const { setCache, getCache } = require('../config/redis');

const router = express.Router();

// GLOBAL SEARCH - Public
// GET /api/search?q=keyword
router.get('/', async (req, res) => {
    try {
        const { q, type, page = 1, limit = 10 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters',
            });
        }

        const offset = (page - 1) * limit;
        const cacheKey = `search_${q}_${type}_${page}`;
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const searchTerm = q.trim();
        const results = {};

        // Search news
        if (!type || type === 'news') {
            const newsResult = await pool.query(
                `SELECT id, title_en, title_hi, body_en,
         status, published_at,
         ts_rank(fts_vector, plainto_tsquery('english', $1)) AS rank
         FROM news_articles
         WHERE fts_vector @@ plainto_tsquery('english', $1)
         AND status = 'published'
         ORDER BY rank DESC
         LIMIT $2 OFFSET $3`,
                [searchTerm, limit, offset]
            );
            results.news = newsResult.rows;
        }

        // Search tenders
        if (!type || type === 'tenders') {
            const tendersResult = await pool.query(
                `SELECT id, ref_number, title_en, title_hi,
         department, deadline, status,
         ts_rank(fts_vector, plainto_tsquery('english', $1)) AS rank
         FROM tenders
         WHERE fts_vector @@ plainto_tsquery('english', $1)
         ORDER BY rank DESC
         LIMIT $2 OFFSET $3`,
                [searchTerm, limit, offset]
            );
            results.tenders = tendersResult.rows;
        }

        // Search careers
        if (!type || type === 'careers') {
            const careersResult = await pool.query(
                `SELECT id, post_name, post_name_hi,
         department, vacancies, last_date, status
         FROM career_openings
         WHERE (post_name ILIKE $1 OR department ILIKE $1)
         AND status = 'active'
         LIMIT $2 OFFSET $3`,
                [`%${searchTerm}%`, limit, offset]
            );
            results.careers = careersResult.rows;
        }

        // Search services
        if (!type || type === 'services') {
            const servicesResult = await pool.query(
                `SELECT id, slug, title_en, title_hi, category
         FROM service_pages
         WHERE (title_en ILIKE $1 OR body_en ILIKE $1)
         AND status = 'published'
         LIMIT $2`,
                [`%${searchTerm}%`, limit]
            );
            results.services = servicesResult.rows;
        }

        const response = {
            success: true,
            query: searchTerm,
            results,
        };

        await setCache(cacheKey, response, 120);
        res.json(response);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;