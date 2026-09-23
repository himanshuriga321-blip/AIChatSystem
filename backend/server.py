import os
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

# Temporary document storage for Document Chat
document_store = {}

HF_TOKEN = os.getenv("HF_TOKEN")

HF_URL = "https://router.huggingface.co/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"


@app.route("/")
def home():
    return "AI Chat System is running! 🤖"


@app.route("/document", methods=["POST"])
def document():
    data = request.get_json() or {}
    document_id = data.get("document_id", "default")
    content = str(data.get("content", "")).strip()

    if not content:
        return jsonify({"error": "Document content is empty."}), 400

    document_store[document_id] = content[:50000]
    return jsonify({"success": True, "document_id": document_id})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}

    message = data.get("message", "").strip()
    messages = data.get("messages", [])
    document_id = data.get("document_id")

    if not message and not messages:
        return jsonify({
            "reply": "Please enter a message."
        }), 400

    if not HF_TOKEN:
        return jsonify({
            "reply": "Hugging Face token is not configured."
        }), 500

    # PDF/document analysis guidance
    if "इस PDF का analysis करो:" in message or "PDF" in message:
        message = "Analyze the provided document carefully. Give a clear summary and answer questions using only the document content. Do not unnecessarily repeat sensitive personal, account, Aadhaar, UID, or contact numbers; mask such information when possible.\n\nDocument:\n" + message

    # Use stored document when a document_id is provided
    stored_document = document_store.get(document_id) if document_id else None
    if stored_document and message:
        messages = [
            {
                "role": "system",
                "content": "You are analyzing a user-provided document. Answer the user question using only the document content. Summarize clearly when asked. Do not unnecessarily repeat sensitive personal, account, Aadhaar, UID, or contact numbers; mask sensitive numbers when possible.\n\nDOCUMENT CONTENT:\n" + stored_document[:30000]
            },
            {
                "role": "user",
                "content": message
            }
        ]

    # Conversation memory
    if not isinstance(messages, list) or not messages:
        messages = [
            {
                "role": "user",
                "content": message
            }
        ]

    # Add document-analysis guidance to the actual messages sent to the AI
    if "इस PDF का analysis करो:" in message or "PDF" in message:
        messages = [{
            "role": "system",
            "content": "Analyze the provided document carefully. Give a clear, complete summary and answer questions using only the document content. Do not unnecessarily repeat sensitive personal, account, Aadhaar, UID, or contact numbers; mask sensitive numbers when possible."
        }] + messages

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": 1000
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
