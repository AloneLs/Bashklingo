import { SQL } from 'bun';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: bun scripts/import_corpus.ts <path/to/ba_ru.jsonl>');
    process.exit(1);
}

const sql = new SQL(process.env.DATABASE_URL || 'postgres://bashkling_user:bashkling_password@127.0.0.1:5433/bashkling_db');

try {
    const rl = createInterface({
        input: createReadStream(filePath),
        crlfDelay: Infinity
    });

    let batchCount = 0;
    let totalImported = 0;
    const batch: Array<{ id: string; ba: string; ru: string; source: string }> = [];

    for await (const line of rl) {
        if (!line.trim()) continue;
        try {
            const item = JSON.parse(line);
            if (item.ba && item.ru) {
                batch.push({
                    id: String(item.id || `CORPUS_${totalImported + 1}`),
                    ba: item.ba.trim(),
                    ru: item.ru.trim(),
                    source: item.source || 'AigizK_Parallel_Corpus'
                });
            }
        } catch (_) {  }

        if (batch.length >= 1000) {
            await insertBatch(sql, batch);
            totalImported += batch.length;
            batchCount++;
            console.log(`Imported batch ${batchCount}: ${totalImported} items`);
            batch.length = 0;
        }
    }

    if (batch.length > 0) {
        await insertBatch(sql, batch);
        totalImported += batch.length;
        console.log(`Imported final batch: ${totalImported} total items`);
    }

    console.log(`Successfully completed import of ${totalImported} parallel sentences`);
} catch (e: unknown) {
    console.error('Import failed:', e);
} finally {
    await sql.close();
}

async function insertBatch(sqlInstance: SQL, items: Array<{ id: string; ba: string; ru: string; source: string }>): Promise<void> {
    for (const item of items) {
        await sqlInstance`
            INSERT INTO translation_fragments (fragment_id, text_ba, lang_pair, translation, source_title, status)
            VALUES (${item.id}, ${item.ba}, 'ba-ru', ${item.ru}, ${item.source}, 'new')
            ON CONFLICT (fragment_id) DO NOTHING
        `;
    }
}
