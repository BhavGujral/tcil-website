-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'editor' CHECK (role IN ('super_admin', 'editor', 'publisher')),
    department VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEWS ARTICLES TABLE
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en TEXT NOT NULL,
    title_hi TEXT,
    body_en TEXT NOT NULL,
    body_hi TEXT,
    image_key TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES admin_users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    fts_vector TSVECTOR
);

-- TENDERS TABLE
CREATE TABLE IF NOT EXISTS tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref_number VARCHAR(255) UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_hi TEXT,
    description_en TEXT,
    description_hi TEXT,
    department VARCHAR(255),
    deadline TIMESTAMPTZ,
    value NUMERIC(15,2),
    pdf_key TEXT,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded', 'cancelled')),
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    fts_vector TSVECTOR
);

-- CAREER OPENINGS TABLE
CREATE TABLE IF NOT EXISTS career_openings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_name VARCHAR(255) NOT NULL,
    post_name_hi VARCHAR(255),
    department VARCHAR(255),
    vacancies INTEGER DEFAULT 1,
    qualification TEXT,
    qualification_hi TEXT,
    pay_level VARCHAR(100),
    last_date DATE,
    pdf_key TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE PAGES TABLE
CREATE TABLE IF NOT EXISTS service_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_hi TEXT,
    body_en TEXT,
    body_hi TEXT,
    hero_image_key TEXT,
    category VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIA ALBUMS TABLE
CREATE TABLE IF NOT EXISTS media_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255),
    cover_key TEXT,
    event_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIA GALLERY TABLE
CREATE TABLE IF NOT EXISTS media_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES media_albums(id) ON DELETE CASCADE,
    file_key TEXT NOT NULL,
    thumb_key TEXT,
    caption_en TEXT,
    caption_hi TEXT,
    media_type VARCHAR(50) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANNUAL REPORTS TABLE
CREATE TABLE IF NOT EXISTS annual_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255),
    year INTEGER NOT NULL,
    pdf_key TEXT NOT NULL,
    report_type VARCHAR(100) DEFAULT 'annual' CHECK (report_type IN ('annual', 'audit', 'rti', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GRIEVANCES TABLE
CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    category VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255),
    title_hi VARCHAR(255),
    subtitle_en TEXT,
    subtitle_hi TEXT,
    image_key TEXT NOT NULL,
    link_url TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FULL TEXT SEARCH
CREATE INDEX IF NOT EXISTS idx_news_fts ON news_articles USING GIN(fts_vector);
CREATE INDEX IF NOT EXISTS idx_tenders_fts ON tenders USING GIN(fts_vector);
CREATE INDEX IF NOT EXISTS idx_news_status ON news_articles(status);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON tenders(deadline);
CREATE INDEX IF NOT EXISTS idx_careers_status ON career_openings(status);
CREATE INDEX IF NOT EXISTS idx_careers_last_date ON career_openings(last_date);

-- AUTO UPDATE FTS VECTOR FOR NEWS
CREATE OR REPLACE FUNCTION update_news_fts() RETURNS TRIGGER AS $$
BEGIN
    NEW.fts_vector := to_tsvector('english',
        COALESCE(NEW.title_en, '') || ' ' ||
        COALESCE(NEW.body_en, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER news_fts_trigger
    BEFORE INSERT OR UPDATE ON news_articles
    FOR EACH ROW EXECUTE FUNCTION update_news_fts();

-- AUTO UPDATE FTS VECTOR FOR TENDERS
CREATE OR REPLACE FUNCTION update_tenders_fts() RETURNS TRIGGER AS $$
BEGIN
    NEW.fts_vector := to_tsvector('english',
        COALESCE(NEW.title_en, '') || ' ' ||
        COALESCE(NEW.description_en, '') || ' ' ||
        COALESCE(NEW.ref_number, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenders_fts_trigger
    BEFORE INSERT OR UPDATE ON tenders
    FOR EACH ROW EXECUTE FUNCTION update_tenders_fts();

-- AUTO UPDATE updated_at TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_careers_updated_at BEFORE UPDATE ON career_openings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- INSERT DEFAULT SUPER ADMIN
INSERT INTO admin_users (name, email, password_hash, role) VALUES (
    'TCIL Admin',
    'admin@tcil.net.in',
    '$2b$10$rQZ9M8K1JvX3mN2pL5oH8OqY7kF4gT6iU1wC9bE0dA3sV2nR6mP4K',
    'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- INSERT DEFAULT SERVICE PAGES
INSERT INTO service_pages (slug, title_en, title_hi, category, sort_order) VALUES
('telecom', 'Telecom Services', 'दूरसंचार सेवाएं', 'telecom', 1),
('it-services', 'IT Services', 'आईटी सेवाएं', 'it', 2),
('healthcare', 'Healthcare Services', 'स्वास्थ्य सेवाएं', 'healthcare', 3),
('solar', 'Solar Energy Services', 'सौर ऊर्जा सेवाएं', 'solar', 4),
('civil', 'Civil Works', 'नागरिक कार्य', 'civil', 5),
('e-governance', 'e-Governance', 'ई-गवर्नेंस', 'egovernance', 6)
ON CONFLICT (slug) DO NOTHING;