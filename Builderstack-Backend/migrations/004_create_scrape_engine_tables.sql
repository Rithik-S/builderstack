-- ============================================
-- BUILDERSTACK SCRAPE ENGINE TABLES
-- ============================================

-- ============================================
-- TABLE 1: pending_tools
-- Tools discovered by scraper, awaiting review
-- ============================================
CREATE TABLE IF NOT EXISTS pending_tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    short_description TEXT,
    full_description TEXT,
    category VARCHAR(100),
    pricing_model VARCHAR(50),
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    
    -- Discovery source
    source_type VARCHAR(50),          -- 'reddit', 'hackernews', 'news', 'g2', 'capterra', 'producthunt', 'blog'
    source_name VARCHAR(100),         -- 'r/nocode', 'techcrunch', 'g2.com'
    source_url VARCHAR(500),          -- Original URL where found
    
    -- AI processing
    ai_extracted_features TEXT[],     -- Features AI found
    ai_confidence DECIMAL(3,2),       -- 0.00 to 1.00
    
    -- Review workflow
    status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected', 'duplicate'
    reviewer_notes TEXT,
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    -- Timestamps
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for pending_tools
CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_tools(status);
CREATE INDEX IF NOT EXISTS idx_pending_category ON pending_tools(category);
CREATE INDEX IF NOT EXISTS idx_pending_source ON pending_tools(source_type);
CREATE INDEX IF NOT EXISTS idx_pending_name ON pending_tools(LOWER(name));

