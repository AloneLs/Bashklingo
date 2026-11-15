import { sql } from '../db';

export async function handleDailyTranslation(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const langPair = url.searchParams.get('lang_pair') || 'ba-ru';
        const fragments = await sql`
            SELECT id, fragment_id, text_ba, lang_pair, translation, source_title, source_chapter, source_timecode, confirmed_count, status
            FROM translation_fragments
            WHERE lang_pair = ${langPair}
            ORDER BY RANDOM()
            LIMIT 1
        `;
        if (fragments.length === 0) return Response.json({ status: 'error', message: 'Фрагменты не найдены' }, { status: 404 });
        return Response.json({ status: 'ok', fragment: fragments[0] });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}

export async function handleTranslationVote(req: Request): Promise<Response> {
    try {
        const body = await req.json() as {
            user_id?: number;
            fragment_id: number;
            action: 'confirm' | 'suggest_edit';
            suggested_text?: string;
        };
        const uid = body.user_id || 1;
        const fid = body.fragment_id;
        const action = body.action || 'confirm';
        const suggested = body.suggested_text || '';

        await sql`
            INSERT INTO translation_votes (user_id, fragment_id, action, suggested_text)
            VALUES (${uid}, ${fid}, ${action}, ${suggested})
        `;

        if (action === 'confirm') {
            await sql`
                UPDATE translation_fragments
                SET confirmed_count = confirmed_count + 1,
                    status = CASE WHEN confirmed_count + 1 >= 5 THEN 'confirmed' ELSE status END
                WHERE id = ${fid}
            `;
            await sql`
                UPDATE users
                SET honey_drops = honey_drops + 10,
                    guide_xp = guide_xp + 15,
                    confirmations_count = confirmations_count + 1
                WHERE id = ${uid}
            `;
        } else {
            await sql`
                UPDATE translation_fragments
                SET status = 'expert_review'
                WHERE id = ${fid}
            `;
            await sql`
                UPDATE users
                SET honey_drops = honey_drops + 20,
                    guide_xp = guide_xp + 35,
                    corrections_count = corrections_count + 1
                WHERE id = ${uid}
            `;
        }

        return Response.json({ status: 'ok', action, message: 'Голос успешно зафиксирован в базе консенсуса' });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}

export async function handleTranslationExport(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const format = url.searchParams.get('format') || 'json';
        const langPair = url.searchParams.get('lang_pair');
        const statusFilter = url.searchParams.get('status');

        let rows;
        if (langPair && statusFilter) {
            rows = await sql`
                SELECT fragment_id, text_ba, lang_pair, translation, source_title, source_chapter, source_timecode, confirmed_count, status, expert_notes
                FROM translation_fragments
                WHERE lang_pair = ${langPair} AND status = ${statusFilter}
                ORDER BY id ASC
            `;
        } else if (langPair) {
            rows = await sql`
                SELECT fragment_id, text_ba, lang_pair, translation, source_title, source_chapter, source_timecode, confirmed_count, status, expert_notes
                FROM translation_fragments
                WHERE lang_pair = ${langPair}
                ORDER BY id ASC
            `;
        } else if (statusFilter) {
            rows = await sql`
                SELECT fragment_id, text_ba, lang_pair, translation, source_title, source_chapter, source_timecode, confirmed_count, status, expert_notes
                FROM translation_fragments
                WHERE status = ${statusFilter}
                ORDER BY id ASC
            `;
        } else {
            rows = await sql`
                SELECT fragment_id, text_ba, lang_pair, translation, source_title, source_chapter, source_timecode, confirmed_count, status, expert_notes
                FROM translation_fragments
                ORDER BY id ASC
            `;
        }

        if (format === 'csv') {
            let csv = '\uFEFFfragment_id,text_ba,lang_pair,translation,source,chapter,timecode,confirmed,status,expert_notes\n';
            for (const r of rows) {
                const textBa = `"${String(r.text_ba || '').replace(/"/g, '""')}"`;
                const textTr = `"${String(r.translation || '').replace(/"/g, '""')}"`;
                const src = `"${String(r.source_title || '').replace(/"/g, '""')}"`;
                const chap = `"${String(r.source_chapter || '').replace(/"/g, '""')}"`;
                const time = `"${String(r.source_timecode || '').replace(/"/g, '""')}"`;
                const notes = `"${String(r.expert_notes || '').replace(/"/g, '""')}"`;
                csv += `${r.fragment_id},${textBa},${r.lang_pair},${textTr},${src},${chap},${time},${r.confirmed_count},${r.status},${notes}\n`;
            }
            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="bashkir_corpus_export.csv"'
                }
            });
        }

        return Response.json({
            status: 'ok',
            total_count: rows.length,
            corpus: rows
        });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}
