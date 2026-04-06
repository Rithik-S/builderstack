CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255)        NOT NULL,
    email         VARCHAR(255)        NOT NULL UNIQUE,
    password_hash TEXT                NOT NULL,
    location      VARCHAR(100),
    age_group     VARCHAR(20),
    profession    VARCHAR(100),
    gender        VARCHAR(20),
    role          VARCHAR(20)         NOT NULL DEFAULT 'user',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
