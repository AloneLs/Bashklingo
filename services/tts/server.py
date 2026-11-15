
from __future__ import annotations

import hashlib
import os
import shutil
import subprocess
import threading
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from xml.sax.saxutils import escape

import soundfile as sf
import torch
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
EXTERNAL_BOT_DIR = Path("C:/Users/User/Desktop/bashklingo-bot")

MODEL_CANDIDATES = [
    Path(os.environ.get("DAN_SILERO_MODEL", "")) if os.environ.get("DAN_SILERO_MODEL") else None,
    EXTERNAL_BOT_DIR / "models" / "silero" / "v5_cis_base_nostress.pt",
    BASE_DIR / "models" / "silero" / "v5_cis_base_nostress.pt",
    BASE_DIR / "models" / "v5_cis_base_nostress.pt",
    PROJECT_ROOT / "models" / "silero" / "v5_cis_base_nostress.pt",
]
MODEL_PATH = next((p for p in MODEL_CANDIDATES if p and p.exists() and p.stat().st_size > 50_000_000), None)
if MODEL_PATH is None:
    MODEL_PATH = BASE_DIR / "models" / "silero" / "v5_cis_base_nostress.pt"

MODEL_URL = "https://models.silero.ai/models/tts/ru/v5_cis_base_nostress.pt"

FFMPEG_CANDIDATES = [
    EXTERNAL_BOT_DIR / "ffmpeg-9.0.2-essentials_build" / "bin" / "ffmpeg.exe",
    EXTERNAL_BOT_DIR / "ffmpeg-9.0.2-essentials_build" / "ffmpeg.exe",
    BASE_DIR / "ffmpeg-9.0.2-essentials_build" / "bin" / "ffmpeg.exe",
    Path(os.environ.get("FFMPEG_EXE", "")) if os.environ.get("FFMPEG_EXE") else None,
]
FFMPEG_EXE = next((p for p in FFMPEG_CANDIDATES if p and p.exists()), None)
if not FFMPEG_EXE:
    system_ffmpeg = shutil.which("ffmpeg")
    FFMPEG_EXE = Path(system_ffmpeg) if system_ffmpeg else None

CACHE_DIR = BASE_DIR / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_TTS_VOICE = os.environ.get("DAN_TTS_VOICE", "bak_aigul")
DEFAULT_TTS_SPEED = float(os.environ.get("DAN_TTS_SPEED", "1.25"))
TTS_DEVICE = os.environ.get("DAN_TTS_DEVICE", "cpu")
TTS_SR = 48000
TTS_MAX_CHARS = int(os.environ.get("DAN_TTS_MAX_CHARS", "700"))

BASHKIR_VOICES = ["bak_aigul", "bak_alfia", "bak_alfia2", "bak_miyau", "bak_ramilia"]
RUSSIAN_VOICES = [
    "ru_aigul", "ru_albina", "ru_alexandr", "ru_alfia", "ru_alfia2",
    "ru_dmitriy", "ru_ekaterina", "ru_marat", "ru_miyau", "ru_ramilia",
    "ru_roman", "ru_vika"
]

_model = None
_model_lock = threading.Lock()
AVAILABLE_SPEAKERS: List[str] = []
TTS_READY = False
TTS_ERROR: Optional[str] = None


def clean_for_tts(text: str) -> str:
    if text is None:
        return ""
    text = str(text)
    for ch in ("*", "#", "`", '"', "«", "»", "_", "~"):
        text = text.replace(ch, "")
    text = text.replace("—", "-").replace("–", "-")
    text = " ".join(text.split())
    if len(text) > TTS_MAX_CHARS:
        text = text[:TTS_MAX_CHARS].rsplit(" ", 1)[0]
    return text.strip()


def ensure_model_file() -> Path:
    global MODEL_PATH
    if MODEL_PATH and MODEL_PATH.exists() and MODEL_PATH.stat().st_size > 50_000_000:
        return MODEL_PATH

    target_path = BASE_DIR / "models" / "silero" / "v5_cis_base_nostress.pt"
    target_path.parent.mkdir(parents=True, exist_ok=True)
    if not target_path.exists() or target_path.stat().st_size < 50_000_000:
        print(f"[TTS] Скачиваю модель Silero v5 (~92 МБ) в {target_path} ...", flush=True)
        torch.hub.download_url_to_file(MODEL_URL, str(target_path), progress=True)

    MODEL_PATH = target_path
    return MODEL_PATH


