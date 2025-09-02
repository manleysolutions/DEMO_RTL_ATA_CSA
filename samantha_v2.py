import os
import json
import requests
from pathlib import Path

# Load API key from env var
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if not ELEVENLABS_API_KEY:
    raise RuntimeError("ELEVENLABS_API_KEY is not set. Add it to your .env or Render Environment Variables.")

# Voice settings (Samantha voice you’ve been using)
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"   # Replace if you have Samantha’s specific ID
OUTPUT_DIR = Path("/home/csa/csav1-core/audio")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Load dialog repository
DIALOG_PATH = Path("/home/csa/csav1-core/samantha_dialog.json")
if not DIALOG_PATH.exists():
    raise FileNotFoundError(f"Missing {DIALOG_PATH}. Please create it first.")
with open(DIALOG_PATH, "r") as f:
    DIALOG = json.load(f)

def speak(text, filename="output.mp3"):
    """Send text to ElevenLabs TTS and play it."""
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    data = {
        "text": text,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}
    }

    resp = requests.post(url, headers=headers, json=data, timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f"TTS request failed: {resp.status_code} {resp.text}")

    filepath = OUTPUT_DIR / filename
    with open(filepath, "wb") as f:
        f.write(resp.content)

    os.system(f"mpg123 {filepath}")  # Play back audio
    return filepath

def speak_from(category, subcategory):
    """Speak a random phrase from the dialog repo."""
    import random
    try:
        phrase = random.choice(DIALOG[category][subcategory])
        print(f"Samantha says: {phrase}")
        speak(phrase, f"{category}_{subcategory}.mp3")
    except KeyError:
        print(f"[ERROR] Missing dialog entry for {category}/{subcategory}")

# Example run
if __name__ == "__main__":
    speak_from("greetings", "initial")
