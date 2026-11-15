import { SQL } from 'bun';

const rootSql = new SQL('postgres://postgres:postgres@127.0.0.1:5433/postgres');

try {
    const roles = await rootSql`SELECT rolname FROM pg_roles WHERE rolname = 'bashkling_user'`;
    if (roles.length === 0) {
        await rootSql`CREATE ROLE bashkling_user WITH LOGIN PASSWORD 'bashkling_password' SUPERUSER`;
        console.log('Role bashkling_user created');
    }
    const dbs = await rootSql`SELECT datname FROM pg_database WHERE datname = 'bashkling_db'`;
    if (dbs.length === 0) {
        await rootSql`CREATE DATABASE bashkling_db OWNER bashkling_user`;
        console.log('Database bashkling_db created');
    }
    console.log('Postgres setup completed successfully');
} catch (e: unknown) {
    console.error('Setup error:', e);
} finally {
    await rootSql.close();
}