def load_silero_model():
    global _model, AVAILABLE_SPEAKERS, TTS_READY, TTS_ERROR
    with _model_lock:
        if _model is not None:
            return _model
        try:
            model_file = ensure_model_file()
            device = TTS_DEVICE
            if device == "cuda" and not torch.cuda.is_available():
                device = "cpu"

            torch.set_num_threads(min(8, torch.get_num_threads()))
            print(f"[TTS] Загружаю Silero v5 из {model_file} на {device}...", flush=True)

            model = torch.package.PackageImporter(str(model_file)).load_pickle("tts_models", "model")
            speakers = list(getattr(model, "speakers", []) or [])
            AVAILABLE_SPEAKERS = sorted(speakers)
            model.to(torch.device(device))

            _model = model
            TTS_READY = True
            TTS_ERROR = None
            print(f"[TTS] Silero v5 успешно загружен. Доступно голосов: {len(AVAILABLE_SPEAKERS)}", flush=True)
            return _model
        except Exception as e:
            TTS_ERROR = f"{type(e).__name__}: {e}"
            TTS_READY = False
            print(f"[TTS] Ошибка загрузки модели Silero: {e}", flush=True)
            return None


def resolve_voice(voice: Optional[str] = None, lang: str = "ba") -> str:
    v = (voice or "").strip().lower()
    speakers = AVAILABLE_SPEAKERS or (BASHKIR_VOICES + RUSSIAN_VOICES)

    if v in speakers:
        return v
    for sp in speakers:
        if sp.lower() == v:
            return sp

    if lang.lower().startswith("ba") or v.startswith("ba") or "bash" in v:
        for sp in BASHKIR_VOICES:
            if sp in speakers:
                return sp
        return "bak_aigul"

    if lang.lower().startswith("ru") or v.startswith("ru") or "rus" in v:
        for sp in RUSSIAN_VOICES:
            if sp in speakers:
                return sp
        return "ru_aigul"

    return DEFAULT_TTS_VOICE if DEFAULT_TTS_VOICE in speakers else (speakers[0] if speakers else "bak_aigul")


