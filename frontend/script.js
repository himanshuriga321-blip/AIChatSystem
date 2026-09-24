/* =========================================================
   🤖 AI CHAT SYSTEM
   Complete Frontend Controller
========================================================= */

let currentDocumentId = null;

let savedDocuments =
    JSON.parse(localStorage.getItem("savedDocuments")) || [];

function saveDocuments() {
    localStorage.setItem(
        "savedDocuments",
        JSON.stringify(savedDocuments)
    );
}

function renderDocuments() {

    const list =
        $("documentsList");

    const empty =
        $("documentsEmpty");

    if (!list) return;

    list.innerHTML = "";

    if (
        savedDocuments.length === 0
    ) {
        if (empty) {
            empty.hidden = false;
            empty.textContent =
                "📄 No documents yet.";
        }
        return;
    }

    if (empty) {
        empty.hidden = true;
    }

    savedDocuments.forEach(
        function(savedDocument) {

            const item =
                document.createElement("div");

            item.className =
                "document-item";

            item.innerHTML = `
                <div class="document-info">
                    <strong>📄 ${savedDocument.name}</strong>
                    <small>
                        📅 ${new Date(
                            savedDocument.uploadedAt
                        ).toLocaleString()}
                    </small>
                </div>

                <div class="document-actions">
                    <button
                        type="button"
                        class="document-open"
                        data-document-id="${savedDocument.id}"
                    >
                        📂 Open
                    </button>

                    <button
                        type="button"
                        class="document-delete"
                        data-document-id="${savedDocument.id}"
                    >
                        🗑️ Delete
                    </button>

                    <button
                        type="button"
                        class="document-attach"
                        data-document-id="${savedDocument.id}"
                    >
                        🔄 Attach
                    </button>
                </div>
            `;

            list.appendChild(item);
        }
    );
}


function openDocument(documentId) {

    const savedDocument =
        savedDocuments.find(
            function(savedDocument) {
                return savedDocument.id === documentId;
            }
        );

    if (!savedDocument) {
        alert("❌ Document नहीं मिला।");
        return;
    }

    const content =
        savedDocument.content || "";

    if (!content) {
        alert("📄 इस document का content उपलब्ध नहीं है।");
        return;
    }

    const title =
        $("documentPreviewTitle");

    const date =
        $("documentPreviewDate");

    const preview =
        $("documentPreviewContent");

    const panel =
        $("documentPreviewPanel");

    const overlay =
        $("screenOverlay");

    if (!title || !date || !preview || !panel) {
        alert("❌ Document Preview Panel नहीं मिला।");
        return;
    }

    title.textContent =
        "📄 " + savedDocument.name;

    date.textContent =
        "📅 Uploaded: " +
        new Date(
            savedDocument.uploadedAt
        ).toLocaleString();

    preview.textContent =
        content.slice(0, 50000);

    panel.hidden = false;
    panel.classList.add("open");

    if (overlay) {
        overlay.hidden = false;
    }

    closeMenu();
}

function attachDocument(documentId) {

    const savedDocument =
        savedDocuments.find(
            function(savedDocument) {
                return savedDocument.id === documentId;
            }
        );

    if (!savedDocument) {
        alert("❌ Document नहीं मिला।");
        return;
    }

    if (!currentChatId) {
        alert("❌ पहले कोई chat select करें।");
        return;
    }

    const currentChat =
        getCurrentChat();

    if (!currentChat) {
        alert("❌ Current chat नहीं मिली।");
        return;
    }

    currentChat.documentId =
        savedDocument.id;

    currentDocumentId =
        savedDocument.id;

    savedDocument.chatId =
        currentChat.id;

    saveSessions();
    saveDocuments();

    closeFeaturePanel("documentsPanel");
    closeMenu();

    alert(
        "✅ Document attach हो गया!\n\n" +
        "📄 " +
        savedDocument.name +
        "\n" +
        "💬 Current chat से connected."
    );
}


function deleteDocument(documentId) {

    const documentIndex =
        savedDocuments.findIndex(
            function(savedDocument) {
                return savedDocument.id === documentId;
            }
        );

    if (documentIndex === -1) {
        alert("❌ Document नहीं मिला।");
        return;
    }

    const savedDocument =
        savedDocuments[documentIndex];

    const confirmed =
        confirm(
            "🗑️ क्या आप \"" +
            savedDocument.name +
            "\" delete करना चाहते हैं?"
        );

    if (!confirmed) return;

    savedDocuments.splice(
        documentIndex,
        1
    );

    saveDocuments();

    renderDocuments();

    alert("✅ Document delete हो गया।");
}


document.addEventListener(
    "click",
    function(event) {

        const deleteButton =
            event.target.closest(
                ".document-delete"
            );

        if (!deleteButton) return;

        const documentId =
            deleteButton.dataset.documentId;

        deleteDocument(documentId);
    }
);


document.addEventListener(
    "click",
    function(event) {

        const openButton =
            event.target.closest(
                ".document-open"
            );

        if (!openButton) return;

        const documentId =
            openButton.dataset.documentId;

        openDocument(documentId);
    }
);


