import { sql } from '../db';

export async function handleSchoolsList(_: Request): Promise<Response> {
    try {
        const schools = await sql`SELECT id, name, city, district, total_score FROM schools ORDER BY city ASC, name ASC`;
        return Response.json({ status: 'ok', schools });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}

export async function handleSchoolRegister(req: Request): Promise<Response> {
    try {
        const body = await req.json() as { name: string; city: string; district?: string };
        const name = body.name?.trim();
        const city = body.city?.trim();
        const district = body.district?.trim() || city;

        if (!name || !city) return Response.json({ status: 'error', message: 'Название школы и город обязательны' }, { status: 400 });

        const existing = await sql`SELECT id FROM schools WHERE LOWER(name) = LOWER(${name}) AND LOWER(city) = LOWER(${city})`;
        if (existing.length > 0) return Response.json({ status: 'ok', school_id: existing[0].id, message: 'Школа уже зарегистрирована' });

        const result = await sql`
            INSERT INTO schools (name, city, district, total_score)
            VALUES (${name}, ${city}, ${district}, 0)
            RETURNING id, name, city, district
        `;

        return Response.json({ status: 'ok', school: result[0], message: 'Школа успешно зарегистрирована в системе' });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}

export async function handleUserRegister(req: Request): Promise<Response> {
    try {
        const body = await req.json() as {
            telegram_id: number;
            username?: string;
            first_name: string;
            role?: 'student' | 'teacher' | 'linguist_expert';
            school_id?: number;
            class_name?: string;
            selected_lang_pair?: string;
        };

        const tid = body.telegram_id;
        const name = body.first_name?.trim() || 'Пользователь';
        const username = body.username?.trim() || '';
        const role = body.role || 'student';
        const schoolId = body.school_id || 1;
        const className = body.class_name?.trim() || '7А';
        const langPair = body.selected_lang_pair || 'ba-ru';

        if (!tid) return Response.json({ status: 'error', message: 'telegram_id обязателен' }, { status: 400 });

        const existing = await sql`SELECT id FROM users WHERE telegram_id = ${tid}`;
        if (existing.length > 0) {
            await sql`
                UPDATE users
                SET first_name = ${name},
                    username = ${username},
                    role = ${role},
                    school_id = ${schoolId},
                    class_name = ${className},
                    selected_lang_pair = ${langPair}
                WHERE telegram_id = ${tid}
            `;
            const updated = await sql`SELECT * FROM users WHERE telegram_id = ${tid}`;
            return Response.json({ status: 'ok', user: updated[0], message: 'Профиль обновлен' });
        }

        const result = await sql`
            INSERT INTO users (telegram_id, username, first_name, role, school_id, class_name, selected_lang_pair, streak_days, honey_drops, words_learned, accuracy_percent, explorer_xp, guide_xp, hearts, streak_freeze_count)
            VALUES (${tid}, ${username}, ${name}, ${role}, ${schoolId}, ${className}, ${langPair}, 1, 100, 14, 95, 120, 35, 5, 1)
            RETURNING *
        `;

        return Response.json({ status: 'ok', user: result[0], message: 'Регистрация успешно завершена' });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}
