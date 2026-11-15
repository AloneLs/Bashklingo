const TTS_SERVICE_URL = process.env.TTS_SERVICE_URL || 'http://127.0.0.1:8766';

export async function proxySynthesize(text: string, lang = 'ba', voice = 'bak_aigul', speed = 1.25): Promise<{ audio_url?: string; error?: string }> {
    try {
        const response = await fetch(`${TTS_SERVICE_URL}/synthesize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, lang, voice, speed })
        });
        if (!response.ok) return { error: `TTS service returned ${response.status}` };
        const data = await response.json() as { audio_url?: string; filename?: string };
        return { audio_url: `${TTS_SERVICE_URL}${data.audio_url}` };
    } catch (_) {
        /* ignored */
        return { error: 'TTS service offline' };
    }
}
