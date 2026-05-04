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

module.exports = { sendMessage, listInbox, listOutbox };
