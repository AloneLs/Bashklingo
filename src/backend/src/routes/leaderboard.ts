import { sql } from '../db';

export async function handleLeaderboard(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const sortBy = url.searchParams.get('sort_by') || 'score';

        let users;
        if (sortBy === 'vocabulary') {
            users = await sql`
                SELECT u.id, u.first_name, u.username, u.class_name, u.words_learned, u.accuracy_percent, u.streak_days, u.honey_drops,
                       s.name as school_name, s.city
                FROM users u
                LEFT JOIN schools s ON u.school_id = s.id
                ORDER BY u.words_learned DESC, u.accuracy_percent DESC
                LIMIT 25
            `;
        } else if (sortBy === 'corrections') {
            users = await sql`
                SELECT u.id, u.first_name, u.username, u.class_name, u.corrections_count, u.accuracy_percent, u.guide_xp, u.honey_drops,
                       s.name as school_name, s.city
                FROM users u
                LEFT JOIN schools s ON u.school_id = s.id
                ORDER BY u.corrections_count DESC, u.accuracy_percent DESC
                LIMIT 25
            `;
        } else if (sortBy === 'streak') {
            users = await sql`
                SELECT u.id, u.first_name, u.username, u.class_name, u.streak_days, u.accuracy_percent, u.honey_drops,
                       s.name as school_name, s.city
                FROM users u
                LEFT JOIN schools s ON u.school_id = s.id
                ORDER BY u.streak_days DESC, u.honey_drops DESC
                LIMIT 25
            `;
        } else {
            users = await sql`
                SELECT u.id, u.first_name, u.username, u.class_name, u.explorer_xp, u.guide_xp, (u.explorer_xp + u.guide_xp) as total_xp,
                       u.honey_drops, u.streak_days, u.words_learned, u.accuracy_percent,
                       s.name as school_name, s.city
                FROM users u
                LEFT JOIN schools s ON u.school_id = s.id
                ORDER BY (u.explorer_xp + u.guide_xp) DESC
                LIMIT 25
            `;
        }

        const schools = await sql`
            SELECT id, name, city, district, total_score
            FROM schools
            ORDER BY total_score DESC
            LIMIT 15
        `;

        const classes = await sql`
            SELECT u.class_name, s.name as school_name, s.city,
                   SUM(u.explorer_xp + u.guide_xp) as class_score,
                   COUNT(u.id) as students_count
            FROM users u
            LEFT JOIN schools s ON u.school_id = s.id
            GROUP BY u.class_name, s.name, s.city
            ORDER BY class_score DESC
            LIMIT 10
        `;

        return Response.json({
            status: 'ok',
            criteria: sortBy,
            users,
            schools,
            classes
        });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}

export async function handleClassReport(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const className = url.searchParams.get('class_name') || '7А';
        const schoolId = Number(url.searchParams.get('school_id') || '1');
        const format = (url.searchParams.get('format') || '').toLowerCase();

        const students = await sql`
            SELECT u.id, u.first_name, u.username, u.words_learned, u.accuracy_percent, u.streak_days,
                   u.corrections_count, u.confirmations_count, (u.explorer_xp + u.guide_xp) as total_xp,
                   u.last_active_date
            FROM users u
            WHERE u.class_name = ${className} AND (u.school_id = ${schoolId} OR u.school_id IS NULL)
            ORDER BY total_xp DESC
        `;

        const stats = await sql`
            SELECT AVG(u.accuracy_percent) as avg_accuracy,
                   AVG(u.words_learned) as avg_words,
                   SUM(u.corrections_count) as total_corrections,
                   SUM(u.confirmations_count) as total_confirmations
            FROM users u
            WHERE u.class_name = ${className}
        `;

        const safeClass = encodeURIComponent(className).replace(/%/g, '_') || 'report';
        if (format === 'csv') {
            const header = 'id,first_name,username,words_learned,accuracy_percent,streak_days,corrections_count,confirmations_count,total_xp,last_active_date\n';
            const rows = students.map((s: any) =>
                [
                    s.id,
                    `"${(s.first_name || '').replace(/"/g, '""')}"`,
                    `"${(s.username || '').replace(/"/g, '""')}"`,
                    s.words_learned ?? 0,
                    s.accuracy_percent ?? 0,
                    s.streak_days ?? 0,
                    s.corrections_count ?? 0,
                    s.confirmations_count ?? 0,
                    s.total_xp ?? 0,
                    s.last_active_date ? new Date(s.last_active_date).toISOString() : ''
                ].join(',')
            ).join('\n');

            return new Response('\uFEFF' + header + rows, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="class_${safeClass}_report.csv"`,
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        if (format === 'json' && url.searchParams.get('download') === 'true') {
            const data = {
                status: 'ok',
                class_name: className,
                exported_at: new Date().toISOString(),
                total_students: students.length,
                class_averages: stats[0] || {},
                students
            };
            return new Response(JSON.stringify(data, null, 2), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Disposition': `attachment; filename="class_${safeClass}_report.json"`,
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        return Response.json({
            status: 'ok',
            class_name: className,
            total_students: students.length,
            class_averages: stats[0] || {},
            students
        });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}
