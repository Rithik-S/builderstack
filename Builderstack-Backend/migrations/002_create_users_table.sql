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


-- Admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) 
VALUES (
    'Admin User',
    'admin@builderstack.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aWry/qkCMKrVMuLy7K',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Test regular user (password: user123)
INSERT INTO users (name, email, password_hash, role) 
VALUES (
    'Test User',
    'user@builderstack.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.aWry/qkCMKrVMuLy7K',
    'user'
) ON CONFLICT (email) DO NOTHING;