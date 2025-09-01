#!/usr/bin/env python3
import os
import json
import random
import requests
import tempfile
import subprocess
from dotenv import load_dotenv

# ============================
# Load environment variables
# ============================
load_dotenv()
ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVEN_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")  # fallback ID

# ============================
# Dialog database
# ============================
DIALOG_FILE = os.path.join(os.path.dirname(__file__), "samantha_dialog.json")

if not os.path.exists(DIALOG_FILE):
    # Create minimal default dialog if missing
    default_dialog = {
        "greetings": {
            "initial": ["Hello, this is Samantha, your emergency assistant. How can I help you today?"],
            "commissioning_start": ["Welcome to the Central Station Appliance setup. Let's get started."],
            "emergency_detection": ["This is Samantha. I detect an emergency. Are you safe?"]
        },
        "commissioning": {
            "network_check": ["Checking networks... Wi-Fi connected. Ethernet stable. Cellular signal good."],
            "telnyx_sip_setup": ["Configuring Telnyx SIP... Please confirm your credentials."],
            "success": ["Commissioning complete. CSA is ready for use."],
            "failure": ["Connection issue detected. Please check cables and retry."]
        },
        "emergency_entrapment": {
            "initial_response": [
                "This is Samantha. I understand you may be trapped. Stay calm; help is on the way.",
                "Samantha here. I detect an entrapment signal. Don't panic. Can you tell me your location?"
            ],
            "follow_up_questions": [
                "Are you alone? Is anyone hurt? Please describe the situation.",
                "What's your name? How many people are with you? Do you have any medical conditions?",
                "Is the air okay? Can you see any lights or buttons?"
            ],
            "reassurance": [
                "I'm contacting emergency services right now. They will be with you shortly. Breathe slowly.",
                "Help is dispatched. Stay on the line; I'm here with you. You're not alone.",
                "Emergency team is en route. Time to arrival is approximately 10 minutes. Hang in there."
            ],
            "closure": [
                "Rescue team has arrived. Thank you for staying calm. Samantha signing off."
            ]
        },
        "farewell": {
            "end_conversation": ["Thank you for using Samantha. Stay safe. Goodbye."]
        }
    }
    with open(DIALOG_FILE, "w") as f:
        json.dump(default_dialog, f, indent=2)

# ============================
# Voice output
# ============================
def speak(text: str):
    """Speak text using ElevenLabs, fallback to espeak if it fails."""
    if ELEVEN_API_KEY:
        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_VOICE_ID}"
            headers = {
                "xi-api-key": ELEVEN_API_KEY,
                "Content-Type": "application/json"
            }
            payload = {"text": text, "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}}
            r = requests.post(url, headers=headers, json=payload, stream=True, timeout=30)

            if r.status_code == 200:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
                    for chunk in r.iter_content(chunk_size=1024):
                        if chunk:
                            f.write(chunk)
                    tmpfile = f.name
                subprocess.run(
                    ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", tmpfile],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                os.unlink(tmpfile)
                return
            else:
                print("ElevenLabs error:", r.text)
        except Exception as e:
            print("ElevenLabs failed, falling back:", e)

    # Fallback voice (robot)
    subprocess.run(["espeak", text])

# ============================
# Dialog access helpers
# ============================
def speak_from(category, key):
    if not os.path.exists(DIALOG_FILE):
        print("Dialog file missing!")
        return
    with open(DIALOG_FILE, "r") as f:
        dialog = json.load(f)

    if category in dialog and key in dialog[category]:
        phrase = random.choice(dialog[category][key])
        print(f"Samantha says: {phrase}")
        speak(phrase)
    else:
        print("Dialog key not found.")

# ============================
# CLI demo
# ============================
if __name__ == "__main__":
    print("Samantha v2 is ready. Try categories: greetings, commissioning, emergency_entrapment, farewell")
    try:
        while True:
            cat = input("Enter category: ").strip()
            key = input("Enter key: ").strip()
            speak_from(cat, key)
    except KeyboardInterrupt:
        print("\nExiting Samantha.")