function searchDocuments(query) {

    const list =
        $("documentsList");

    const empty =
        $("documentsEmpty");

    if (!list) return;

    const search =
        query.trim().toLowerCase();

    const filtered =
        savedDocuments.filter(
            function(savedDocument) {
                return savedDocument.name
                    .toLowerCase()
                    .includes(search);
            }
        );

    list.innerHTML = "";

    if (filtered.length === 0) {
        if (empty) {
            empty.hidden = false;
            empty.textContent =
                "🔍 कोई document नहीं मिला।";
        }
        return;
    }

    if (empty) {
        empty.hidden = true;
    }

    filtered.forEach(
        function(savedDocument) {

            const item =
                document.createElement("div");

            item.className =
                "document-item";

            item.innerHTML = `
                <div class="document-info">
                    <strong>📄 ${savedDocument.name}</strong>
                    <small>
                        ${new Date(
                            savedDocument.uploadedAt
                        ).toLocaleString()}
                    </small>
                </div>
            `;

            list.appendChild(item);
        }
    );
}

async function uploadDocument(content) {
    const documentId = "doc-" + Date.now();
    const response = await fetch(BACKEND_URL + "/document", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({document_id: documentId, content: content})
    });
    if (!response.ok) throw new Error("Document upload failed");
    currentDocumentId = documentId;

    const currentChat = getCurrentChat();
    if (currentChat) {
        currentChat.documentId = documentId;
        saveSessions();
    }

    return documentId;
}

const BACKEND_URL =
    "http://127.0.0.1:5000";


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = function(id) {
    return document.getElementById(id);
};


/* =========================================================
   STORAGE
========================================================= */

let chatSessions =
    JSON.parse(localStorage.getItem("chatSessions")) || [];

let currentChatId =
    localStorage.getItem("currentChatId");


/* =========================================================
   CHAT TITLE
========================================================= */

function getChatTitle(messages) {

    const firstUserMessage =
        messages.find(function(item) {
            return item.role === "user";
        });

    if (!firstUserMessage) {
        return "New Chat";
    }

    let title =
        String(firstUserMessage.content || "").trim();

    if (!title) {
        return "New Chat";
    }

    if (title.length > 28) {
        title =
            title.substring(0, 28) + "...";
    }

    return title;
}


/* =========================================================
   INITIAL MIGRATION
========================================================= */

if (chatSessions.length === 0) {

    const oldConversation =
        JSON.parse(
            localStorage.getItem("conversationHistory")
        ) || [];

    if (oldConversation.length > 0) {

        chatSessions.push({
            id: Date.now().toString(),

            title:
                getChatTitle(oldConversation),

            messages:
                oldConversation,

            createdAt:
                new Date().toISOString(),

            pinned: false
        });
    }

    localStorage.removeItem(
        "conversationHistory"
    );
}


/* =========================================================
   CURRENT CHAT
========================================================= */

if (
    !currentChatId ||
    !chatSessions.some(function(chat) {
        return chat.id === currentChatId;
    })
) {

    currentChatId =
        chatSessions.length > 0
            ? chatSessions[chatSessions.length - 1].id
            : null;
}

const startupChat = getCurrentChat();

currentDocumentId =
    startupChat
        ? (startupChat.documentId || null)
        : null;


/* =========================================================
   SAVE
========================================================= */

function saveSessions() {

    localStorage.setItem(
        "chatSessions",
        JSON.stringify(chatSessions)
    );

    if (currentChatId) {

        localStorage.setItem(
            "currentChatId",
            currentChatId
        );

    } else {

        localStorage.removeItem(
            "currentChatId"
        );
    }
}


/* =========================================================
   CURRENT CHAT OBJECT
========================================================= */

function getCurrentChat() {

    return chatSessions.find(function(chat) {
        return chat.id === currentChatId;
    });
}


/* =========================================================
   CHAT TITLE UI
========================================================= */

function updateChatTitle() {

    const titleElement =
        $("chatTitle");

    const currentChat =
        getCurrentChat();

    if (!titleElement) return;

    titleElement.textContent =
        currentChat
            ? currentChat.title
            : "New Chat";
}


/* =========================================================
   NEW CHAT
========================================================= */

function createNewChat(showMessage = true) {

    const newChat = {

        id:
            Date.now().toString(),

        title:
            "New Chat",

        messages: [],

        documentId: null,

        createdAt:
            new Date().toISOString(),

        pinned: false
    };

    chatSessions.push(newChat);

    currentChatId =
        newChat.id;

    currentDocumentId = null;

    saveSessions();

    renderChat();

    updateChatTitle();

    closeAllPanels();

    if (showMessage) {

        addSystemMessage(
            "🤖 New chat started!"
        );
    }
}


/* =========================================================
   SYSTEM MESSAGE
========================================================= */

