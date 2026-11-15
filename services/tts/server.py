import hashlib
import json
import os
import subprocess
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

try:
    import torch
    import soundfile as sf
except ImportError:
    torch = None
    sf = None

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
EXTERNAL_BOT_DIR = Path("C:/Users/User/Desktop/bashklingo-bot")

MODEL_CIS_PATH = EXTERNAL_BOT_DIR / "models" / "silero" / "v5_cis_base_nostress.pt"
if not MODEL_CIS_PATH.exists():
    MODEL_CIS_PATH = BASE_DIR / "models" / "v5_cis_base_nostress.pt"

MODEL_EN_PATH = BASE_DIR / "models" / "v3_en.pt"
MODEL_EN_URL = "https://models.silero.ai/models/tts/en/v3_en.pt"

FFMPEG_PATH = EXTERNAL_BOT_DIR / "ffmpeg-9.0.2-essentials_build" / "bin" / "ffmpeg.exe"
if not FFMPEG_PATH.exists():
    FFMPEG_PATH = Path("ffmpeg")

CACHE_DIR = BASE_DIR / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

_model_cis = None
_model_en = None
_device = "cpu"

def get_cis_model():
    global _model_cis
    if _model_cis is not None:
        return _model_cis
    if torch is None or not MODEL_CIS_PATH.exists():
        return None
    try:
        model = torch.package.PackageImporter(str(MODEL_CIS_PATH)).load_pickle("tts_models", "model")
        model.to(torch.device(_device))
        _model_cis = model
        return _model_cis
    except Exception:
        return None

def get_en_model():
    global _model_en
    if _model_en is not None:
        return _model_en
    if torch is None:
        return None
    if not MODEL_EN_PATH.exists():
        MODEL_EN_PATH.parent.mkdir(parents=True, exist_ok=True)
        try:
            torch.hub.download_url_to_file(MODEL_EN_URL, str(MODEL_EN_PATH), progress=False)
        except Exception:
            return None
    try:
        model = torch.package.PackageImporter(str(MODEL_EN_PATH)).load_pickle("tts_models", "model")
        model.to(torch.device(_device))
        _model_en = model
        return _model_en
    except Exception:
        return None

def synthesize(text: str, lang: str = "ba", voice: str = "bak_aigul", speed: float = 1.25) -> Path | None:
    text = text.strip()
    if not text:
        return None
    cache_key = hashlib.sha256(f"{lang}_{voice}_{speed}_{text}".encode()).hexdigest()
    out_wav = CACHE_DIR / f"{cache_key}.wav"
    out_mp3 = CACHE_DIR / f"{cache_key}.mp3"
    if out_mp3.exists():
        return out_mp3
    if out_wav.exists():
        return out_wav

    if lang == "en":
        model = get_en_model()
        if model is None:
            return None
        speaker = "en_0" if voice not in ["en_0", "en_1", "en_2"] else voice
        try:
            audio = model.apply_tts(text=text, speaker=speaker, sample_rate=48000)
            audio_np = audio.detach().cpu().float().numpy()
            sf.write(str(out_wav), audio_np, 48000)
        except Exception:
            return None
    else:
        model = get_cis_model()
        if model is None:
            return None
        speaker = voice
        if lang == "ba" and not speaker.startswith("bak_"):
            speaker = "bak_aigul"
        elif lang == "ru" and not speaker.startswith("ru_"):
            speaker = "ru_aigul"
        try:
            audio = model.apply_tts(text=text, speaker=speaker, sample_rate=48000)
            audio_np = audio.detach().cpu().float().numpy()
            sf.write(str(out_wav), audio_np, 48000)
        except Exception:
            return None

    if FFMPEG_PATH.exists() and out_wav.exists():
        try:
            subprocess.run([str(FFMPEG_PATH), "-y", "-i", str(out_wav), "-b:a", "128k", str(out_mp3)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return out_mp3
        except Exception:
            return out_wav
    return out_wav

class TTSHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            status = {"status": "ok", "cis_model": MODEL_CIS_PATH.exists(), "torch": torch is not None}
            self.wfile.write(json.dumps(status).encode())
            return
        if parsed.path.startswith("/audio/"):
            fname = parsed.path.replace("/audio/", "")
            fpath = CACHE_DIR / fname
            if fpath.exists() and fpath.is_file():
                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg" if fpath.suffix == ".mp3" else "audio/wav")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Length", str(fpath.stat().st_size))
                self.end_headers()
                with open(fpath, "rb") as f:
                    self.wfile.write(f.read())
                return
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path != "/synthesize":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8")
        try:
            data = json.loads(body)
        except Exception:
            self.send_response(400)
            self.end_headers()
            return
        text = data.get("text", "")
        lang = data.get("lang", "ba")
        voice = data.get("voice", "bak_aigul")
        speed = float(data.get("speed", 1.25))
        result_path = synthesize(text, lang, voice, speed)
        if result_path is None:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Synthesis failed or model not available"}).encode())
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        resp = {
            "status": "ok",
            "audio_url": f"/audio/{result_path.name}",
            "filename": result_path.name
        }
        self.wfile.write(json.dumps(resp).encode())

    def log_message(self, format, *args):
        return

def run_server():
    server = HTTPServer(("0.0.0.0", 8766), TTSHandler)
    print("Silero TTS server listening on 0.0.0.0:8766")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()

if __name__ == "__main__":
    run_server()
