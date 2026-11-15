import { SQL } from 'bun';

const sql = new SQL(process.env.DATABASE_URL || 'postgres://bashkling_user:bashkling_password@127.0.0.1:5433/bashkling_db');

const statements = [
    sql`CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(128) NOT NULL,
        total_score INTEGER DEFAULT 0
    )`,
    sql`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(64),
        first_name VARCHAR(128),
        school_id INTEGER REFERENCES schools(id),
        class_name VARCHAR(32) DEFAULT '7А',
        streak_days INTEGER DEFAULT 1,
        honey_drops INTEGER DEFAULT 100,
        words_learned INTEGER DEFAULT 14,
        accuracy_percent INTEGER DEFAULT 95,
        explorer_xp INTEGER DEFAULT 120,
        guide_xp INTEGER DEFAULT 35,
        hearts INTEGER DEFAULT 5,
        streak_freeze_count INTEGER DEFAULT 1,
        last_active_date DATE DEFAULT CURRENT_DATE,
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
    )`
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
