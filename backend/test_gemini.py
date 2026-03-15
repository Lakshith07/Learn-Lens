"""Quick test to verify Gemini connectivity"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv(override=True)
key = os.getenv("GEMINI_API_KEY")
print(f"Key loaded: {key[:8]}...{key[-4:]}" if key else "NO KEY FOUND")

genai.configure(api_key=key)

# List available models
print("\n--- Available Models ---")
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(f"  {m.name}")

# Try a simple text call
print("\n--- Testing gemini-2.0-flash ---")
try:
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content("Say hello in one word.")
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILED: {e}")

# Try with an image bytes simulation
print("\n--- Testing image input ---")
try:
    from PIL import Image
    import io
    # Create a tiny test image
    img = Image.new('RGB', (100, 100), color='white')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    test_bytes = buf.getvalue()
    
    response = model.generate_content([
        "What do you see in this image? Reply in one sentence.",
        {"mime_type": "image/png", "data": test_bytes}
    ])
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILED: {e}")
