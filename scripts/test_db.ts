import { SQL } from 'bun';

const urls = [
    'postgres://bashkling_user:bashkling_password@127.0.0.1:5433/bashkling_db',
    'postgres://postgres:postgres@127.0.0.1:5433/postgres',
    'postgres://postgres:root@127.0.0.1:5433/postgres',
    'postgres://postgres:1234@127.0.0.1:5433/postgres',
    'postgres://postgres:123456@127.0.0.1:5433/postgres',
    'postgres://postgres@127.0.0.1:5433/postgres'
];

for (const url of urls) {
    try {
        const sql = new SQL(url);
        const res = await sql`SELECT 1 as num`;
        console.log('SUCCESS with URL:', url, res);
        await sql.close();
        break;
    } catch (e: unknown) {
        console.error('FAILED with URL:', url, (e as Error).message);
    }
}