function addSystemMessage(text) {

    const chat =
        $("chat");

    if (!chat) return;

    const message =
        document.createElement("div");

    message.className =
        "message ai";

    message.textContent =
        text;

    chat.appendChild(message);

    chat.scrollTop =
        chat.scrollHeight;
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    const input =
        $("message");

    const button =
        $("sendButton");

    const chatElement =
        $("chat");

    if (!input || !chatElement) {
        return;
    }

    const message =
        input.value.trim();

    if (!message) {
        return;
    }


    let currentChat =
        getCurrentChat();


    if (!currentChat) {

        createNewChat(false);

        currentChat =
            getCurrentChat();
    }


    /* USER MESSAGE */

    currentChat.messages.push({

        role: "user",

        content:
            message
    });


    if (
        currentChat.title ===
        "New Chat"
    ) {

        currentChat.title =
            getChatTitle(
                currentChat.messages
            );
    }


    saveSessions();

    updateChatTitle();


    input.value = "";


    /* Render immediately */

    renderChat();


    /* Thinking */

    const thinking =
        document.createElement("div");

    thinking.className =
        "message ai";

    thinking.textContent =
        "🤖 AI सोच रहा है...";

    chatElement.appendChild(
        thinking
    );


    input.disabled = true;

    if (button) {
        button.disabled = true;
    }


    chatElement.scrollTop =
        chatElement.scrollHeight;


    try {

        const response =
            await fetch(
                BACKEND_URL + "/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message:
                                message,

                            messages:
                                currentChat.messages,

                            document_id:
                                currentDocumentId
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


        const reply =
            data.reply ||
            "No response";


        thinking.textContent =
            "🤖 AI: " + reply;


        currentChat.messages.push({

            role: "assistant",

            content:
                reply
        });


        saveSessions();

        updateChatTitle();


    } catch (error) {

        thinking.textContent =
            "❌ Error: " +
            error.message;


        /*
           Remove only the user message
           if AI failed.
        */

        if (
            currentChat.messages.length > 0 &&
            currentChat.messages[
                currentChat.messages.length - 1
            ].role === "user"
        ) {

            currentChat.messages.pop();
        }


        saveSessions();
    }


    input.disabled = false;

    if (button) {
        button.disabled = false;
    }

    input.focus();

    chatElement.scrollTop =
        chatElement.scrollHeight;
}


/* =========================================================
   RENDER CHAT
========================================================= */

function renderChat() {

    const chat =
        $("chat");

    if (!chat) return;


    chat.innerHTML = "";


    const currentChat =
        getCurrentChat();


    if (
        !currentChat ||
        currentChat.messages.length === 0
    ) {

        renderWelcome();

        updateChatTitle();

        return;
    }


    currentChat.messages.forEach(
        function(item) {

            const message =
                document.createElement("div");


            if (
                item.role === "user"
            ) {

                message.className =
                    "message user";

                message.textContent =
                    "👤 You: " +
                    item.content;

            }


            if (
                item.role === "assistant"
            ) {

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

                chat.appendChild(
                    message
                );
            }
        }
    );


    chat.scrollTop =
        chat.scrollHeight;


    updateChatTitle();
}


/* =========================================================
   WELCOME SCREEN
========================================================= */

function renderWelcome() {

    const chat =
        $("chat");

    if (!chat) return;


    const welcome =
        document.createElement("div");

    welcome.id =
        "welcomeScreen";

    welcome.className =
        "welcome-screen";


    welcome.innerHTML = `
        <div class="welcome-logo">✨</div>

        <h1>AI Chat System</h1>

        <p>
            Your personal AI assistant. Ask anything.
        </p>

        <div class="suggestions">

            <button
                class="suggestion-card"
                data-message="Explain artificial intelligence in simple words."
                type="button"
            >
                <span>🤖</span>
                <div>
                    <strong>AI Explained</strong>
                    <small>Learn something new</small>
                </div>
            </button>

            <button
                class="suggestion-card"
                data-message="Give me some creative project ideas."
                type="button"
            >
                <span>💡</span>
                <div>
                    <strong>Project Ideas</strong>
                    <small>Get creative ideas</small>
                </div>
            </button>

            <button
                class="suggestion-card"
                data-message="Teach me Python programming step by step."
                type="button"
            >
                <span>🐍</span>
                <div>
                    <strong>Learn Python</strong>
                    <small>Practice programming</small>
                </div>
            </button>

            <button
                class="suggestion-card"
                data-message="Give me a useful productivity tip."
                type="button"
            >
                <span>🚀</span>
                <div>
                    <strong>Productivity</strong>
                    <small>Improve your day</small>
                </div>
            </button>

        </div>
    `;


    chat.appendChild(
        welcome
    );


    attachSuggestionEvents();
}


/* =========================================================
   SUGGESTIONS
========================================================= */

function attachSuggestionEvents() {

    document
        .querySelectorAll(
            ".suggestion-card"
        )
        .forEach(function(card) {

            card.addEventListener(
                "click",
                function() {

                    const input =
                        $("message");

                    if (!input) return;

                    input.value =
                        card.dataset.message ||
                        "";

                    input.focus();
                }
            );
        });
}


/* =========================================================
   MENU
========================================================= */

function openMenu() {

    const sidebar =
        $("sidebar");

    const overlay =
        $("screenOverlay");


    if (sidebar) {

        sidebar.classList.add(
            "open"
        );
    }


    if (overlay) {

        overlay.hidden =
            false;
    }
}


function closeMenu() {

    const sidebar =
        $("sidebar");

    const overlay =
        $("screenOverlay");


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );
    }


    if (overlay) {

        overlay.hidden =
            true;
    }
}


