import { sql } from '../db';

export async function handleUserProfile(req: Request): Promise<Response> {
    try {
        const body = await req.json() as { telegram_id?: number; username?: string; first_name?: string };
        const tid = body.telegram_id || 100001;
        const username = body.username || 'aanagke';
        const firstName = body.first_name || 'Андрей';

        let users = await sql`SELECT * FROM users WHERE telegram_id = ${tid}`;
        if (users.length === 0) {
            await sql`
                INSERT INTO users (telegram_id, username, first_name, role, school_id, class_name, selected_lang_pair, streak_days, honey_drops, words_learned, accuracy_percent, explorer_xp, guide_xp, hearts, streak_freeze_count)
                VALUES (${tid}, ${username}, ${firstName}, 'admin', 1, '7А', 'ba-ru', 1, 92, 14, 95, 120, 35, 5, 1)
            `;
            users = await sql`SELECT * FROM users WHERE telegram_id = ${tid}`;
        }

        const user = users[0];
        const achievements = await sql`
            SELECT a.id, a.title, a.description, a.icon, a.category, a.target_val,
                   COALESCE(ua.unlocked, false) as unlocked,
                   COALESCE(ua.progress, 0) as progress
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ${user.id}
            ORDER BY a.target_val ASC
        `;

        return Response.json({
            status: 'ok',
            user: {
                id: user.id,
                telegram_id: user.telegram_id,
                username: user.username,
                first_name: user.first_name,
                role: user.role || 'admin',
                school_id: user.school_id || 1,
                class_name: user.class_name || '7А',
                selected_lang_pair: user.selected_lang_pair || 'ba-ru',
                streak_days: user.streak_days,
                honey_drops: user.honey_drops,
                words_learned: user.words_learned,
                accuracy_percent: user.accuracy_percent,
                explorer_xp: user.explorer_xp,
                guide_xp: user.guide_xp,
                hearts: user.hearts,
                streak_freeze_count: user.streak_freeze_count
            },
            achievements
        });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}
