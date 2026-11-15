import { SQL } from 'bun';

const sql = new SQL(process.env.DATABASE_URL || 'postgres://bashkling_user:bashkling_password@127.0.0.1:5433/bashkling_db');

const statements = [
    sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS district VARCHAR(128) DEFAULT 'Уфа'`,
    sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,

    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'student'`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS selected_lang_pair VARCHAR(16) DEFAULT 'ba-ru'`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS corrections_count INTEGER DEFAULT 0`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmations_count INTEGER DEFAULT 0`,

    sql`CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
        name VARCHAR(32) NOT NULL,
        teacher_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    sql`ALTER TABLE translation_fragments ADD COLUMN IF NOT EXISTS expert_notes TEXT`,
    sql`ALTER TABLE translation_fragments ADD COLUMN IF NOT EXISTS expert_decided_by INTEGER`,
    sql`ALTER TABLE translation_fragments ADD COLUMN IF NOT EXISTS expert_decided_at TIMESTAMP WITH TIME ZONE`,

    sql`CREATE INDEX IF NOT EXISTS idx_fragments_status ON translation_fragments(status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_name)`
];

try {
    for (const stmt of statements) {
        await stmt;
    }
    console.log('Advanced schema migration completed successfully');
} catch (e: unknown) {
    console.error('Advanced migration error:', e);
    process.exit(1);
} finally {
    await sql.close();
}
