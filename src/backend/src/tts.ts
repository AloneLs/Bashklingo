import { join } from 'path';

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
        const filename = data.filename || (data.audio_url ? data.audio_url.split('/').pop() : '');
        
        return { audio_url: `/api/tts/audio/${filename}` };
    } catch (_) {
        return { error: 'TTS service offline' };
    }
}

export async function serveAudioFile(filename: string): Promise<Response> {
    const safeName = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '');
    if (!safeName) {
        return Response.json({ status: 'error', message: 'Invalid filename' }, { status: 400 });
    }

    
    const localPath = join(process.cwd(), 'services', 'tts', 'cache', safeName);
    const file = Bun.file(localPath);
    if (await file.exists()) {
        const ext = safeName.split('.').pop() || '';
        const contentType = ext === 'mp3' ? 'audio/mpeg' : ext === 'ogg' ? 'audio/ogg' : 'audio/wav';
        return new Response(file, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    
    try {
        const ttsRes = await fetch(`${TTS_SERVICE_URL}/audio/${safeName}`);
        if (ttsRes.ok) {
            const blob = await ttsRes.blob();
            const contentType = ttsRes.headers.get('Content-Type') || 'audio/mpeg';
            return new Response(blob, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=86400',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    } catch (_) {
        
    }

    return Response.json({ status: 'error', message: 'Audio file not found' }, { status: 404 });
}
