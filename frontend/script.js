async function sendMessage() {
    const messageInput = document.getElementById("message");
    const chat = document.getElementById("chat");

    const message = messageInput.value.trim();

    if (!message) return;

    chat.innerHTML += `
        <div class="message user">
            👤 You: ${message}
        </div>
    `;

    messageInput.value = "";

    try {
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        chat.innerHTML += `
            <div class="message ai">
                🤖 AI: ${data.reply}
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

    } catch (error) {
        chat.innerHTML += `
            <div class="message ai">
                ❌ Error: ${error.message}
            </div>
        `;
    }
}

document.getElementById("message").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
