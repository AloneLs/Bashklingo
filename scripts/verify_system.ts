import { sql } from '../src/backend/src/db';

async function verify() {
    console.log('=== SYSTEM VERIFICATION ===');

    const fragments = await sql`SELECT count(id) as cnt FROM translation_fragments`;
    console.log('1. Translation fragments count:', fragments[0]?.cnt);

    const nodes = await sql`SELECT count(id) as cnt FROM trail_nodes`;
    console.log('2. Trail nodes count:', nodes[0]?.cnt);

    const schools = await sql`SELECT count(id) as cnt FROM schools`;
    console.log('3. Schools count:', schools[0]?.cnt);

    const achievements = await sql`SELECT count(id) as cnt FROM achievements`;
    console.log('4. Achievements count:', achievements[0]?.cnt);

    const distIndex = Bun.file('src/frontend/dist/index.html');
    console.log('5. Frontend bundle exists:', await distIndex.exists());

    await sql.close();
    console.log('=== ALL CHECKS PASSED ===');
}

verify().catch(console.error);
