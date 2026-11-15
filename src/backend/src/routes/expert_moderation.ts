import { sql } from '../db';

export async function handleExpertReviewList(_: Request): Promise<Response> {
    try {
        const disputed = await sql`
            SELECT f.id, f.fragment_id, f.text_ba, f.lang_pair, f.translation, f.source_title, f.source_chapter, f.source_timecode,
                   f.confirmed_count, f.status, f.expert_notes,
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'user_id', v.user_id,
                               'action', v.action,
                               'suggested_text', v.suggested_text,
                               'created_at', v.created_at
                           )
                       ) FILTER (WHERE v.id IS NOT NULL), '[]'
                   ) as user_votes
            FROM translation_fragments f
            LEFT JOIN translation_votes v ON f.id = v.fragment_id
            WHERE f.status = 'expert_review'
            GROUP BY f.id
            ORDER BY f.id DESC
        `;

        return Response.json({
            status: 'ok',
            total_disputed: disputed.length,
            disputed_fragments: disputed
        });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}

export async function handleExpertDecision(req: Request): Promise<Response> {
    try {
        const body = await req.json() as {
            fragment_id: number;
            expert_id?: number;
            final_translation: string;
            expert_notes?: string;
        };

        const fid = body.fragment_id;
        const expertId = body.expert_id || 1;
        const finalTranslation = body.final_translation?.trim();
        const notes = body.expert_notes?.trim() || 'Утверждено экспертным советом лингвистов УФИЦ РАН';

        if (!fid || !finalTranslation) return Response.json({ status: 'error', message: 'ID фрагмента и финальный перевод обязательны' }, { status: 400 });

        await sql`
            UPDATE translation_fragments
            SET translation = ${finalTranslation},
                status = 'confirmed',
                expert_notes = ${notes},
                expert_decided_by = ${expertId},
                expert_decided_at = NOW()
            WHERE id = ${fid}
        `;

        return Response.json({
            status: 'ok',
            fragment_id: fid,
            final_translation: finalTranslation,
            message: 'Финальный перевод утверждён и зафиксирован в академическом корпусе'
        });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}
