import os
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)
HF_TOKEN = os.getenv("HF_TOKEN")

HF_URL = "https://router.huggingface.co/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"


@app.route("/")
def home():
    return "AI Chat System is running! 🤖"


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"reply": "Please enter a message."}), 400

    if not HF_TOKEN:
        return jsonify({"reply": "Hugging Face token is not configured."}), 500

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": message
            }
        ],
        "max_tokens": 200
    }

    try:
        response = requests.post(
            HF_URL,
            headers=headers,
            json=payload,
            timeout=60
        )

        result = response.json()

        if response.status_code != 200 or "choices" not in result:
            return jsonify({
                "reply": "Hugging Face error: " + str(result)
            }), response.status_code

        reply = result["choices"][0]["message"].get("content", "") or result["choices"][0]["message"].get("reasoning", "No response")

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({
            "reply": "Server error: " + str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
