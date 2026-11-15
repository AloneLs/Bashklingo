import { sql } from '../db';

export async function handleTrailNodes(_: Request): Promise<Response> {
    try {
        const nodes = await sql`
            SELECT id, node_key, title, biome, order_index, icon, lesson_type
            FROM trail_nodes
            ORDER BY order_index ASC
        `;
        return Response.json({ status: 'ok', nodes });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}

export async function handleTrailQuestions(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const nodeId = Number(url.searchParams.get('node_id') || '1');
        const questions = await sql`
            SELECT id, node_id, type, prompt_ba, prompt_ru, audio_text, correct_answer, options, word_bank
            FROM questions
            WHERE node_id = ${nodeId}
            ORDER BY id ASC
        `;
        return Response.json({ status: 'ok', questions });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}

export async function handleTrailSubmit(req: Request): Promise<Response> {
    try {
        const body = await req.json() as {
            user_id?: number;
            node_id?: number;
            correct_count?: number;
            total_count?: number;
            words_learned_increment?: number;
        };
        const uid = body.user_id || 1;
        const correct = body.correct_count || 5;
        const total = body.total_count || 5;
        const wordsInc = body.words_learned_increment || 3;
        const accuracy = Math.round((correct / Math.max(1, total)) * 100);
        const honeyReward = correct * 4;
        const xpReward = correct * 10;

        await sql`
            UPDATE users
            SET honey_drops = honey_drops + ${honeyReward},
                explorer_xp = explorer_xp + ${xpReward},
                words_learned = words_learned + ${wordsInc},
                accuracy_percent = ROUND((accuracy_percent + ${accuracy}) / 2),
                last_active_date = CURRENT_DATE
            WHERE id = ${uid}
        `;

        await sql`
            INSERT INTO user_achievements (user_id, achievement_id, unlocked, progress, unlocked_at)
            VALUES (${uid}, 'first_step', true, 1, NOW())
            ON CONFLICT (user_id, achievement_id) DO UPDATE SET unlocked = true, progress = 1
        `;

        return Response.json({
            status: 'ok',
            honey_reward: honeyReward,
            xp_reward: xpReward,
            accuracy
        });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}
