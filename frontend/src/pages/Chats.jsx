import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send, Loader2, X, ChevronDown } from "lucide-react";
import { io } from "socket.io-client";
import { UserLayout } from "./Home";
import {
  sendMessage,
  getAllChats,
  getConversation,
  getStudents,
  getStaff,
} from "../api/messages";
import "../styles/chats.css";

export default function Chats() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const socketRef = useRef(null);

  // State management
  const [selectedChat, setSelectedChat] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [chatPage, setChatPage] = useState(0);
  const messagesEndRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("receive_message", (message) => {
      console.log("Received message:", message);
      setSelectedChat((prev) => {
        if (!prev) return prev;
        
        // Check if this message is for the current chat
        const isForCurrentChat = 
          (message.senderName === prev.name) || 
          (message.receiverName === prev.name);
        
        if (isForCurrentChat) {
          // Avoid duplicates if message is from current user
          const isDuplicate = prev.messages.some(m => m._id === message._id);
          if (!isDuplicate && message.senderName !== currentUser.name) {
            return {
              ...prev,
              messages: [...prev.messages, message],
            };
          }
        }
        return prev;
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [chatsRes, studentsRes, staffRes] = await Promise.all([
        getAllChats(currentUser.name, 10, 0),
        getStudents(),
        getStaff(),
      ]);

      const chats = Array.isArray(chatsRes) ? chatsRes : [];
      setRecentChats(chats);
      setHasMoreChats(chats.length === 10);

      // Combine students and staff for search
      const students = Array.isArray(studentsRes) ? studentsRes : [];
      const staff = Array.isArray(staffRes) ? staffRes : [];
      const allUsersData = [
        ...students,
        ...staff,
      ].filter((u) => u.name !== currentUser.name);
      setAllUsers(allUsersData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.name]);

  // Load more chats
  const loadMoreChats = useCallback(async () => {
    if (chatsLoading || !hasMoreChats) return;

    setChatsLoading(true);
    try {
      const nextPage = chatPage + 1;
      const skip = nextPage * 10;
      const moreChats = await getAllChats(currentUser.name, 10, skip);

      const chatsArray = Array.isArray(moreChats) ? moreChats : [];
      setRecentChats((prev) => [...prev, ...chatsArray]);
      setHasMoreChats(chatsArray.length === 10);
      setChatPage(nextPage);
    } catch (error) {
      console.error("Error loading more chats:", error);
    } finally {
      setChatsLoading(false);
    }
  }, [chatPage, currentUser.name, hasMoreChats, chatsLoading]);

  // Handle search input
  const handleSearch = useCallback(
    (query) => {
      setSearchInput(query);
      console.log("Search query:", query, "All users available:", allUsers.length);
      if (query.trim().length < 1) {
        setSearchResults([]);
        return;
      }

      const filtered = allUsers.filter(
        (user) =>
          user.name &&
          user.name.toLowerCase().startsWith(query.toLowerCase())
      );
      console.log("Filtered results:", filtered);
      setSearchResults(filtered);
    },
    [allUsers]
  );

  // Handle search input blur with delay to allow clicks
  const handleSearchBlur = useCallback(() => {
    setTimeout(() => {
      setShowSearch(false);
    }, 150);
  }, []);

  // Open a chat with a user
  const openChat = useCallback(
    async (user) => {
      try {
        const conversation = await getConversation(currentUser.name, user.name);
        const messages = Array.isArray(conversation) ? conversation : [];

        setSelectedChat({
          name: user.name,
          role: user.role || "student",
          messages,
        });

        // Join socket room
        if (socketRef.current) {
          socketRef.current.emit("join_chat", {
            userName: currentUser.name,
            otherUserName: user.name,
          });
        }

        // Clear search
        setSearchInput("");
        setSearchResults([]);
        setShowSearch(false);
      } catch (error) {
        console.error("Error loading conversation:", error);
      }
    },
    [currentUser.name]
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

      // Send via socket for real-time delivery and database persistence
      if (socketRef.current) {
        socketRef.current.emit("send_message", payload);
      }

      // Add message to local state immediately for optimistic UI update
      const newMessage = {
        senderName: payload.senderName,
        senderRole: payload.senderRole,
        receiverName: payload.receiverName,
        receiverRole: payload.receiverRole,
        body: payload.body,
        subject: payload.subject,
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

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
              placeholder="Search students/staff..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                setShowSearch(true);
                console.log("Search focused, allUsers:", allUsers.length);
              }}
              onBlur={handleSearchBlur}
              className="chats-search-input"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchResults([]);
                  setShowSearch(false);
                }}
                className="chats-search-clear"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showSearch && searchResults.length > 0 && (
            <div className="chats-search-results">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  className="chats-search-result-item"
                  onClick={() => openChat(user)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="chats-avatar">{user.name[0]}</div>
                  <div className="chats-result-info">
                    <div className="chats-result-name">{user.name}</div>
                    <div className="chats-result-role">{user.role || "student"}</div>
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
            <>
              {recentChats.map((chat) => (
                <button
                  key={chat.name}
                  className={`chats-item ${
                    selectedChat?.name === chat.name ? "active" : ""
                  }`}
                  onClick={() => openChat(chat)}
                >
                  <div className="chats-avatar">{chat.name[0]}</div>
                  <div className="chats-item-content">
                    <div className="chats-item-name">{chat.name}</div>
                    <div className="chats-item-preview">
                      {chat.lastMessage.substring(0, 40)}
                      {chat.lastMessage.length > 40 ? "..." : ""}
                    </div>
                  </div>
                </button>
              ))}

              {hasMoreChats && (
                <button
                  className="chats-load-more"
                  onClick={loadMoreChats}
                  disabled={chatsLoading}
                >
                  {chatsLoading ? (
                    <>
                      <Loader2 size={14} className="spinner" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Load more chats
                    </>
                  )}
                </button>
              )}
            </>
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
            <p>
              Start a conversation by selecting a recent chat or searching for
              someone
            </p>
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
                  <p>No messages yet. Messaging coming soon!</p>
                </div>
              ) : (
                selectedChat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chats-message ${
                      msg.senderName === currentUser.name ? "sent" : "received"
                    }`}
                  >
                    <div className="chats-message-bubble">{msg.body}</div>
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

  return (
    <UserLayout user={currentUser} onLogout={handleLogout}>
      {chatContent}
    </UserLayout>
  );
}
