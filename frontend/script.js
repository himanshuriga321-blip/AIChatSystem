// 🧠 Conversation Memory
let conversationHistory =
    JSON.parse(localStorage.getItem("conversationHistory")) || [];


// 💾 Save conversation
function saveConversation() {
    localStorage.setItem(
        "conversationHistory",
        JSON.stringify(conversationHistory)
    );
}


// 🤖 Send Message
async function sendMessage() {

    const messageInput = document.getElementById("message");
    const chat = document.getElementById("chat");
    const button = document.getElementById("sendButton");

    const message = messageInput.value.trim();

    if (!message) return;


    // 👤 User message
    const userMessage = document.createElement("div");

    userMessage.className = "message user";

    userMessage.textContent =
        "👤 You: " + message;

    chat.appendChild(userMessage);


    messageInput.value = "";


    // 🧠 Save user message
    conversationHistory.push({
        role: "user",
        content: message
    });

    saveConversation();


    // 🤖 Thinking
    const thinkingMessage = document.createElement("div");

    thinkingMessage.className = "message ai";

    thinkingMessage.textContent =
        "🤖 AI सोच रहा है...";

    chat.appendChild(thinkingMessage);


    // 🚫 Disable input
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
                data.reply ||
                "HTTP Error: " + response.status
            );

        }


        // 🤖 Show AI reply
        thinkingMessage.textContent =
            "🤖 AI: " + data.reply;


        // 🧠 Save AI reply
        conversationHistory.push({
            role: "assistant",
            content: data.reply
        });

        saveConversation();


    } catch (error) {

        thinkingMessage.textContent =
            "❌ Error: " + error.message;


        // 🧠 Remove failed user message
        conversationHistory.pop();

        saveConversation();

    }


    // ✅ Enable input
    messageInput.disabled = false;
    button.disabled = false;

    messageInput.focus();

    chat.scrollTop = chat.scrollHeight;

}


// ⌨️ Enter key
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

        conversationHistory = [];

        localStorage.removeItem(
            "conversationHistory"
        );

        showHistory();

    }
);


// 📜 Open History
document.getElementById("historyButton").addEventListener(
    "click",
    function() {

        showHistory();

        document.getElementById(
            "historyPanel"
        ).style.display = "block";

    }
);


// ❌ Close History
document.getElementById("closeHistory").addEventListener(
    "click",
    function() {

        document.getElementById(
            "historyPanel"
        ).style.display = "none";

    }
);


// 📜 Show History
function showHistory() {

    const historyList =
        document.getElementById("historyList");

    historyList.innerHTML = "";


    if (conversationHistory.length === 0) {

        const emptyMessage =
            document.createElement("div");

        emptyMessage.className =
            "history-item";

        emptyMessage.textContent =
            "📭 No chat history yet.";

        historyList.appendChild(
            emptyMessage
        );

        return;
    }


    conversationHistory.forEach(
        function(item, index) {

            const historyItem =
                document.createElement("div");

            historyItem.className =
                "history-item";


            const title =
                document.createElement("div");

            title.className =
                "history-item-title";


            if (item.role === "user") {

                title.textContent =
                    "👤 You";

            } else {

                title.textContent =
                    "🤖 AI";

            }


            const preview =
                document.createElement("div");

            preview.className =
                "history-item-preview";

            preview.textContent =
                item.content;


            historyItem.appendChild(title);

            historyItem.appendChild(preview);


            // 👆 Click history item
            historyItem.addEventListener(
                "click",
                function() {

                    const messages =
                        document.querySelectorAll(
                            "#chat .message"
                        );

                    if (messages[index]) {

                        messages[index].scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }

                    document.getElementById(
                        "historyPanel"
                    ).style.display = "none";

                }
            );


            historyList.appendChild(
                historyItem
            );

        }
    );

}


// 💾 Load saved chat when page opens
window.addEventListener(
    "load",
    function() {

        const chat =
            document.getElementById("chat");


        conversationHistory.forEach(
            function(item) {

                const message =
                    document.createElement("div");


                if (item.role === "user") {

                    message.className =
                        "message user";

                    message.textContent =
                        "👤 You: " + item.content;

                }


                if (item.role === "assistant") {

                    message.className =
                        "message ai";

                    message.textContent =
                        "🤖 AI: " + item.content;

                }


                if (
                    item.role === "user" ||
                    item.role === "assistant"
                ) {

                    chat.appendChild(message);

                }

            }
        );


        chat.scrollTop =
            chat.scrollHeight;

    }
);


// 📥 Export Chat
document.getElementById("exportChat").addEventListener("click", function() {

    if (conversationHistory.length === 0) {
        alert("📭 No chat history to export.");
        return;
    }

    let text = "🤖 AI Chat System - Chat History\n\n";

    conversationHistory.forEach(function(item) {

        if (item.role === "user") {
            text += "👤 You: " + item.content + "\n\n";
        }

        if (item.role === "assistant") {
            text += "🤖 AI: " + item.content + "\n\n";
        }

    });

   const blob = new Blob(["\uFEFF" + text], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "AI-Chat-History.txt";

    a.click();

    URL.revokeObjectURL(url);

});
