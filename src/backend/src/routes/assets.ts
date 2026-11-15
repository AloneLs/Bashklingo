const LOGO_PATH = process.env.LOGO_PATH || 'C:/Users/User/Downloads/лого.png';

export async function handleLogoAsset(_: Request): Promise<Response> {
    try {
        const file = Bun.file(LOGO_PATH);
        if (await file.exists()) {
            return new Response(file, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400'
                }
            });
        }
    } catch (_) {  }

    const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="48" fill="#025E73"/>
        <circle cx="50" cy="50" r="14" fill="#B45309"/>
        <circle cx="50" cy="22" r="7" fill="#FBFBFA"/>
        <circle cx="74" cy="34" r="7" fill="#FBFBFA"/>
        <circle cx="74" cy="66" r="7" fill="#FBFBFA"/>
        <circle cx="50" cy="78" r="7" fill="#FBFBFA"/>
        <circle cx="26" cy="66" r="7" fill="#FBFBFA"/>
        <circle cx="26" cy="34" r="7" fill="#FBFBFA"/>
        <circle cx="50" cy="36" r="5" fill="#D97706"/>
    </svg>`;
    return new Response(svgFallback, {
        headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400'
        }
    });
}
