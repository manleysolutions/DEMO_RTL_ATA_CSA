#!/usr/bin/env python3
import json
import random
import argparse
import os
import sys
import requests

# Load dialog JSON
DIALOG_FILE = os.path.expanduser("~/csav1-core/samantha_dialog.json")
with open(DIALOG_FILE, "r") as f:
    dialog = json.load(f)

# --- ElevenLabs voice (Samantha) ---
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")  # Samantha-like voice

def speak(text: str):
    """Send text to ElevenLabs and play audio with ffplay"""
    if not ELEVENLABS_API_KEY:
        print(f"[Samantha TEXT ONLY] {text}")
        return

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    payload = {"text": text, "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}}

    try:
        r = requests.post(url, headers=headers, json=payload, timeout=30)
        r.raise_for_status()
        with open("/tmp/samantha_tts.mp3", "wb") as f:
            f.write(r.content)
        os.system("ffplay -nodisp -autoexit -loglevel quiet /tmp/samantha_tts.mp3")
    except Exception as e:
        print(f"[ERROR TTS] {e}")
        print(f"[Samantha TEXT ONLY] {text}")

def run_demo(flow: str):
    """Run a predefined flow like entrapment, commissioning, etc."""
    if flow == "entrapment":
        speak(random.choice(dialog["emergency_entrapment"]["initial_response"]))
        speak(random.choice(dialog["emergency_entrapment"]["follow_up_questions"]))
        speak(random.choice(dialog["emergency_entrapment"]["reassurance"]))
        speak(random.choice(dialog["emergency_entrapment"]["closure"]))

    elif flow == "commissioning":
        speak(random.choice(dialog["greetings"]["commissioning_start"]))
        speak(random.choice(dialog["commissioning"]["network_check"]))
        speak(random.choice(dialog["commissioning"]["telnyx_sip_setup"]))
        speak(random.choice(dialog["commissioning"]["success"]))

    elif flow == "alarm":
        speak(random.choice(dialog["contact_id_codes"]["initial_detection"]))
        speak(random.choice(dialog["contact_id_codes"]["fire_alarm"]))
        speak(random.choice(dialog["contact_id_codes"]["reassurance"]))

    elif flow == "status":
        speak(random.choice(dialog["situational_awareness"]["general"]))
        speak(random.choice(dialog["situational_awareness"]["network_issue"]))
        speak(random.choice(dialog["situational_awareness"]["power_loss"]))

    else:
        print(f"[ERROR] Unknown flow: {flow}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Samantha v3 Demo")
    parser.add_argument("--demo", type=str, required=True,
                        help="Which demo to run (entrapment, commissioning, alarm, status)")
    args = parser.parse_args()

    run_demo(args.demo)