def synthesize_to_file(text: str, lang: str = "ba", voice: Optional[str] = None, speed: float = 1.25) -> Path:
    model = load_silero_model()
    if model is None:
        raise RuntimeError(TTS_ERROR or "Модель Silero TTS не загружена")

    cleaned_text = clean_for_tts(text)
    if not cleaned_text:
        raise ValueError("Пустой текст после очистки")

    target_voice = resolve_voice(voice, lang)
    speed_clamped = max(0.5, min(2.0, float(speed or DEFAULT_TTS_SPEED)))

    cache_hash = hashlib.sha256(f"{target_voice}_{speed_clamped:.2f}_{cleaned_text}".encode("utf-8")).hexdigest()
    out_mp3 = CACHE_DIR / f"{cache_hash}.mp3"
    out_wav = CACHE_DIR / f"{cache_hash}.wav"

    if out_mp3.exists():
        return out_mp3
    if out_wav.exists() and not FFMPEG_EXE:
        return out_wav

    with _model_lock:
        if abs(speed_clamped - 1.0) < 0.05:
            audio = model.apply_tts(text=cleaned_text, speaker=target_voice, sample_rate=TTS_SR)
        else:
            prosody_pct = round(speed_clamped * 100)
            ssml = f'<speak><prosody rate="{prosody_pct}%">{escape(cleaned_text)}</prosody></speak>'
            audio = model.apply_tts(ssml_text=ssml, speaker=target_voice, sample_rate=TTS_SR)

        audio_np = audio.detach().cpu().float().numpy()

    sf.write(str(out_wav), audio_np, TTS_SR)

    if FFMPEG_EXE and FFMPEG_EXE.exists():
        try:
            cmd = [
                str(FFMPEG_EXE), "-y", "-hide_banner", "-loglevel", "error",
                "-i", str(out_wav), "-b:a", "128k", str(out_mp3)
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if out_mp3.exists():
                return out_mp3
        except Exception as e:
            print(f"[TTS] Ошибка конвертации в MP3: {e}, отдаем WAV", flush=True)

    return out_wav



app = FastAPI(
    title="Basklingo Silero TTS Service",
    description="Высокопроизводительный микросервис синтеза башкирской и русской речи на базе Silero v5",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    threading.Thread(target=load_silero_model, daemon=True).start()


class SynthesizeRequest(BaseModel):
    text: str = Field(..., description="Текст на башкирском или русском для синтеза")
    lang: str = Field(default="ba", description="Код языка (ba, ru)")
    voice: Optional[str] = Field(default="bak_aigul", description="Голос (bak_aigul, bak_alfia, ru_aigul и др.)")
    speed: Optional[float] = Field(default=1.25, description="Скорость речи (0.5 - 2.0)")


@app.get("/")
def root():
    return {
        "service": "Basklingo Silero v5 TTS",
        "framework": "FastAPI",
        "status": "ready" if TTS_READY else ("loading" if not TTS_ERROR else "error"),
        "voices_count": len(AVAILABLE_SPEAKERS),
        "ffmpeg": bool(FFMPEG_EXE and FFMPEG_EXE.exists())
    }


@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "tts_ready": TTS_READY,
        "error": TTS_ERROR,
        "model_path": str(MODEL_PATH) if MODEL_PATH else None,
        "model_exists": bool(MODEL_PATH and MODEL_PATH.exists()),
        "ffmpeg": str(FFMPEG_EXE) if FFMPEG_EXE else None,
        "speakers": AVAILABLE_SPEAKERS,
        "default_voice": DEFAULT_TTS_VOICE,
        "default_speed": DEFAULT_TTS_SPEED
    }


@app.post("/synthesize")
def handle_synthesize(req: SynthesizeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Текст для озвучивания не может быть пустым")

    try:
        audio_file = synthesize_to_file(
            text=req.text,
            lang=req.lang,
            voice=req.voice,
            speed=req.speed or DEFAULT_TTS_SPEED
        )
        return {
            "status": "ok",
            "audio_url": f"/audio/{audio_file.name}",
            "filename": audio_file.name,
            "format": audio_file.suffix.replace(".", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/audio/{filename}")
@app.get("/api/tts/audio/{filename}")
def serve_audio(filename: str):
    fpath = CACHE_DIR / filename
    if not fpath.exists() or not fpath.is_file():
        raise HTTPException(status_code=404, detail="Аудиофайл не найден")

    media_type = "audio/mpeg" if fpath.suffix == ".mp3" else ("audio/ogg" if fpath.suffix == ".ogg" else "audio/wav")
    return FileResponse(path=fpath, media_type=media_type, filename=filename)


@app.post("/api/tts")
def api_tts_post(req: SynthesizeRequest):
    try:
        audio_file = synthesize_to_file(req.text, req.lang, req.voice, req.speed or DEFAULT_TTS_SPEED)
        media_type = "audio/mpeg" if audio_file.suffix == ".mp3" else "audio/wav"
        return FileResponse(path=audio_file, media_type=media_type, filename=audio_file.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tts")
def api_tts_get(
    text: str = Query(..., description="Текст для озвучки"),
    lang: str = Query("ba", description="Язык"),
    voice: Optional[str] = Query("bak_aigul", description="Голос"),
    speed: Optional[float] = Query(1.25, description="Скорость")
):
    try:
        audio_file = synthesize_to_file(text, lang, voice, speed or DEFAULT_TTS_SPEED)
        media_type = "audio/mpeg" if audio_file.suffix == ".mp3" else "audio/wav"
        return FileResponse(path=audio_file, media_type=media_type, filename=audio_file.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def run():
    port = int(os.environ.get("TTS_PORT", "8766"))
    host = os.environ.get("TTS_HOST", "0.0.0.0")
    print(f"[TTS] Запуск FastAPI Silero TTS сервера на http://{host}:{port} ...", flush=True)
    uvicorn.run(app, host=host, port=port, access_log=False)


if __name__ == "__main__":
    run()
