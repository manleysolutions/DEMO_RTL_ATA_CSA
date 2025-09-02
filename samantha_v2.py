import os
import json
import random
import argparse
from elevenlabs import generate, play, set_api_key

# =====================
# Load API Key & Voice
# =====================
api_key = os.getenv("ELEVENLABS_API_KEY")
voice_id = os.getenv("ELEVENLABS_VOICE_ID", "dMyQqiVXTU80dDl2eNK8")

if not api_key:
    raise RuntimeError("ELEVENLABS_API_KEY is not set. Run: export ELEVENLABS_API_KEY=...")

set_api_key(api_key)

# =====================
# Load Samantha Dialog
# =====================
dialog_file = os.path.join(os.path.dirname(__file__), "samantha_dialog.json")

if not os.path.exists(dialog_file):
    raise FileNotFoundError(f"Dialog file not found: {dialog_file}")

with open(dialog_file, "r") as f:
    dialog = json.load(f)

# =====================
# Core Speak Functions
# =====================
def speak(text: str):
    """Send text to ElevenLabs TTS and play it."""
    try:
        audio = generate(
            text=text,
            voice=voice_id,
            model="eleven_multilingual_v2"
        )
        play(audio)
    except Exception as e:
        print(f"[ERROR] Failed to speak: {e}")
        print(f"[FALLBACK] {text}")

def speak_from(category: str, key: str):
    """Pick a phrase from Samantha’s dialog repository."""
    if category not in dialog or key not in dialog[category]:
        print(f"[WARN] Missing category/key: {category}/{key}")
        return
    phrase = random.choice(dialog[category][key])
    print(f"[Samantha] {phrase}")
    speak(phrase)

# =====================
# CLI Demo Mode
# =====================
def demo(category: str):
    """Demo different flows (commissioning, entrapment, alarms, etc)."""
    if category == "greetings":
        speak_from("greetings", "initial")

    elif category == "commissioning":
        speak_from("commissioning", "network_check")
        speak_from("commissioning", "telnyx_sip_setup")
        speak_from("commissioning", "success")

    elif category == "emergency_entrapment":
        speak_from("emergency_entrapment", "initial_response")
        speak_from("emergency_entrapment", "follow_up_questions")
        speak_from("emergency_entrapment", "reassurance")
        speak_from("emergency_entrapment", "closure")

    elif category == "alarm":
        speak_from("contact_id_codes", "initial_detection")
        speak_from("contact_id_codes", "fire_alarm")
        speak_from("contact_id_codes", "reassurance")

    elif category == "status":
        speak_from("situational_awareness", "general")
        speak_from("situational_awareness", "network_issue")
        speak_from("situational_awareness", "power_loss")

    elif category == "farewell":
        speak_from("farewell", "end_conversation")

    else:
        print(f"[WARN] Unknown demo category: {category}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Samantha AI Voice Assistant v2")
    parser.add_argument("--demo", type=str, help="Run a demo scenario (greetings, commissioning, emergency_entrapment, alarm, status, farewell)")
    args = parser.parse_args()

    if args.demo:
        demo(args.demo)
    else:
        print("Samantha v2 is ready. Try: --demo greetings, --demo commissioning, --demo emergency_entrapment, --demo alarm, --demo status, --demo farewell")
