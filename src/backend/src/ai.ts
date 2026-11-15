const API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-43acd8edcac64d421fb640b481897530e97c068a576f18dd';
const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.reformboss.com/v1';
const MODEL_ID = process.env.MODEL_ID || 'deepseek-ai/DeepSeek-V4.1-Flash';

const SYSTEM_PROMPT = `Sen — "Tel-Ostahy" (Тел-Остаһы), Basklingo platformahynyn bashkort tele buyynsa shakhsi AI-tyutory.
Hinam bashkort tele grammaticahyn, singarmonizm zakondaryn, 9 ayyrym khareften (ә, ө, ү, ҡ, ғ, ҙ, ҫ, һ, ң) dores qullanylyshyn anlatahahyn.
Otvechay na russkom i bashkirskom yazykakh lakonichno, druzhelyubno, strogo po teme uroka. Объясняй грамматику доступно для школьников.`;

const LOCAL_FALLBACKS: Record<string, string> = {
    'үндәшлек': 'Башҡорт телендә үндәшлек (сингармонизм) законы буйынса һүҙҙә йә бөтә һуҙынҡылар ҡалын (а, о, у, ы), йә йомшаҡ (ә, ө, ү, и, е) була. Мәҫәлән: бала-лар, өй-ҙәр.',
    'сингармонизм': 'Закон сингармонизма: гласные в слове бывают либо только твердыми (а, о, у, ы), либо только мягкими (ә, ө, ү, и, е). Окончания подбираются соответственно.',
    'ялғау': 'Күплек ялғауҙары 8 төрлө: -лар/-ләр, -тар/-тәр, -дар/-дәр, -ҙар/-ҙәр. Һүҙҙең һуңғы өнөнә ҡарап ялғана: тау-ҙар, ҡул-дар, ат-тар, сәскә-ләр.',
    'аффикс': 'Аффиксы множественного числа зависят от последнего звука: после гласных и звонких согласных ставятся -лар/-ләр или -ҙар/-ҙәр, после глухих — -тар/-тәр.',
    'һаумыһығыҙ': '«Һаумыһығыҙ» — уважительное приветствие («здравствуйте»), обращение к старшим или группе людей. «Сәләм» — неформальное «привет».',
    'default': '«Тел-Остаһы» кәңәше: Башҡорт телен өйрәнгәндә 9 үҙенсәлекле хәрефте (ә, ө, ү, ҡ, ғ, ҙ, ҫ, һ, ң) дөрөҫ әйтергә һәм яҙырға өйрәнеү бик мөһим!'
};

export async function askAiTutor(question: string, context?: string): Promise<string> {
    const qLower = question.toLowerCase();
    for (const [key, fallback] of Object.entries(LOCAL_FALLBACKS)) {
        if (key !== 'default' && qLower.includes(key)) return fallback;
    }

    let delay = 300;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const response = await fetch(`${BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL_ID,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: context ? `Контекст урока: ${context}\nВопрос ученика: ${question}` : question }
                    ],
                    temperature: 0.3,
                    max_tokens: 350
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
            const answer = data.choices?.[0]?.message?.content?.trim();
            if (answer) return answer;
        } catch (_) {
            /* ignored */
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
    return LOCAL_FALLBACKS['default'];
}
