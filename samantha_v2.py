import os
import random
import argparse

# Try ElevenLabs SDK
try:
    from elevenlabs import generate, play, set_api_key
    elevenlabs_available = True
except ImportError:
    elevenlabs_available = False

# Try pyttsx3
try:
    import pyttsx3
    pyttsx3_available = True
except ImportError:
    pyttsx3_available = False

# ---------------------------
# Dialog repository
# ---------------------------
DIALOG = {
    "greetings": {
        "initial": [
            "Hello, this is Samantha, your emergency assistant. How can I help you today?"
        ]
    },
    "commissioning": {
        "start": [
            "Welcome to the Central Station Appliance setup. Let's get started. What do you need help with?"
        ],
        "network_check": [
            "Checking networks... Wi-Fi connected. Ethernet stable. Cellular signal good. All systems nominal."
        ],
        "success": [
            "Commissioning complete. CSA is ready for use. Test with 'emergency simulation'."
        ]
    },
    "emergency_entrapment": {
        "initial": [
            "This is Samantha. I understand you may be trapped. Stay calm; help is on the way. Are you in an elevator?",
            "Samantha here. I detect an entrapment signal. Don't panic. Can you tell me your location?"
        ],
        "follow_up": [
            "Are you alone? Is anyone hurt? Please describe the situation.",
            "What's your name? How many people are with you? Do you have any medical conditions?"
        ],
        "reassurance": [
            "Help is dispatched. Stay on the line; I'm here with you. You're not alone.",
            "Emergency team is en route. Time to arrival is approximately 10 minutes."
        ],
        "closure": [
            "Rescue team has arrived. Thank you for staying calm. Samantha signing off."
        ]
    },
    "farewell": {
        "end": [
            "Thank you for using Samantha. Stay safe. Goodbye."
        ]
    }
}

# ---------------------------
# Voice setup
# ---------------------------
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")

if ELEVENLABS_API_KEY and elevenlabs_available:
    set_api_key(ELEVENLABS_API_KEY)
    voice_mode = "elevenlabs"
elif pyttsx3_available:
    engine = pyttsx3.init()
    engine.setProperty("rate", 165)
    voice_mode = "pyttsx3"
else:
    voice_mode = "text"

print(f"[INFO] Samantha voice mode: {voice_mode}")

# ---------------------------
# Speak function
# ---------------------------
def speak(text: str):
    if voice_mode == "elevenlabs":
        try:
            audio = generate(text=text, voice=ELEVENLABS_VOICE_ID, model="eleven_multilingual_v2")
            play(audio)
        except Exception as e:
            print(f"[ERROR] ElevenLabs failed: {e}")
            print(f"[TEXT ONLY] {text}")
    elif voice_mode == "pyttsx3":
        engine.say(text)
        engine.runAndWait()
    else:
        print(f"[TEXT ONLY] {text}")

def speak_from(category: str, key: str):
    if category not in DIALOG or key not in DIALOG[category]:
        speak("Invalid dialog category or key.")
        return
    phrase = random.choice(DIALOG[category][key])
    speak(phrase)

# ---------------------------
# CLI interface
# ---------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--demo", type=str, help="Run demo: greetings, commissioning, emergency_entrapment, farewell")
    args = parser.parse_args()

    if args.demo:
        cat = args.demo
        if cat not in DIALOG:
            print(f"Unknown demo category: {cat}")
        else:
            for key, phrases in DIALOG[cat].items():
                for phrase in phrases:
                    speak(phrase)
    else:
        print("Samantha v2 ready. Try: --demo greetings | commissioning | emergency_entrapment | farewell")
