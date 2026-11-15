import { sql } from '../db';

export async function handleShopBuy(req: Request): Promise<Response> {
    try {
        const body = await req.json() as { user_id?: number; item_id: string };
        const uid = body.user_id || 1;
        const itemId = body.item_id;

        const users = await sql`SELECT honey_drops, streak_freeze_count, hearts FROM users WHERE id = ${uid}`;
        if (users.length === 0) return Response.json({ status: 'error', message: 'User not found' }, { status: 404 });
        const user = users[0];

        if (itemId === 'freeze') {
            const cost = 50;
            if (user.honey_drops < cost) return Response.json({ status: 'error', message: 'Not enough honey drops' }, { status: 400 });
            await sql`
                UPDATE users
                SET honey_drops = honey_drops - ${cost},
                    streak_freeze_count = streak_freeze_count + 1
                WHERE id = ${uid}
            `;
            return Response.json({ status: 'ok', item: 'freeze', honey_drops: user.honey_drops - cost, streak_freeze_count: user.streak_freeze_count + 1 });
        }

        if (itemId === 'refill_hearts') {
            const cost = 25;
            if (user.honey_drops < cost) return Response.json({ status: 'error', message: 'Not enough honey drops' }, { status: 400 });
            await sql`
                UPDATE users
                SET honey_drops = honey_drops - ${cost},
                    hearts = 5
                WHERE id = ${uid}
            `;
            return Response.json({ status: 'ok', item: 'refill_hearts', honey_drops: user.honey_drops - cost, hearts: 5 });
        }

        return Response.json({ status: 'error', message: 'Unknown item or WIP' }, { status: 400 });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}
