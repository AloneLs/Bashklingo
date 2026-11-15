import { SQL } from 'bun';

export const sql = new SQL(process.env.DATABASE_URL || 'postgres://bashkling_user:bashkling_password@127.0.0.1:5433/bashkling_db');
