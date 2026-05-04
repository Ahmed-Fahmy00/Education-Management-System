const Message = require("../models/Message");

function sendMessage(payload) {
  return Message.create(payload);
}

function listInbox(receiverName) {
  return Message.find({ receiverName }).sort({ createdAt: -1 });
}

function listOutbox(senderName) {
  return Message.find({ senderName }).sort({ createdAt: -1 });
}

module.exports = { sendMessage, listInbox, listOutbox };
