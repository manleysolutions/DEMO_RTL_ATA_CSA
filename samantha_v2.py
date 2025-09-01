#!/usr/bin/env python3
import json
import random
import pyttsx3
import os
import time

# -------------------------------
# Load Samantha's dialog database
# -------------------------------
DIALOG_FILE = os.path.join(os.path.dirname(__file__), "samantha_dialog.json")

if not os.path.exists(DIALOG_FILE):
    # Create a default dialog file if missing
    default_dialog = {
        "greetings": {
            "initial": ["Hello, this is Samantha, your emergency assistant. How can I help you today?"],
            "commissioning_start": ["Welcome to the Central Station Appliance setup. Let's get started. What do you need help with?"],
            "emergency_detection": ["This is Samantha. I detect an emergency. Are you safe? Please describe the situation."]
        },
        "commissioning": {
            "network_check": ["Checking networks... Wi-Fi connected. Ethernet stable. Cellular signal good. All systems nominal."],
            "telnyx_sip_setup": ["Configuring Telnyx SIP... Enter credentials or say 'test connection' to verify."],
            "success": ["Commissioning complete. CSA is ready for use. Test with 'emergency simulation'."],
            "failure": ["Connection issue detected. Please check the cable and try again. Or say 'retry'."]
        },
        "emergency_entrapment": {
            "initial_response": [
                "This is Samantha. I understand you may be trapped. Stay calm; help is on the way. Are you in an elevator?",
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
            "closure": ["Rescue team has arrived. Thank you for staying calm. Samantha signing off."]
        },
        "farewell": {
            "end_conversation": ["Thank you for using Samantha. Stay safe. Goodbye."]
        }
    }
    with open(DIALOG_FILE, "w") as f:
        json.dump(default_dialog, f, indent=2)

with open(DIALOG_FILE, "r") as f:
    dialog = json.load(f)

# -------------------------------
# Text-to-Speech Engine
# -------------------------------
engine = pyttsx3.init()
engine.setProperty("rate", 165)  # words per minute
engine.setProperty("volume", 1.0)

# -------------------------------
# Speak helpers
# -------------------------------
def speak(text: str):
    """Speak a given line with pyttsx3"""
    print(f"Samantha: {text}")
    engine.say(text)
    engine.runAndWait()

def speak_from(category: str, subcategory: str):
    """Pick a random phrase from the dialog file and speak it"""
    try:
        options = dialog[category][subcategory]
        phrase = random.choice(options)
        speak(phrase)
    except KeyError:
        speak(f"[Missing phrase: {category}/{subcategory}]")

# -------------------------------
# Quick test flow
# -------------------------------
if __name__ == "__main__":
    speak_from("greetings", "initial")
    time.sleep(1)
    speak_from("commissioning", "network_check")
    time.sleep(1)
    speak_from("emergency_entrapment", "initial_response")
    time.sleep(1)
    speak_from("emergency_entrapment", "reassurance")
    time.sleep(1)
    speak_from("farewell", "end_conversation")
