CREATE TABLE IF NOT EXISTS tools (
    id                 SERIAL PRIMARY KEY,
    name               VARCHAR(255)   NOT NULL,
    slug               VARCHAR(255)   NOT NULL UNIQUE,
    short_description  TEXT,
    category           VARCHAR(100),
    pricing_model      VARCHAR(50),
    budget_level       VARCHAR(50),
    rating             NUMERIC(3, 2)  DEFAULT 0,
    active_users_count INTEGER        DEFAULT 0,
    supported_os       VARCHAR(100),
    website_link       TEXT,
    affiliate_link     TEXT,
    is_sponsored       BOOLEAN        DEFAULT FALSE,
    launched_year      INTEGER
);
