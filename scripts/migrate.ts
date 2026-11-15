import { SQL } from 'bun';

const sql = new SQL(process.env.DATABASE_URL || 'postgres://bashkling_user:bashkling_password@127.0.0.1:5433/bashkling_db');

const statements = [
    sql`CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(128) NOT NULL,
        district VARCHAR(128) DEFAULT 'Уфа',
        total_score INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    sql`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(64),
        first_name VARCHAR(128),
        role VARCHAR(32) DEFAULT 'admin',
        school_id INTEGER REFERENCES schools(id),
        class_name VARCHAR(32) DEFAULT '7А',
        selected_lang_pair VARCHAR(16) DEFAULT 'ba-ru',
        streak_days INTEGER DEFAULT 1,
        honey_drops INTEGER DEFAULT 100,
        words_learned INTEGER DEFAULT 14,
        accuracy_percent INTEGER DEFAULT 95,
        explorer_xp INTEGER DEFAULT 120,
        guide_xp INTEGER DEFAULT 35,
        hearts INTEGER DEFAULT 5,
        streak_freeze_count INTEGER DEFAULT 1,
        corrections_count INTEGER DEFAULT 0,
        confirmations_count INTEGER DEFAULT 0,
        last_active_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    sql`CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
        name VARCHAR(32) NOT NULL,
        teacher_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    sql`CREATE TABLE IF NOT EXISTS trail_nodes (
        id SERIAL PRIMARY KEY,
        node_key VARCHAR(64) UNIQUE NOT NULL,
        title VARCHAR(128) NOT NULL,
        biome VARCHAR(64) NOT NULL,
        order_index INTEGER NOT NULL,
        icon VARCHAR(64) NOT NULL,
        lesson_type VARCHAR(32) NOT NULL
    )`,
    sql`CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        node_id INTEGER REFERENCES trail_nodes(id) ON DELETE CASCADE,
        type VARCHAR(32) NOT NULL,
        prompt_ba TEXT NOT NULL,
        prompt_ru TEXT NOT NULL,
        audio_text TEXT,
        correct_answer TEXT NOT NULL,
        options JSONB,
        word_bank JSONB
    )`,
    sql`CREATE TABLE IF NOT EXISTS translation_fragments (
        id SERIAL PRIMARY KEY,
        fragment_id VARCHAR(64) UNIQUE NOT NULL,
        text_ba TEXT NOT NULL,
        lang_pair VARCHAR(16) NOT NULL DEFAULT 'ba-ru',
        translation TEXT NOT NULL,
        source_title VARCHAR(255) NOT NULL,
        source_chapter VARCHAR(128),
        source_timecode VARCHAR(32),
        confirmed_count INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'new',
        difficulty_level INTEGER NOT NULL DEFAULT 1,
        expert_notes TEXT,
        expert_decided_by INTEGER,
        expert_decided_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    sql`CREATE TABLE IF NOT EXISTS translation_votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        fragment_id INTEGER REFERENCES translation_fragments(id) ON DELETE CASCADE,
        action VARCHAR(16) NOT NULL,
        suggested_text TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    sql`CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(128) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(64) NOT NULL,
        category VARCHAR(32) NOT NULL,
        target_val INTEGER NOT NULL
    )`,
    sql`CREATE TABLE IF NOT EXISTS user_achievements (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_id VARCHAR(64) REFERENCES achievements(id) ON DELETE CASCADE,
        unlocked BOOLEAN DEFAULT FALSE,
        progress INTEGER DEFAULT 0,
        unlocked_at TIMESTAMP WITH TIME ZONE,
        PRIMARY KEY(user_id, achievement_id)
    )`,

    
    sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS district VARCHAR(128) DEFAULT 'Уфа'`,
    sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'admin'`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS login VARCHAR(64) UNIQUE`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_linked BOOLEAN DEFAULT FALSE`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(64)`,
    sql`ALTER TABLE users ALTER COLUMN telegram_id DROP NOT NULL`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS selected_lang_pair VARCHAR(16) DEFAULT 'ba-ru'`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS corrections_count INTEGER DEFAULT 0`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmations_count INTEGER DEFAULT 0`,
    sql`ALTER TABLE translation_fragments ADD COLUMN IF NOT EXISTS expert_notes TEXT`,
    sql`ALTER TABLE translation_fragments ADD COLUMN IF NOT EXISTS expert_decided_by INTEGER`,
    sql`ALTER TABLE translation_fragments ADD COLUMN IF NOT EXISTS expert_decided_at TIMESTAMP WITH TIME ZONE`,

    
    sql`CREATE INDEX IF NOT EXISTS idx_fragments_status ON translation_fragments(status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_fragments_lang_pair ON translation_fragments(lang_pair)`,
    sql`CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_name)`
];

try {
    for (const stmt of statements) {
        await stmt;
    }
    console.log('Database tables successfully migrated');
} catch (e: unknown) {
    console.error('Migration failed:', e);
    process.exit(1);
} finally {
    await sql.close();
}