/* =========================================================
   GENERIC PANELS
========================================================= */

function closeAllPanels() {

    closeHistory();

    closeFeaturePanel(
        "premiumPanel"
    );

    closeFeaturePanel(
        "projectsPanel"
    );

    closeFeaturePanel(
        "settingsPanel"
    );

    closeMenu();
}


function openFeaturePanel(id) {

    closeHistory();

    const panel =
        $(id);

    const overlay =
        $("screenOverlay");

    if (!panel) return;

    panel.hidden =
        false;

    if (overlay) {

        overlay.hidden =
            false;
    }

    closeMenu();
}


function closeFeaturePanel(id) {

    const panel =
        $(id);

    const overlay =
        $("screenOverlay");

    if (!panel) return;

    panel.classList.remove(
        "open"
    );

    panel.hidden =
        true;

    if (overlay) {
        overlay.hidden =
            true;
    }
}


/* =========================================================
   HISTORY
========================================================= */

function openHistory() {

    const panel =
        $("historyPanel");

    const overlay =
        $("screenOverlay");


    if (!panel) return;


    showHistory();


    panel.classList.add(
        "open"
    );


    if (overlay) {

        overlay.hidden =
            false;
    }


    closeMenu();
}


function closeHistory() {

    const panel =
        $("historyPanel");

    const overlay =
        $("screenOverlay");


    if (panel) {

        panel.classList.remove(
            "open"
        );
    }


    /*
       Only hide overlay if
       no other feature panel is open.
    */

    const premiumOpen =
        $("premiumPanel") &&
        !$("premiumPanel").hidden;

    const projectsOpen =
        $("projectsPanel") &&
        !$("projectsPanel").hidden;

    const settingsOpen =
        $("settingsPanel") &&
        !$("settingsPanel").hidden;


    if (
        overlay &&
        !premiumOpen &&
        !projectsOpen &&
        !settingsOpen
    ) {

        overlay.hidden =
            true;
    }
}


/* =========================================================
   HISTORY LIST
========================================================= */

function showHistory() {

    const list =
        $("historyList");

    if (!list) return;


    list.innerHTML = "";


    if (chatSessions.length === 0) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "history-item";

        empty.textContent =
            "📭 No chat history yet.";

        list.appendChild(
            empty
        );

        return;
    }


    const sessions =
        chatSessions
            .slice()
            .sort(
                function(a, b) {

                    if (
                        a.pinned &&
                        !b.pinned
                    ) {
                        return -1;
                    }

                    if (
                        !a.pinned &&
                        b.pinned
                    ) {
                        return 1;
                    }

                    return (
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                    );
                }
            );


    sessions.forEach(
        function(session) {

            createHistoryItem(
                session,
                list
            );
        }
    );
}


/* =========================================================
   HISTORY ITEM
========================================================= */

function createHistoryItem(
    session,
    list,
    searchQuery
) {

    const item =
        document.createElement(
            "div"
        );

    item.className =
        "history-item";


    const title =
        document.createElement(
            "div"
        );

    title.className =
        "history-item-title";

    title.textContent =
        (
            session.pinned
                ? "📌 "
                : "💬 "
        ) +
        session.title;


    const preview =
        document.createElement(
            "div"
        );

    preview.className =
        "history-item-preview";

    const searchPreview =
        getChatSearchPreview(
            session,
            searchQuery || ""
        );

    preview.textContent =
        searchPreview ||
        (
            session.messages.length +
            " messages"
        );


    const pinButton =
        document.createElement(
            "button"
        );

    pinButton.type =
        "button";

    pinButton.textContent =
        session.pinned
            ? "📌 Unpin"
            : "📌 Pin";


    pinButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            session.pinned =
                !session.pinned;

            saveSessions();

            showHistory();
        }
    );


    const deleteButton =
        document.createElement(
            "button"
        );

    deleteButton.type =
        "button";

    deleteButton.textContent =
        "🗑️ Delete";


    deleteButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            if (
                confirm(
                    "🗑️ Delete this chat?"
                )
            ) {

                deleteChat(
                    session.id
                );
            }
        }
    );


    item.appendChild(title);

    item.appendChild(preview);

    item.appendChild(pinButton);

    item.appendChild(deleteButton);


    item.addEventListener(
        "click",
        function() {

            currentChatId =
                session.id;

            currentDocumentId =
                session.documentId || null;

            saveSessions();

            renderChat();

            updateChatTitle();

            closeHistory();
        }
    );


    list.appendChild(
        item
    );
}


