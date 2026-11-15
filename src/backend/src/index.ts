import { handleUserProfile } from './routes/user';
import { handleUserRegister, handleSchoolRegister, handleSchoolsList } from './routes/registration';
import { handleTrailNodes, handleTrailQuestions, handleTrailSubmit } from './routes/trail';
import { handleDailyTranslation, handleTranslationVote, handleTranslationExport } from './routes/translations';
import { handleCorpusSlice } from './routes/corpus_slicer';
import { handleExpertReviewList, handleExpertDecision } from './routes/expert_moderation';
import { handleLeaderboard, handleClassReport } from './routes/leaderboard';
import { handleShopBuy } from './routes/shop';
import { handleAiAsk } from './routes/ai';
import { handleLogoAsset } from './routes/assets';
import { proxySynthesize } from './tts';

const PORT = Number(process.env.PORT || '8765');
const HOST = process.env.HOST || '0.0.0.0';

const rateLimitMap = new Map<string, { tokens: number; lastRefill: number }>();
const RATE_LIMIT_CAPACITY = 120;
const REFILL_RATE_MS = 1000;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip) || { tokens: RATE_LIMIT_CAPACITY, lastRefill: now };
    const elapsed = now - entry.lastRefill;
    if (elapsed > REFILL_RATE_MS) {
        entry.tokens = Math.min(RATE_LIMIT_CAPACITY, entry.tokens + Math.floor(elapsed / REFILL_RATE_MS) * 10);
        entry.lastRefill = now;
    }
    if (entry.tokens <= 0) return false;
    entry.tokens -= 1;
    rateLimitMap.set(ip, entry);
    return true;
}

const server = Bun.serve({
    port: PORT,
    hostname: HOST,
    async fetch(req: Request) {
        const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
        if (!checkRateLimit(clientIp)) {
            return new Response(JSON.stringify({ status: 'error', message: 'Too many requests' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        if (req.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }

        const url = new URL(req.url);
        const path = url.pathname;

        let response: Response;

        if (path === '/health') {
            response = Response.json({ status: 'ok', server: 'Basklingo Bun Backend v2.0', timestamp: new Date().toISOString() });
        } else if (path === '/api/user/profile' && req.method === 'POST') {
            response = await handleUserProfile(req);
        } else if (path === '/api/user/register' && req.method === 'POST') {
            response = await handleUserRegister(req);
        } else if (path === '/api/schools/list' && req.method === 'GET') {
            response = await handleSchoolsList(req);
        } else if (path === '/api/schools/register' && req.method === 'POST') {
            response = await handleSchoolRegister(req);
        } else if (path === '/api/trail/nodes' && req.method === 'GET') {
            response = await handleTrailNodes(req);
        } else if (path === '/api/trail/questions' && req.method === 'GET') {
            response = await handleTrailQuestions(req);
        } else if (path === '/api/trail/submit' && req.method === 'POST') {
            response = await handleTrailSubmit(req);
        } else if (path === '/api/translations/daily' && req.method === 'GET') {
            response = await handleDailyTranslation(req);
        } else if (path === '/api/translations/vote' && req.method === 'POST') {
            response = await handleTranslationVote(req);
        } else if (path === '/api/translations/export' && req.method === 'GET') {
            response = await handleTranslationExport(req);
        } else if (path === '/api/corpus/slice' && req.method === 'POST') {
            response = await handleCorpusSlice(req);
        } else if (path === '/api/translations/expert-review' && req.method === 'GET') {
            response = await handleExpertReviewList(req);
        } else if (path === '/api/translations/expert-decision' && req.method === 'POST') {
            response = await handleExpertDecision(req);
        } else if (path === '/api/leaderboard' && req.method === 'GET') {
            response = await handleLeaderboard(req);
        } else if (path === '/api/lms/class-report' && req.method === 'GET') {
            response = await handleClassReport(req);
        } else if (path === '/api/shop/buy' && req.method === 'POST') {
            response = await handleShopBuy(req);
        } else if (path === '/api/ai/ask' && req.method === 'POST') {
            response = await handleAiAsk(req);
        } else if (path === '/api/assets/logo' && req.method === 'GET') {
            response = await handleLogoAsset(req);
        } else if (path === '/api/tts/synthesize' && req.method === 'POST') {
            try {
                const body = await req.json() as { text?: string; lang?: string; voice?: string; speed?: number };
                const res = await proxySynthesize(body.text || '', body.lang, body.voice, body.speed);
                response = Response.json(res);
            } catch (e: unknown) {
                response = Response.json({ status: 'error', message: (e as Error).message }, { status: 500 });
            }
        } else {
            response = Response.json({ status: 'error', message: `Route ${path} not found` }, { status: 404 });
        }

        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
    }
});

console.log(`Basklingo Bun Backend running on http://${HOST}:${PORT}`);
