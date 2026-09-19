// 🧠 AI Chat System - Feature 4
// New Chat + Chat Sessions + History + Export

const BACKEND_URL =
    "https://ai-chat-system-gv4h.onrender.com/chat";


// ==========================================
// 🧠 Chat Sessions
// ==========================================

let chatSessions =
    JSON.parse(localStorage.getItem("chatSessions")) || [];

let currentChatId =
    localStorage.getItem("currentChatId");


// पुराने Feature 2 data को नए session में migrate करना
if (chatSessions.length === 0) {

    const oldConversation =
        JSON.parse(
            localStorage.getItem("conversationHistory")
        ) || [];

    if (oldConversation.length > 0) {

        chatSessions.push({
            id: Date.now().toString(),
            title: getChatTitle(oldConversation),
            messages: oldConversation,
            createdAt: new Date().toISOString()
        });

    }

    localStorage.removeItem("conversationHistory");
}


// अगर कोई current chat नहीं है
if (!currentChatId && chatSessions.length > 0) {

    currentChatId =
        chatSessions[chatSessions.length - 1].id;

}


// अगर कोई chat ही नहीं है तो नया chat बनाओ
if (!currentChatId) {
    createNewChat(false);
}


// ==========================================
// 💾 Save Sessions
// ==========================================

function saveSessions() {

    localStorage.setItem(
        "chatSessions",
        JSON.stringify(chatSessions)
    );

    localStorage.setItem(
        "currentChatId",
        currentChatId
    );
}


// ==========================================
// 🔎 Current Chat
// ==========================================

function getCurrentChat() {

    return chatSessions.find(
        function(chat) {
            return chat.id === currentChatId;
        }
    );

}


// ==========================================
// 📝 Chat Title
// ==========================================

function getChatTitle(messages) {

    const firstUserMessage =
        messages.find(
            function(item) {
                return item.role === "user";
            }
        );

    if (!firstUserMessage) {
        return "New Chat";
    }

    let title =
        firstUserMessage.content.trim();

    if (title.length > 30) {
        title = title.substring(0, 30) + "...";
    }

    return title;
}


// ==========================================
// ➕ New Chat
// ==========================================

function createNewChat(showMessage = true) {

    const newChat = {

        id: Date.now().toString(),

        title: "New Chat",

        messages: [],

        createdAt: new Date().toISOString()

    };


    chatSessions.push(newChat);

    currentChatId = newChat.id;

    saveSessions();

    document.getElementById("chat").innerHTML = "";


    if (showMessage) {

        const message =
            document.createElement("div");

        message.className =
            "message ai";

        message.textContent =
            "🤖 New chat started!";

        document
            .getElementById("chat")
            .appendChild(message);

    }

}


// ==========================================
// 🤖 Send Message
// ==========================================

async function sendMessage() {

    const messageInput =
        document.getElementById("message");

    const chat =
        document.getElementById("chat");

    const button =
        document.getElementById("sendButton");


    const message =
        messageInput.value.trim();


    if (!message) {
        return;
    }


    const currentChat =
        getCurrentChat();


    if (!currentChat) {
        return;
    }


    // 👤 User message
    const userMessage =
        document.createElement("div");

    userMessage.className =
        "message user";

    userMessage.textContent =
        "👤 You: " + message;

    chat.appendChild(userMessage);


    messageInput.value = "";


    // 🧠 Save user message
    currentChat.messages.push({

        role: "user",

        content: message

    });


    // 📝 Update title
    currentChat.title =
        getChatTitle(currentChat.messages);


    saveSessions();


    // 🤖 Thinking
    const thinkingMessage =
        document.createElement("div");

    thinkingMessage.className =
        "message ai";

    thinkingMessage.textContent =
        "🤖 AI सोच रहा है...";

    chat.appendChild(thinkingMessage);


    // 🚫 Disable input
    messageInput.disabled = true;

    button.disabled = true;


    chat.scrollTop =
        chat.scrollHeight;


    try {

        const response =
            await fetch(
                BACKEND_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: message,

                        messages:
                            currentChat.messages

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.reply ||
                "HTTP Error: " +
                response.status
            );

        }


        // 🤖 Show AI reply
        thinkingMessage.textContent =
            "🤖 AI: " + data.reply;


        // 🧠 Save AI reply
        currentChat.messages.push({

            role: "assistant",

            content: data.reply

        });


        saveSessions();


    } catch (error) {

        thinkingMessage.textContent =
            "❌ Error: " +
            error.message;


        // Failed user message हटाओ
        currentChat.messages.pop();

        saveSessions();

    }


    // ✅ Enable input
    messageInput.disabled = false;

    button.disabled = false;

    messageInput.focus();

    chat.scrollTop =
        chat.scrollHeight;

}


