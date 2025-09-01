#!/usr/bin/env python3
import os, json, random
from pathlib import Path

# --- Load dialog repository ---
DIALOG_FILE = Path(__file__).with_name("samantha_dialog.json")
if not DIALOG_FILE.exists():
    default_dialog = {
        "greetings": {
            "initial": ["Hello, this is Samantha, your emergency assistant. How can I help you today?"]
        }
    }
    with open(DIALOG_FILE, "w") as f:
        json.dump(default_dialog, f, indent=2)

with open(DIALOG_FILE, "r") as f:
    dialog = json.load(f)

# --- ElevenLabs (Samantha voice) ---
try:
    from elevenlabs import ElevenLabs, play
    ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY")
    VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "Samantha")  # replace with real ID if needed
    client = ElevenLabs(api_key=ELEVEN_API_KEY) if ELEVEN_API_KEY else None
except Exception as e:
    print("[WARN] ElevenLabs not available:", e)
    client = None

# --- Local fallback (pyttsx3) ---
def fallback_tts(text: str):
    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print("[ERROR] pyttsx3 fallback failed:", e)
        print(f"(Would have spoken) {text}")

# --- Unified speak() function ---
def speak(text: str):
    if client:
        try:
            audio = client.generate(
                text=text,
                voice=VOICE_ID,
                model="eleven_monolingual_v1"
            )
            play(audio)
            return
        except Exception as e:
            print("[WARN] ElevenLabs failed, falling back to pyttsx3:", e)
    fallback_tts(text)

# --- Helper to speak from dialog repo ---
def speak_from(category: str, key: str):
    try:
        options = dialog[category][key]
        line = random.choice(options)
        print(f"[Samantha] {line}")
        speak(line)
    except KeyError:
        print(f"[ERROR] No dialog found for {category}:{key}")

# --- Demo mode ---
if __name__ == "__main__":
    print("Samantha v2 ready. Testing sample phrases...")
    speak_from("greetings", "initial")
    speak_from("emergency_entrapment", "initial_response")
    speak_from("emergency_entrapment", "reassurance")
