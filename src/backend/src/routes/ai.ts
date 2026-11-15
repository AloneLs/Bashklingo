import { askAiTutor } from '../ai';

export async function handleAiAsk(req: Request): Promise<Response> {
    try {
        const body = await req.json() as { question?: string; context?: string };
        const question = body.question || 'Башҡорт телендә үндәшлек законы нимә ул?';
        const context = body.context;
        const answer = await askAiTutor(question, context);
        return Response.json({ status: 'ok', question, answer });
    } catch (e: unknown) {
        return Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
    }
}
