const { Server } = require("socket.io");
const Message = require("../models/Message");

function initSocket(httpServer, corsOrigin = "*") {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a chat room (room name = sorted user names)
    socket.on("join_chat", (data) => {
      const { userName, otherUserName } = data;
      const roomName = [userName, otherUserName].sort().join("-");
      socket.join(roomName);
      console.log(`${userName} joined room: ${roomName}`);
    });

    // Handle sending a message
    socket.on("send_message", async (data) => {
      const { senderName, senderRole, receiverName, receiverRole, body, subject } = data;
      const roomName = [senderName, receiverName].sort().join("-");

      try {
        // Save message to database
        const message = new Message({
          senderName,
          senderRole,
          receiverName,
          receiverRole,
          body,
          subject,
        });
        await message.save();

        // Emit to both users in the room with the saved message data
        io.to(roomName).emit("receive_message", {
          _id: message._id,
          senderName,
          senderRole,
          receiverName,
          receiverRole,
          body,
          subject,
          createdAt: message.createdAt,
          readAt: message.readAt,
        });
      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // Leave chat room
    socket.on("leave_chat", (data) => {
      const { userName, otherUserName } = data;
      const roomName = [userName, otherUserName].sort().join("-");
      socket.leave(roomName);
      console.log(`${userName} left room: ${roomName}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { initSocket };
