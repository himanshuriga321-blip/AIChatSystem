// 🧠 Conversation Memory
let conversationHistory = [];


async function sendMessage() {
    const messageInput = document.getElementById("message");
    const chat = document.getElementById("chat");
    const button = document.getElementById("sendButton");

    const message = messageInput.value.trim();

    if (!message) return;


    // 👤 User message
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = "👤 You: " + message;
    chat.appendChild(userMessage);

    messageInput.value = "";


    // 🧠 Save user message to memory
    conversationHistory.push({
        role: "user",
        content: message
    });


    // 🤖 AI thinking message
    const thinkingMessage = document.createElement("div");
    thinkingMessage.className = "message ai";
    thinkingMessage.textContent = "🤖 AI सोच रहा है...";
    chat.appendChild(thinkingMessage);


    // Disable input
    messageInput.disabled = true;
    button.disabled = true;

    chat.scrollTop = chat.scrollHeight;


    try {
        const response = await fetch(
            "https://ai-chat-system-gv4h.onrender.com/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message,
                    messages: conversationHistory
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.reply || "HTTP Error: " + response.status
            );
        }


        // 🤖 Show AI reply
        thinkingMessage.textContent =
            "🤖 AI: " + data.reply;


        // 🧠 Save AI reply to memory
        conversationHistory.push({
            role: "assistant",
            content: data.reply
        });


    } catch (error) {

        thinkingMessage.textContent =
            "❌ Error: " + error.message;

        // Remove user message from memory if request failed
        conversationHistory.pop();
    }


    // Enable input again
    messageInput.disabled = false;
    button.disabled = false;

    messageInput.focus();

    chat.scrollTop = chat.scrollHeight;
}


// ⌨️ Enter key से message भेजना
document.getElementById("message").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            sendMessage();
        }

    }
);


// 🗑️ Clear Chat
document.getElementById("clearChat").addEventListener(
    "click",
    function() {

        document.getElementById("chat").innerHTML = "";

        // 🧠 Memory भी clear
        conversationHistory = [];

    }
);
