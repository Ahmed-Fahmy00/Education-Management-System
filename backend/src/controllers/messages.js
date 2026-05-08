const messagesService = require("../services/messages");

async function sendMessage(req, res, next) {
  try {
    const row = await messagesService.sendMessage(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function listInbox(req, res, next) {
  try {
    const { user } = req.query;
    if (!user) {
      return res
        .status(400)
        .json({ message: "user query parameter is required" });
    }
    const rows = await messagesService.listInbox(user);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function listOutbox(req, res, next) {
  try {
    const { user } = req.query;
    if (!user) {
      return res
        .status(400)
        .json({ message: "user query parameter is required" });
    }
    const rows = await messagesService.listOutbox(user);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function listAllChats(req, res, next) {
  try {
    const { user } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    if (!user) {
      return res
        .status(400)
        .json({ message: "user query parameter is required" });
    }

    const rows = await messagesService.listAllChats(user, limit, skip);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getConversation(req, res, next) {
  try {
    const { user, otherUser } = req.query;

    if (!user || !otherUser) {
      return res.status(400).json({
        message: "user and otherUser query parameters are required",
      });
    }

    const rows = await messagesService.getConversation(user, otherUser);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMessage, listInbox, listOutbox, listAllChats, getConversation };
