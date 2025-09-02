import os
from elevenlabs import play, save, generate, set_api_key

# Load API key
api_key = os.getenv("ELEVENLABS_API_KEY")
voice_id = os.getenv("ELEVENLABS_VOICE_ID", "dMyQqiVXTU80dDl2eNK8")

if not api_key:
    raise RuntimeError("ELEVENLABS_API_KEY is not set. Run: export ELEVENLABS_API_KEY=...")

set_api_key(api_key)

print("[INFO] Generating Samantha test voice...")
audio = generate(
    text="Hello, this is Samantha. Testing live voice output.",
    voice=voice_id,
    model="eleven_multilingual_v2"
)

# Play it directly
play(audio)

# Save for verification
save(audio, "samantha_test_output.mp3")
print("[INFO] Saved to samantha_test_output.mp3")
