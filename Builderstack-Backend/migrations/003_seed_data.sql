-- Clear existing data
TRUNCATE TABLE tools RESTART IDENTITY;

-- Seed tools
INSERT INTO tools (name, slug, short_description, category, pricing_model, budget_level, rating, active_users_count, supported_os, website_link, affiliate_link, is_sponsored, launched_year) VALUES
('VS Code',          'vs-code',          'Lightweight but powerful source code editor by Microsoft',             'Editor',          'free',      'low',    4.9, 14000000, 'all',     'https://code.visualstudio.com',     '',  false, 2015),
('Figma',            'figma',            'Collaborative interface design tool with real-time multiplayer',       'Design',          'freemium',  'medium', 4.8,  4000000, 'all',     'https://figma.com',                 '',  false, 2016),
('Notion',           'notion',           'All-in-one workspace for notes, docs, and project management',        'Productivity',    'freemium',  'low',    4.7,  4000000, 'all',     'https://notion.so',                 '',  false, 2016),
('GitHub',           'github',           'Web-based platform for version control and collaboration',            'DevOps',          'freemium',  'low',    4.9, 83000000, 'all',     'https://github.com',                '',  false, 2008),
('Vercel',           'vercel',           'Platform for frontend frameworks and static sites with CI/CD',        'Hosting',         'freemium',  'medium', 4.8,  1000000, 'all',     'https://vercel.com',                '',  false, 2015),
('Postman',          'postman',          'API platform for building, testing, and documenting APIs',            'API Tools',       'freemium',  'low',    4.7, 20000000, 'all',     'https://postman.com',               '',  false, 2012),
('Linear',           'linear',           'Fast, streamlined issue tracking for modern software teams',          'Project Mgmt',    'freemium',  'medium', 4.8,   500000, 'all',     'https://linear.app',                '',  false, 2019),
('Supabase',         'supabase',         'Open source Firebase alternative with Postgres at its core',         'Backend',         'freemium',  'low',    4.7,   600000, 'all',     'https://supabase.com',              '',  false, 2020),
('Tailwind CSS',     'tailwind-css',     'Utility-first CSS framework for rapidly building custom designs',     'Frontend',        'free',      'low',    4.9,  5000000, 'all',     'https://tailwindcss.com',           '',  false, 2017),
('Docker',           'docker',           'Platform for developing, shipping, and running apps in containers',   'DevOps',          'freemium',  'low',    4.8, 13000000, 'all',     'https://docker.com',                '',  false, 2013),
('Stripe',           'stripe',           'Payment infrastructure for the internet',                            'Payments',        'freemium',  'medium', 4.8,  1000000, 'all',     'https://stripe.com',                '',  false, 2010),
('Slack',            'slack',            'Business communication platform with channels and integrations',      'Communication',   'freemium',  'medium', 4.5, 18000000, 'all',     'https://slack.com',                 '',  false, 2013),
('Raycast',          'raycast',          'Blazing fast macOS launcher that boosts your productivity',           'Productivity',    'freemium',  'low',    4.9,   300000, 'macos',   'https://raycast.com',               '',  false, 2020),
('Loom',             'loom',             'Video messaging tool for async communication and screen recording',   'Communication',   'freemium',  'low',    4.6,  7000000, 'all',     'https://loom.com',                  '',  false, 2015),
('PlanetScale',      'planetscale',      'Serverless MySQL database platform with branching workflows',         'Backend',         'freemium',  'medium', 4.7,   200000, 'all',     'https://planetscale.com',           '',  false, 2018),
('Framer',           'framer',           'Design and publish responsive sites with interactive components',     'Design',          'freemium',  'medium', 4.7,   400000, 'all',     'https://framer.com',                '',  true,  2014),
('Resend',           'resend',           'Email API for developers built for modern stacks',                    'Email',           'freemium',  'low',    4.8,   150000, 'all',     'https://resend.com',                '',  false, 2022),
('Clerk',            'clerk',            'Complete user management and authentication for React apps',          'Auth',            'freemium',  'medium', 4.7,   250000, 'all',     'https://clerk.com',                 '',  false, 2021),
('Retool',           'retool',           'Low-code platform for building internal tools and dashboards',        'Low-Code',        'freemium',  'high',   4.6,   300000, 'all',     'https://retool.com',                '',  false, 2017),
('Sentry',           'sentry',           'Application monitoring platform for error tracking and performance',  'Monitoring',      'freemium',  'medium', 4.7,  4000000, 'all',     'https://sentry.io',                 '',  false, 2010);

-- Seed users (password_hash is a placeholder bcrypt hash for "password123")
INSERT INTO users (name, email, password_hash, location, age_group, profession, gender, role, created_at) VALUES
('Alice Nguyen',    'alice@example.com',   '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'San Francisco, CA', '25-34', 'Frontend Developer',  'female', 'user',  NOW() - INTERVAL '120 days'),
('Bob Martinez',    'bob@example.com',     '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Austin, TX',        '35-44', 'DevOps Engineer',     'male',   'user',  NOW() - INTERVAL '90 days'),
('Carol Kim',       'carol@example.com',   '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'New York, NY',      '25-34', 'Product Designer',    'female', 'user',  NOW() - INTERVAL '60 days'),
('David Chen',      'david@example.com',   '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Seattle, WA',       '18-24', 'Backend Developer',   'male',   'user',  NOW() - INTERVAL '45 days'),
('Eva Patel',       'eva@example.com',     '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'London, UK',        '25-34', 'Full Stack Developer', 'female', 'user',  NOW() - INTERVAL '30 days'),
('Frank Li',        'frank@example.com',   '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Toronto, CA',       '35-44', 'Engineering Manager',  'male',   'user',  NOW() - INTERVAL '20 days'),
('Grace Okonkwo',   'grace@example.com',   '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Lagos, NG',         '18-24', 'Student',             'female', 'user',  NOW() - INTERVAL '15 days'),
('Henry Park',      'henry@example.com',   '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Seoul, KR',         '25-34', 'Mobile Developer',    'male',   'user',  NOW() - INTERVAL '10 days'),
('Isla Brown',      'isla@example.com',    '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Sydney, AU',        '35-44', 'Data Engineer',       'female', 'user',  NOW() - INTERVAL '5 days'),
('Admin User',      'admin@builderstack.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Remote',         '25-34', 'Platform Admin',      'other',  'admin', NOW() - INTERVAL '200 days');