// ==========================================
// ⌨️ Enter Key
// ==========================================

document
    .getElementById("message")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {
                sendMessage();
            }

        }
    );


// ==========================================
// ➕ New Chat Button
// ==========================================

document
    .getElementById("newChatButton")
    .addEventListener(
        "click",
        function() {

            createNewChat(true);

        }
    );


// ==========================================
// 🗑️ Clear Current Chat
// ==========================================

document
    .getElementById("clearChat")
    .addEventListener(
        "click",
        function() {

            const currentChat =
                getCurrentChat();


            if (!currentChat) {
                return;
            }


            currentChat.messages = [];

            currentChat.title =
                "New Chat";


            saveSessions();


            document
                .getElementById("chat")
                .innerHTML = "";


            showHistory();

        }
    );


// ==========================================
// 📜 Open History
// ==========================================

document
    .getElementById("historyButton")
    .addEventListener(
        "click",
        function() {

            showHistory();

            document
                .getElementById("historyPanel")
                .style.display = "block";

        }
    );


// ==========================================
// ❌ Close History
// ==========================================

document
    .getElementById("closeHistory")
    .addEventListener(
        "click",
        function() {

            document
                .getElementById("historyPanel")
                .style.display = "none";

        }
    );


// ==========================================
// 📜 Show Chat History
// ==========================================

function showHistory() {

    const historyList =
        document.getElementById("historyList");


    historyList.innerHTML = "";


    if (chatSessions.length === 0) {

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


    // Latest chat first
    const sessions =
        [...chatSessions].reverse();


    sessions.forEach(
        function(session) {

            const historyItem =
                document.createElement("div");

            historyItem.className =
                "history-item";


            const title =
                document.createElement("div");

            title.className =
                "history-item-title";

            title.textContent =
                "💬 " + session.title;


            const preview =
                document.createElement("div");

            preview.className =
                "history-item-preview";


            if (session.messages.length > 0) {

                preview.textContent =
                    session.messages.length +
                    " messages";

            } else {

                preview.textContent =
                    "Empty chat";

            }


            historyItem.appendChild(title);

            historyItem.appendChild(preview);


            // 👆 Open chat
            historyItem.addEventListener(
                "click",
                function() {

                    currentChatId =
                        session.id;

                    saveSessions();

                    loadCurrentChat();


                    document
                        .getElementById(
                            "historyPanel"
                        )
                        .style.display =
                        "none";

                }
            );


            historyList.appendChild(
                historyItem
            );

        }
    );

}


// ==========================================
// 📂 Load Current Chat
// ==========================================

function loadCurrentChat() {

    const chat =
        document.getElementById("chat");


    chat.innerHTML = "";


    const currentChat =
        getCurrentChat();


    if (!currentChat) {
        return;
    }


    currentChat.messages.forEach(
        function(item) {

            const message =
                document.createElement("div");


            if (item.role === "user") {

                message.className =
                    "message user";

                message.textContent =
                    "👤 You: " +
                    item.content;

            }


            if (item.role === "assistant") {

                message.className =
                    "message ai";

                message.textContent =
                    "🤖 AI: " +
                    item.content;

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


// ==========================================
// 📥 Export Current Chat
// ==========================================

document
    .getElementById("exportChat")
    .addEventListener(
        "click",
        function() {

            const currentChat =
                getCurrentChat();


            if (
                !currentChat ||
                currentChat.messages.length === 0
            ) {

                alert(
                    "📭 No chat history to export."
                );

                return;

            }


            let text =
                "🤖 AI Chat System - Chat History\n\n";


            text +=
                "💬 Chat: " +
                currentChat.title +
                "\n\n";


            currentChat.messages.forEach(
                function(item) {

                    if (item.role === "user") {

                        text +=
                            "👤 You: " +
                            item.content +
                            "\n\n";

                    }


                    if (item.role === "assistant") {

                        text +=
                            "🤖 AI: " +
                            item.content +
                            "\n\n";

                    }

                }
            );


            const blob =
                new Blob(
                    ["\uFEFF" + text],
                    {
                        type:
                            "text/plain;charset=utf-8"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const a =
                document.createElement("a");


            a.href = url;

            a.download =
                "AI-Chat-History.txt";


            a.click();


            URL.revokeObjectURL(url);

        }
    );


// ==========================================
// 🚀 Load Chat On Page Open
// ==========================================

window.addEventListener(
    "load",
    function() {

        loadCurrentChat();

    }
);












