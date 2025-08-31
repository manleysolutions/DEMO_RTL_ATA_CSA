#!/home/csa/csav1-venv/bin/python
import os, time, json, requests
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

# === Load ENV ===
load_dotenv()
ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("SAMANTHA_VOICE_ID", "dMyQqiVXTU80dDl2eNK8")
DASHBOARD_URL = os.getenv("DASHBOARD_URL", "http://localhost:5000/api/heartbeat")

# === ElevenLabs client ===
client = ElevenLabs(api_key=ELEVEN_API_KEY)

def speak(text: str):
    """Generate and play Samantha’s voice"""
    try:
        print(f"🗣️ Samantha says: {text}")
        audio = client.text_to_speech.convert(
            voice_id=VOICE_ID,
            model_id="eleven_multilingual_v2",
            text=text
        )
        out_file = "/home/csa/last_samantha_line.mp3"
        with open(out_file, "wb") as f:
            for chunk in audio:
                f.write(chunk)
        # play via aplay
        os.system(f"aplay -q {out_file}")
    except Exception as e:
        print(f"❌ Error speaking: {e}")

def check_heartbeat():
    """Fetch CSA heartbeat JSON from local service/dashboard"""
    try:
        r = requests.get(DASHBOARD_URL, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"❌ Heartbeat fetch failed: {e}")
        return None

def summarize_status(hb):
    """Turn heartbeat JSON into spoken commissioning summary"""
    if not hb:
        return "I could not reach the dashboard heartbeat service."

    msg = ["Commissioning check complete."]
    if hb.get("ata_reachable"):
        msg.append("The ATA is reachable on the local network.")
    else:
        msg.append("Warning. The ATA is not reachable.")

    telnyx = hb.get("telnyx_numbers", [])
    if telnyx:
        for line in telnyx:
            num = line.get("number", "unknown")
            status = line.get("status", "unknown")
            msg.append(f"Line {num} is {status}.")
    else:
        msg.append("No Telnyx numbers were reported in the heartbeat.")

    return " ".join(msg)

if __name__ == "__main__":
    speak("Hello, this is Samantha. The commissioning service is starting now.")
    hb = check_heartbeat()
    summary = summarize_status(hb)
    speak(summary)
    # Stay alive as a daemon (for future interactions)
    while True:
        time.sleep(300)

