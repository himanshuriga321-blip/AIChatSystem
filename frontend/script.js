async function sendMessage() {
    const messageInput = document.getElementById("message");
    const chat = document.getElementById("chat");
    const button = document.querySelector("button");

    const message = messageInput.value.trim();

    if (!message) return;

    // User message
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = "👤 You: " + message;
    chat.appendChild(userMessage);

    messageInput.value = "";

    // AI thinking message
    const thinkingMessage = document.createElement("div");
    thinkingMessage.className = "message ai";
    thinkingMessage.textContent = "🤖 AI सोच रहा है...";
    chat.appendChild(thinkingMessage);

    // Disable input while AI is responding
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
                    message: message
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.reply || "HTTP Error: " + response.status
            );
        }

        // Replace thinking message with AI reply
        thinkingMessage.textContent = "🤖 AI: " + data.reply;

    } catch (error) {
        // Show error
        thinkingMessage.textContent =
            "❌ Error: " + error.message;
    }

    // Enable input again
    messageInput.disabled = false;
    button.disabled = false;
    messageInput.focus();

    chat.scrollTop = chat.scrollHeight;
}


// Enter press karke message send
document.getElementById("message").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
