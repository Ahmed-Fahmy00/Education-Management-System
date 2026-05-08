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

function listAllChats(userName, limit = 10, skip = 0) {
  // Get all messages where user is either sender or receiver
  return Message.aggregate([
    {
      $match: {
        $or: [{ senderName: userName }, { receiverName: userName }],
      },
    },
    {
      $addFields: {
        otherPerson: {
          $cond: [
            { $eq: ["$senderName", userName] },
            "$receiverName",
            "$senderName",
          ],
        },
        otherPersonRole: {
          $cond: [
            { $eq: ["$senderName", userName] },
            "$receiverRole",
            "$senderRole",
          ],
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$otherPerson",
        lastMessage: { $first: "$body" },
        lastMessageTime: { $first: "$createdAt" },
        otherPersonRole: { $first: "$otherPersonRole" },
        messageCount: { $sum: 1 },
      },
    },
    {
      $sort: { lastMessageTime: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        role: "$otherPersonRole",
        lastMessage: 1,
        lastMessageTime: 1,
        messageCount: 1,
      },
    },
  ]);
}

function getConversation(userName, otherUserName) {
  // Get all messages between two users
  return Message.find({
    $or: [
      { senderName: userName, receiverName: otherUserName },
      { senderName: otherUserName, receiverName: userName },
    ],
  }).sort({ createdAt: 1 });
}

module.exports = { sendMessage, listInbox, listOutbox, listAllChats, getConversation };