/* =========================================================
   SEARCH HISTORY
========================================================= */

function getChatSearchPreview(chat, query) {

    if (!query) {
        return "";
    }

    const message =
        chat.messages.find(
            function(item) {
                return String(
                    item.content || ""
                )
                    .toLowerCase()
                    .includes(query);
            }
        );

    if (!message) {
        return "";
    }

    const content =
        String(message.content || "").trim();

    const index =
        content.toLowerCase().indexOf(query);

    const start =
        Math.max(0, index - 45);

    const end =
        Math.min(
            content.length,
            index + query.length + 75
        );

    let preview =
        content.slice(start, end);

    if (start > 0) {
        preview = "..." + preview;
    }

    if (end < content.length) {
        preview += "...";
    }

    return "🔎 " + preview;
}


function searchChats(searchText) {

    const list =
        $("historyList");

    if (!list) return;


    const query =
        searchText
            .trim()
            .toLowerCase();


    list.innerHTML = "";


    const results =
        chatSessions.filter(
            function(chat) {

                const titleMatch =
                    chat.title
                        .toLowerCase()
                        .includes(query);


                const messageMatch =
                    chat.messages.some(
                        function(item) {

                            return String(
                                item.content || ""
                            )
                                .toLowerCase()
                                .includes(query);
                        }
                    );


                return (
                    titleMatch ||
                    messageMatch
                );
            }
        );


    if (results.length === 0) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "history-item";

        empty.textContent =
            "🔍 No matching chats found.";

        list.appendChild(
            empty
        );

        return;
    }


    results
        .slice()
        .reverse()
        .forEach(
            function(session) {

                createHistoryItem(
                    session,
                    list,
                    query
                );
            }
        );
}


/* =========================================================
   DELETE CHAT
========================================================= */

function deleteChat(chatId) {

    chatSessions =
        chatSessions.filter(
            function(chat) {

                return chat.id !== chatId;
            }
        );


    if (
        currentChatId === chatId
    ) {

        currentChatId =
            chatSessions.length > 0
                ? chatSessions[
                    chatSessions.length - 1
                ].id
                : null;
    }


    if (!currentChatId) {

        createNewChat(false);

    } else {

        saveSessions();

        renderChat();
    }


    showHistory();

    updateChatTitle();
}


/* =========================================================
   DELETE ALL
========================================================= */

function deleteAllChats() {

    if (
        chatSessions.length === 0
    ) {
        return;
    }


    if (
        !confirm(
            "⚠️ Delete ALL chat history?"
        )
    ) {
        return;
    }


    chatSessions = [];

    currentChatId =
        null;

    saveSessions();

    createNewChat(false);

    showHistory();

    renderChat();
}


/* =========================================================
   CLEAR CURRENT CHAT
========================================================= */

function clearCurrentChat() {

    const currentChat =
        getCurrentChat();

    if (!currentChat) return;


    if (
        currentChat.messages.length === 0
    ) {

        return;
    }


    if (
        !confirm(
            "🗑️ Clear this chat?"
        )
    ) {

        return;
    }


    currentChat.messages =
        [];

    currentChat.title =
        "New Chat";


    saveSessions();

    renderChat();

    updateChatTitle();
}


/* =========================================================
   RENAME CHAT
========================================================= */

function renameCurrentChat() {

    const currentChat =
        getCurrentChat();

    if (!currentChat) return;


    const newName =
        prompt(
            "✏️ Enter new chat name:",
            currentChat.title
        );


    if (
        newName === null ||
        newName.trim() === ""
    ) {

        return;
    }


    currentChat.title =
        newName.trim();


    saveSessions();

    updateChatTitle();

    showHistory();
}


/* =========================================================
   EXPORT CHAT
========================================================= */


