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
    messages = data.get("messages", [])

    if not message and not messages:
        return jsonify({
            "reply": "Please enter a message."
        }), 400

    if not HF_TOKEN:
        return jsonify({
            "reply": "Hugging Face token is not configured."
        }), 500

    # Conversation memory
    if not isinstance(messages, list) or not messages:
        messages = [
            {
                "role": "user",
                "content": message
            }
        ]

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": 300
    }

    try:
        response = requests.post(
            HF_URL,
            headers=headers,
            json=payload,
            timeout=60
        )

        result = response.json()

        if response.status_code != 200:
            return jsonify({
                "reply": "Hugging Face error: " + str(result)
            }), response.status_code

        if "choices" not in result or not result["choices"]:
            return jsonify({
                "reply": "AI did not return a response."
            }), 500

        ai_message = result["choices"][0].get("message", {})

        reply = (
            ai_message.get("content")
            or ai_message.get("reasoning")
            or "No response"
        )

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        return jsonify({
            "reply": "Server error: " + str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )
