async function sendMessage() {
    const messageInput = document.getElementById("message");
    const chat = document.getElementById("chat");

    const message = messageInput.value.trim();

    if (!message) return;

    // User message
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = "👤 You: " + message;
    chat.appendChild(userMessage);

    messageInput.value = "";

    try {
        const response = await fetch(
            "https://ai-chat-system-gv4h.onrender.com/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message
                })
            }
        );

        // Server ka response pehle read karo
        const data = await response.json();

        // Actual backend error dikhao
        if (!response.ok) {
            throw new Error(
                data.reply || "HTTP Error: " + response.status
            );
        }

        // AI reply
        const aiMessage = document.createElement("div");
        aiMessage.className = "message ai";
        aiMessage.textContent = "🤖 AI: " + data.reply;
        chat.appendChild(aiMessage);

        chat.scrollTop = chat.scrollHeight;

    } catch (error) {
        const errorMessage = document.createElement("div");
        errorMessage.className = "message ai";
        errorMessage.textContent = "❌ Error: " + error.message;
        chat.appendChild(errorMessage);

        chat.scrollTop = chat.scrollHeight;
    }
}

// Enter press karke message send
document.getElementById("message").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