function exportCurrentChatJSON() {

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

    const jsonData =
        JSON.stringify(
            currentChat,
            null,
            2
        );

    const blob =
        new Blob(
            [
                "\uFEFF" +
                jsonData
            ],
            {
                type:
                    "application/json;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        "AI-Chat-" +
        currentChat.title
            .replace(
                /[^a-z0-9]/gi,
                "-"
            ) +
        ".json";

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    setTimeout(
        function() {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );
}

function importChatJSON(event) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        function(e) {

            try {

                const imported =
                    JSON.parse(
                        e.target.result
                    );

                if (
                    !imported ||
                    !Array.isArray(
                        imported.messages
                    )
                ) {

                    throw new Error(
                        "Invalid chat JSON structure."
                    );
                }

                const importedChat = {

                    id:
                        Date.now().toString(),

                    title:
                        String(
                            imported.title ||
                            "Imported Chat"
                        ),

                    messages:
                        imported.messages.map(
                            function(message) {

                                return {

                                    role:
                                        message.role ===
                                        "assistant"
                                            ? "assistant"
                                            : "user",

                                    content:
                                        String(
                                            message.content ||
                                            ""
                                        )
                                };
                            }
                        ),

                    documentId:
                        imported.documentId ||
                        null,

                    createdAt:
                        new Date().toISOString(),

                    pinned:
                        Boolean(
                            imported.pinned
                        )
                };

                chatSessions.push(
                    importedChat
                );

                currentChatId =
                    importedChat.id;

                currentDocumentId =
                    importedChat.documentId;

                saveSessions();

                showHistory();

                renderChat();

                alert(
                    "✅ Chat imported successfully!"
                );

            } catch (error) {

                console.error(
                    "JSON import error:",
                    error
                );

                alert(
                    "❌ Invalid or corrupted JSON chat file."
                );
            }

            event.target.value = "";
        };

    reader.readAsText(file);
}

function exportCurrentChat() {

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
        "🤖 AI Chat System\n\n";


    text +=
        "💬 Chat: " +
        currentChat.title +
        "\n";

    text +=
        "📅 Created: " +
        new Date(
            currentChat.createdAt
        ).toLocaleString() +
        "\n";

    if (currentChat.documentId) {

        const attachedDocument =
            savedDocuments.find(
                function(savedDocument) {
                    return (
                        savedDocument.id ===
                        currentChat.documentId
                    );
                }
            );

        if (attachedDocument) {
            text +=
                "📎 Document: " +
                attachedDocument.name +
                "\n";
        }
    }

    text += "\n";

    text +=
        "💬 Messages: " +
        currentChat.messages.length +
        "\n\n";


    currentChat.messages.forEach(
        function(item) {

            if (
                item.role === "user"
            ) {

                text +=
                    "👤 You: " +
                    item.content +
                    "\n\n";
            }


            if (
                item.role === "assistant"
            ) {

                text +=
                    "🤖 AI: " +
                    item.content +
                    "\n\n";
            }
        }
    );


    const blob =
        new Blob(
            [
                "\uFEFF" +
                text
            ],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        "AI-Chat-" +
        currentChat.title
            .replace(
                /[^a-z0-9]/gi,
                "-"
            ) +
        ".txt";


    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    setTimeout(
        function() {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );
}


/* =========================================================
   SHARE CHAT
========================================================= */

async function shareCurrentChat() {

    const currentChat =
        getCurrentChat();

    if (
        !currentChat ||
        currentChat.messages.length === 0
    ) {

        alert(
            "📭 No chat history to share."
        );

        return;
    }

    let text =
        "🤖 AI Chat System\n\n";

    text +=
        "💬 Chat: " +
        currentChat.title +
        "\n\n";

    currentChat.messages.forEach(
        function(item) {

            if (
                item.role === "user"
            ) {

                text +=
                    "👤 You: " +
                    item.content +
                    "\n\n";
            }

            if (
                item.role === "assistant"
            ) {

                text +=
                    "🤖 AI: " +
                    item.content +
                    "\n\n";
            }
        }
    );

    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    currentChat.title,

                text:
                    text

            });

        } catch (error) {

            if (
                error.name !==
                "AbortError"
            ) {

                console.error(
                    "Share error:",
                    error
                );

                alert(
                    "❌ Unable to share chat."
                );
            }
        }

        return;
    }

    try {

        await navigator.clipboard.writeText(
            text
        );

        alert(
            "✅ Chat copied to clipboard!"
        );

    } catch (error) {

        console.error(
            "Clipboard error:",
            error
        );

        alert(
            "❌ Unable to copy chat."
        );
    }
}


/* =========================================================
   ATTACHMENT
========================================================= */

function handleAttachment() {

    const fileInput = $("fileInput");

    if (fileInput) {
        fileInput.click();
    }
}


/* =========================================================
   FILE ANALYSIS
========================================================= */

async function handleFileSelected(event) {

    const file = event.target.files[0];

    if (!file) return;

    const allowedExtensions = [".txt", ".md", ".csv", ".json", ".html", ".css", ".js", ".py", ".pdf"];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
        alert("📄 अभी केवल .txt files supported हैं।");
        event.target.value = "";
        return;
    }

    if (fileName.endsWith(".pdf")) {

        if (typeof pdfjsLib === "undefined") {
            alert("❌ PDF.js load नहीं हुआ।");
            event.target.value = "";
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let content = "";

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                const page = await pdf.getPage(pageNumber);
                const textContent = await page.getTextContent();

                const pageText = textContent.items
                    .map(item => item.str)
                    .join(" ");

                content += pageText + "\n";
            }

            content = content.trim();

            if (!content) {
                alert("📄 PDF में readable text नहीं मिला।");
                event.target.value = "";
                return;
            }

            const documentId =
                await uploadDocument(content);

            const currentChat =
                getCurrentChat();

            savedDocuments.push({
                id: documentId,
                name: file.name,
                uploadedAt:
                    new Date().toISOString(),
                chatId:
                    currentChat
                        ? currentChat.id
                        : null,
                content:
                    content.slice(0, 50000)
            });

            saveDocuments();

            renderDocuments();

            const input = $("message");

            if (input) {
                input.value =
                    "इस PDF का analysis करो";
            }

            alert("✅ PDF text तैयार है। अब Send दबाएँ।");

        } catch (error) {
            alert("❌ PDF पढ़ने में समस्या: " + error.message);
        }

        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = async function() {

        const content = String(reader.result || "").trim();

        if (!content) {
            alert("📄 File खाली है।");
            event.target.value = "";
            return;
        }

        const input = $("message");

        if (input) {
            input.value =
                "इस file का analysis करो:\n\n" +
                content.slice(0, 12000);
        }

        alert("✅ File content तैयार है। अब Send दबाएँ।");

        event.target.value = "";
    };

    reader.readAsText(file);
}