-- ============================================
-- TABLE 2: tool_mentions
-- Reddit/HN/News mentions for sentiment (50% of grade)
-- ============================================
CREATE TABLE IF NOT EXISTS tool_mentions (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
    
    -- Source info
    platform VARCHAR(50) NOT NULL,    -- 'reddit', 'hackernews', 'news'
    source_name VARCHAR(100),         -- 'r/nocode', 'r/SaaS', 'techcrunch'
    
    -- Post details
    post_title TEXT,
    post_url VARCHAR(500),
    post_content TEXT,
    post_author VARCHAR(100),
    post_score INTEGER DEFAULT 0,     -- Upvotes
    comment_count INTEGER DEFAULT 0,
    
    -- AI sentiment analysis
    sentiment VARCHAR(20),            -- 'positive', 'negative', 'neutral', 'mixed'
    sentiment_score DECIMAL(4,3),     -- -1.000 to +1.000
    
    -- AI extracted insights
    mentioned_pros TEXT[],            -- ['easy to use', 'great support']
    mentioned_cons TEXT[],            -- ['expensive', 'learning curve']
    use_case TEXT,                    -- How they use it
    is_recommended BOOLEAN,           -- Did they recommend it?
    
    -- Metadata
    post_date TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tool_mentions
CREATE INDEX IF NOT EXISTS idx_mentions_tool ON tool_mentions(tool_id);
CREATE INDEX IF NOT EXISTS idx_mentions_platform ON tool_mentions(platform);
CREATE INDEX IF NOT EXISTS idx_mentions_sentiment ON tool_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_mentions_date ON tool_mentions(post_date);
CREATE INDEX IF NOT EXISTS idx_mentions_score ON tool_mentions(sentiment_score);

-- ============================================
-- TABLE 3: tool_user_comments
-- Your community's feedback (20% of grade)
-- ============================================
CREATE TABLE IF NOT EXISTS tool_user_comments (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Review content
    title VARCHAR(255),
    comment TEXT NOT NULL,
    
    -- User context (helps match recommendations)
    business_type VARCHAR(100),       -- 'bakery', 'consulting', 'ecommerce'
    team_size VARCHAR(50),            -- 'solo', '2-10', '11-50', '50+'
    use_case VARCHAR(255),            -- 'website', 'crm', 'analytics'
    
    -- AI analysis
    sentiment VARCHAR(20),            -- 'positive', 'negative', 'neutral'
    sentiment_score DECIMAL(4,3),     -- -1.000 to +1.000
    
    -- Community engagement
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_verified BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tool_user_comments
CREATE INDEX IF NOT EXISTS idx_comments_tool ON tool_user_comments(tool_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON tool_user_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_rating ON tool_user_comments(rating);
CREATE INDEX IF NOT EXISTS idx_comments_sentiment ON tool_user_comments(sentiment);
CREATE INDEX IF NOT EXISTS idx_comments_helpful ON tool_user_comments(helpful_count);

-- Unique constraint: one review per user per tool
CREATE UNIQUE INDEX IF NOT EXISTS idx_comments_unique ON tool_user_comments(tool_id, user_id);

-- ============================================
-- TABLE 4: tool_grades
-- Calculated BuilderStack grades over time
-- ============================================
CREATE TABLE IF NOT EXISTS tool_grades (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
    
    -- Component scores (0 to 100)
    sentiment_score DECIMAL(5,2),      -- 50% weight (Reddit/HN/News)
    user_comments_score DECIMAL(5,2),  -- 20% weight
    feature_match_score DECIMAL(5,2),  -- 15% weight
    pricing_score DECIMAL(5,2),        -- 15% weight
    
    -- Data counts (for transparency)
    mention_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Final grade
    total_score DECIMAL(5,2),          -- 0 to 100
    grade VARCHAR(5),                  -- 'A+', 'A', 'A-', 'B+', etc.
    
    -- Trend tracking
    previous_score DECIMAL(5,2),
    previous_grade VARCHAR(5),
    trend VARCHAR(20),                 -- 'up', 'down', 'stable', 'new'
    score_change DECIMAL(5,2),         -- +5.2, -3.1, etc.
    
    -- Timestamps
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tool_grades
CREATE INDEX IF NOT EXISTS idx_grades_tool ON tool_grades(tool_id);
CREATE INDEX IF NOT EXISTS idx_grades_grade ON tool_grades(grade);
CREATE INDEX IF NOT EXISTS idx_grades_date ON tool_grades(calculated_at);
CREATE INDEX IF NOT EXISTS idx_grades_trend ON tool_grades(trend);

-- ============================================
-- TABLE 5: scrape_logs
-- Monitor scraper health
-- ============================================
CREATE TABLE IF NOT EXISTS scrape_logs (
    id SERIAL PRIMARY KEY,
    
    -- What ran
    front VARCHAR(50) NOT NULL,       -- 'sentiment', 'discovery'
    source VARCHAR(100) NOT NULL,     -- 'reddit', 'g2', 'techcrunch'
    job_type VARCHAR(50),             -- 'daily_scan', 'weekly_full', 'manual'
    
    -- Results
    status VARCHAR(50) NOT NULL,      -- 'success', 'partial', 'failed'
    items_found INTEGER DEFAULT 0,
    items_new INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    items_skipped INTEGER DEFAULT 0,
    
    -- Errors
    error_message TEXT,
    error_count INTEGER DEFAULT 0,
    
    -- Performance
    started_at TIMESTAMP,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Metadata
    triggered_by VARCHAR(50)          -- 'cron', 'manual', 'webhook'
);

-- Indexes for scrape_logs
CREATE INDEX IF NOT EXISTS idx_logs_front ON scrape_logs(front);
CREATE INDEX IF NOT EXISTS idx_logs_source ON scrape_logs(source);
CREATE INDEX IF NOT EXISTS idx_logs_status ON scrape_logs(status);
CREATE INDEX IF NOT EXISTS idx_logs_date ON scrape_logs(completed_at);

-- ============================================
-- HELPER: Add grade column to tools table
-- ============================================
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS current_grade VARCHAR(5),
ADD COLUMN IF NOT EXISTS current_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS grade_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS mention_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Index for grade lookups
CREATE INDEX IF NOT EXISTS idx_tools_grade ON tools(current_grade);
CREATE INDEX IF NOT EXISTS idx_tools_score ON tools(current_score);