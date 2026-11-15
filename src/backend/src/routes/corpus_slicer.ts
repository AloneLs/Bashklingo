import { sql } from '../db';
import { createHash } from 'node:crypto';

export async function handleCorpusSlice(req: Request): Promise<Response> {
    try {
        const body = await req.json() as {
            text_ba: string;
            source_title: string;
            source_chapter?: string;
            source_timecode?: string;
            lang_pair?: string;
            translation?: string;
        };

        const rawText = body.text_ba?.trim();
        const sourceTitle = body.source_title?.trim() || 'Источник без названия';
        const chapter = body.source_chapter?.trim() || 'Глава 1';
        const timecode = body.source_timecode?.trim() || '';
        const langPair = body.lang_pair || 'ba-ru';
        const rawTranslation = body.translation?.trim() || '';

        if (!rawText) return Response.json({ status: 'error', message: 'Текст на башкирском обязателен для нарезки' }, { status: 400 });

        const rawSentences = rawText.match(/[^.!?]+[.!?]+/g) || [rawText];
        const rawTrSentences = rawTranslation ? (rawTranslation.match(/[^.!?]+[.!?]+/g) || [rawTranslation]) : [];

        const createdFragments = [];

        for (let i = 0; i < rawSentences.length; i++) {
            const sentenceBa = rawSentences[i].trim();
            if (sentenceBa.length < 5) continue;

            const sentenceTr = rawTrSentences[i] ? rawTrSentences[i].trim() : `[Автоперевод] ${sentenceBa}`;
            const hash = createHash('md5').update(`${sourceTitle}_${chapter}_${i}_${sentenceBa}`).digest('hex').substring(0, 10).toUpperCase();
            const fragmentId = `FRAG_${hash}`;

            await sql`
                INSERT INTO translation_fragments (fragment_id, text_ba, lang_pair, translation, source_title, source_chapter, source_timecode, confirmed_count, status, difficulty_level)
                VALUES (${fragmentId}, ${sentenceBa}, ${langPair}, ${sentenceTr}, ${sourceTitle}, ${chapter}, ${timecode}, 0, 'new', 1)
                ON CONFLICT (fragment_id) DO UPDATE SET text_ba = EXCLUDED.text_ba, translation = EXCLUDED.translation
            `;

            createdFragments.push({
                fragment_id: fragmentId,
                text_ba: sentenceBa,
                translation: sentenceTr,
                source_title: sourceTitle,
                source_chapter: chapter
            });
        }

        return Response.json({
            status: 'ok',
            total_sliced: createdFragments.length,
            fragments: createdFragments
        });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}