/* =========================================================
   VOICE INPUT
========================================================= */

function startVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "🎤 Voice input is not supported by this browser."
        );

        return;
    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";

    recognition.interimResults =
        false;

    recognition.maxAlternatives =
        1;


    recognition.onstart =
        function() {

            const button =
                $("voiceButton");

            if (button) {

                button.textContent =
                    "🔴";
            }
        };


    recognition.onresult =
        function(event) {

            const input =
                $("message");

            if (!input) return;


            input.value =
                event.results[0][0]
                    .transcript;

            input.focus();
        };


    recognition.onerror =
        function() {

            const button =
                $("voiceButton");

            if (button) {

                button.textContent =
                    "🎤";
            }

            alert(
                "🎤 Voice input could not be started."
            );
        };


    recognition.onend =
        function() {

            const button =
                $("voiceButton");

            if (button) {

                button.textContent =
                    "🎤";
            }
        };


    recognition.start();
}


/* =========================================================
   SETTINGS
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark-theme"
    );


    const dark =
        document.body.classList.contains(
            "dark-theme"
        );


    localStorage.setItem(
        "darkTheme",
        dark ? "true" : "false"
    );
}


function loadTheme() {

    const dark =
        localStorage.getItem(
            "darkTheme"
        );


    if (dark === "true") {

        document.body.classList.add(
            "dark-theme"
        );
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEvents() {


    /* Menu */

    if ($("menuButton")) {

        $("menuButton")
            .addEventListener(
                "click",
                openMenu
            );
    }


    if ($("closeMenu")) {

        $("closeMenu")
            .addEventListener(
                "click",
                closeMenu
            );
    }


    /* Overlay */

    if ($("screenOverlay")) {

        $("screenOverlay")
            .addEventListener(
                "click",
                closeAllPanels
            );
    }


    /* New chat */

    if ($("newChatButton")) {

        $("newChatButton")
            .addEventListener(
                "click",
                function() {

                    createNewChat(true);
                }
            );
    }


    /* Rename */

    if ($("renameChatButton")) {

        $("renameChatButton")
            .addEventListener(
                "click",
                renameCurrentChat
            );
    }


    /* Clear */

    if ($("clearChat")) {

        $("clearChat")
            .addEventListener(
                "click",
                clearCurrentChat
            );
    }


    /* Export */

    if ($("exportChatJSON")) {

        $("exportChatJSON")
            .addEventListener(
                "click",
                exportCurrentChatJSON
            );
    }

    if ($("exportChat")) {

        $("exportChat")
            .addEventListener(
                "click",
                exportCurrentChat
            );
    }

    if ($("shareChat")) {

        $("shareChat")
            .addEventListener(
                "click",
                shareCurrentChat
            );
    }


    /* Import JSON */

    if ($("importChatJSON")) {

        $("importChatJSON")
            .addEventListener(
                "click",
                function() {

                    $("importChatJSONInput").click();
                }
            );
    }

    if ($("importChatJSONInput")) {

        $("importChatJSONInput")
            .addEventListener(
                "change",
                importChatJSON
            );
    }


    /* History */

    if ($("historyButton")) {

        $("historyButton")
            .addEventListener(
                "click",
                openHistory
            );
    }


    if ($("closeHistory")) {

        $("closeHistory")
            .addEventListener(
                "click",
                closeHistory
            );
    }


    /* Search */

    if ($("chatSearch")) {

        $("chatSearch")
            .addEventListener(
                "input",
                function() {

                    searchChats(
                        $("chatSearch").value
                    );
                }
            );
    }


    /* Delete all */

    if ($("deleteAllChats")) {

        $("deleteAllChats")
            .addEventListener(
                "click",
                deleteAllChats
            );
    }


    /* Documents */

    if ($("documentsButton")) {

        $("documentsButton")
            .addEventListener(
                "click",
                function() {

                    renderDocuments();

                    openFeaturePanel(
                        "documentsPanel"
                    );

                    const documentsPanel =
                        $("documentsPanel");

                    if (documentsPanel) {
                        documentsPanel.classList.add(
                            "open"
                        );
                    }
                }
            );
    }


    if ($("closeDocuments")) {

        $("closeDocuments")
            .addEventListener(
                "click",
                function() {

                    closeFeaturePanel(
                        "documentsPanel"
                    );

                    closeMenu();
                }
            );
    }


    if ($("documentSearch")) {

        $("documentSearch")
            .addEventListener(
                "input",
                function(event) {
                    searchDocuments(
                        event.target.value
                    );
                }
            );
    }


    if ($("clearDocuments")) {

        $("clearDocuments")
            .addEventListener(
                "click",
                function() {

                    if (
                        savedDocuments.length === 0
                    ) {
                        alert(
                            "📄 कोई document मौजूद नहीं है।"
                        );
                        return;
                    }

                    const confirmed =
                        confirm(
                            "⚠️ क्या आप सभी saved documents हटाना चाहते हैं?"
                        );

                    if (!confirmed) return;

                    savedDocuments = [];

                    saveDocuments();

                    renderDocuments();

                    const search =
                        $("documentSearch");

                    if (search) {
                        search.value = "";
                    }

                    alert(
                        "✅ सभी documents हटाए गए।"
                    );
                }
            );
    }


    /* Premium */

    if ($("premiumButton")) {

        $("premiumButton")
            .addEventListener(
                "click",
                function() {

                    openFeaturePanel(
                        "premiumPanel"
                    );
                }
            );
    }


    if ($("closePremium")) {

        $("closePremium")
            .addEventListener(
                "click",
                function() {

                    closeFeaturePanel(
                        "premiumPanel"
                    );

                    closeMenu();
                }
            );
    }


    if ($("explorePremium")) {

        $("explorePremium")
            .addEventListener(
                "click",
                function() {

                    alert(
                        "✨ Premium features will be connected in the next upgrade."
                    );
                }
            );
    }


    /* Projects */

    if ($("projectsButton")) {

        $("projectsButton")
            .addEventListener(
                "click",
                function() {

                    openFeaturePanel(
                        "projectsPanel"
                    );
                }
            );
    }


    if ($("closeProjects")) {

        $("closeProjects")
            .addEventListener(
                "click",
                function() {

                    closeFeaturePanel(
                        "projectsPanel"
                    );

                    closeMenu();
                }
            );
    }


    if ($("createProject")) {

        $("createProject")
            .addEventListener(
                "click",
                function() {

                    const name =
                        prompt(
                            "📁 Enter project name:"
                        );


                    if (
                        name &&
                        name.trim()
                    ) {

                        alert(
                            "📁 Project \"" +
                            name.trim() +
                            "\" created!"
                        );
                    }
                }
            );
    }


    /* Settings */

    if ($("settingsButton")) {

        $("settingsButton")
            .addEventListener(
                "click",
                function() {

                    openFeaturePanel(
                        "settingsPanel"
                    );
                }
            );
    }


    if ($("closeSettings")) {

        $("closeSettings")
            .addEventListener(
                "click",
                function() {

                    closeFeaturePanel(
                        "settingsPanel"
                    );

                    closeMenu();
                }
            );
    }


    if ($("themeSetting")) {

        $("themeSetting")
            .addEventListener(
                "click",
                toggleTheme
            );
    }


    if ($("languageSetting")) {

        $("languageSetting")
            .addEventListener(
                "click",
                function() {

                    alert(
                        "🌐 Language settings will be expanded in the next upgrade."
                    );
                }
            );
    }


    if ($("voiceSetting")) {

        $("voiceSetting")
            .addEventListener(
                "click",
                function() {

                    alert(
                        "🎤 Voice settings will be expanded in the next upgrade."
                    );
                }
            );
    }


    /* Attach */

    if ($("attachButton")) {

        $("attachButton")
            .addEventListener(
                "click",
                handleAttachment
            );
    }


    if ($("fileInput")) {
        $("fileInput").addEventListener("change", handleFileSelected);
    }

    /* Voice */

    if ($("voiceButton")) {

        $("voiceButton")
            .addEventListener(
                "click",
                startVoiceInput
            );
    }


    /* Send */

    if ($("sendButton")) {

        $("sendButton")
            .addEventListener(
                "click",
                sendMessage
            );
    }


    /* Enter */

    if ($("message")) {

        $("message")
            .addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        sendMessage();
                    }
                }
            );
    }


    /* Suggestions */

    attachSuggestionEvents();
}


/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener(
    "load",
    function() {

        loadTheme();

        setupEvents();


        if (
            chatSessions.length === 0
        ) {

            createNewChat(false);

        } else {

            saveSessions();
        }


        renderChat();

        updateChatTitle();
    }
);

/* ================= DOCUMENT PREVIEW CLOSE ================= */

if ($("closeDocumentPreview")) {
    $("closeDocumentPreview").addEventListener(
        "click",
        function() {
            closeFeaturePanel("documentPreviewPanel");
        }
    );
}

/* ================= DOCUMENT ATTACH ================= */

document.addEventListener(
    "click",
    function(event) {

        const attachButton =
            event.target.closest(
                ".document-attach"
            );

        if (!attachButton) return;

        const documentId =
            attachButton.dataset.documentId;

        attachDocument(documentId);
    }
);
