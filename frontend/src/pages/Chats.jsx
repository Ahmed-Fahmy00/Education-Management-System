import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send, Loader2, X } from "lucide-react";
import { UserLayout } from "./Home";
import { sendMessage, getInbox, getStudents } from "../api/messages";
import "../styles/chats.css";

export default function Chats() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // State management
  const [selectedChat, setSelectedChat] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fetch all messages and students on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [inboxRes, studentsRes] = await Promise.all([
        getInbox(),
        getStudents(),
      ]);

      const messages = Array.isArray(inboxRes) ? inboxRes : [];
      setAllMessages(messages);

      // Build recent chats from messages
      const chatsMap = new Map();
      messages.forEach((msg) => {
        const otherPerson = msg.senderName;
        if (!chatsMap.has(otherPerson)) {
          chatsMap.set(otherPerson, {
            name: otherPerson,
            role: msg.senderRole,
            lastMessage: msg.body,
            lastMessageTime: msg.createdAt,
            unread: !msg.readAt,
          });
        }
      });
      setRecentChats(Array.from(chatsMap.values()));

      const students = Array.isArray(studentsRes) ? studentsRes : [];
      setAllStudents(students);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  // Handle search input
  const handleSearch = useCallback(
    (query) => {
      setSearchInput(query);
      if (query.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      const filtered = allStudents.filter(
        (student) =>
          student.name &&
          student.name.toLowerCase().includes(query.toLowerCase()) &&
          student.name !== currentUser.name // Don't show self
      );
      setSearchResults(filtered);
    },
    [allStudents, currentUser.name]
  );

  // Start a new chat with a student
  const startChat = useCallback(
    (student) => {
      const chatMessages = allMessages.filter(
        (msg) =>
          msg.senderName === student.name || msg.receiverName === student.name
      );

      setSelectedChat({
        name: student.name,
        role: student.role,
        messages: chatMessages,
      });
      setSearchInput("");
      setSearchResults([]);
      setShowSearch(false);
    },
    [allMessages]
  );

  // Click on recent chat
  const handleRecentChatClick = useCallback(
    (chat) => {
      const chatMessages = allMessages.filter(
        (msg) =>
          msg.senderName === chat.name || msg.receiverName === chat.name
      );

      setSelectedChat({
        name: chat.name,
        role: chat.role,
        messages: chatMessages,
      });
    },
    [allMessages]
  );

  // Send a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || sending) return;

    setSending(true);
    try {
      const payload = {
        senderName: currentUser.name,
        senderRole: currentUser.role,
        receiverName: selectedChat.name,
        receiverRole: selectedChat.role,
        body: messageInput,
        subject: `Chat with ${selectedChat.name}`,
      };

      await sendMessage(payload);

      // Add message to current chat
      const newMessage = {
        ...payload,
        createdAt: new Date().toISOString(),
        readAt: null,
      };

      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      setMessageInput("");

      // Update recent chats
      const updatedChats = recentChats.filter((c) => c.name !== selectedChat.name);
      updatedChats.unshift({
        name: selectedChat.name,
        role: selectedChat.role,
        lastMessage: messageInput,
        lastMessageTime: new Date().toISOString(),
        unread: false,
      });
      setRecentChats(updatedChats);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const chatContent = (
    <div className="chats-container">
      {/* ── Chats Sidebar ── */}
      <aside className="chats-sidebar">
        <div className="chats-sidebar-header">
          <h2>Chats</h2>
        </div>

        {/* Search bar */}
        <div className="chats-search-wrapper">
          <div className="chats-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
            />
            {searchInput && (
              <button onClick={() => {
                setSearchInput("");
                setSearchResults([]);
              }} className="chats-search-clear">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showSearch && searchResults.length > 0 && (
            <div className="chats-search-results">
              {searchResults.map((student) => (
                <button
                  key={student._id}
                  className="chats-search-result-item"
                  onClick={() => startChat(student)}
                >
                  <div className="chats-avatar">{student.name[0]}</div>
                  <div className="chats-result-info">
                    <div className="chats-result-name">{student.name}</div>
                    <div className="chats-result-role">{student.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent chats list */}
        <div className="chats-list">
          {recentChats.length === 0 ? (
            <div className="chats-empty">No chats yet</div>
          ) : (
            recentChats.map((chat) => (
              <button
                key={chat.name}
                className={`chats-item ${selectedChat?.name === chat.name ? "active" : ""}`}
                onClick={() => handleRecentChatClick(chat)}
              >
                <div className="chats-avatar">{chat.name[0]}</div>
                <div className="chats-item-content">
                  <div className="chats-item-name">{chat.name}</div>
                  <div className="chats-item-preview">
                    {chat.lastMessage.substring(0, 40)}
                    {chat.lastMessage.length > 40 ? "..." : ""}
                  </div>
                </div>
                {chat.unread && <div className="chats-unread-badge" />}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <div className="chats-main">
        {!selectedChat ? (
          // Empty state with icon
          <div className="chats-empty-state">
            <img
              src="/icons/chats_back.jpeg"
              alt="Chats"
              className="chats-empty-icon"
            />
            <h3>No chat selected</h3>
            <p>Start a conversation by selecting a recent chat or searching for a student</p>
          </div>
        ) : (
          // Chat view
          <>
            {/* Chat header */}
            <div className="chats-header">
              <div className="chats-header-content">
                <div className="chats-header-avatar">{selectedChat.name[0]}</div>
                <div>
                  <div className="chats-header-name">{selectedChat.name}</div>
                  <div className="chats-header-role">{selectedChat.role}</div>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className="chats-messages">
              {selectedChat.messages.length === 0 ? (
                <div className="chats-no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                selectedChat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chats-message ${
                      msg.senderName === currentUser.name ? "sent" : "received"
                    }`}
                  >
                    <div className="chats-message-bubble">
                      {msg.body}
                    </div>
                    <div className="chats-message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="chats-input-area">
              <div className="chats-input-wrapper">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="chats-input"
                />
                <button
                  className="chats-send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                >
                  {sending ? (
                    <Loader2 size={18} className="spinner" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <UserLayout user={currentUser} onLogout={handleLogout}>
        <div className="chats-container">
          <div className="chats-loading">
            <Loader2 size={24} className="spinner" />
            <p>Loading chats...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout user={currentUser} onLogout={handleLogout}>
      {chatContent}
    </UserLayout>
  );
}
