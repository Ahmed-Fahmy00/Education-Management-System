const transcriptsService = require("../services/transcripts");

async function upsertTranscript(req, res, next) {
  try {
    const transcript = await transcriptsService.upsertTranscript(
      req.params.studentId,
      req.body,
    );
    res.json(transcript);
  } catch (err) {
    next(err);
  }
}

async function getTranscript(req, res, next) {
  try {
    const transcript = await transcriptsService.getTranscript(
      req.params.studentId,
    );
    if (!transcript) {
      return res.status(404).json({ message: "Transcript not found" });
    }

    const exportAs = req.query.export;
    if (exportAs === "json") {
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="transcript.json"',
      );
      return res.json(transcript);
    }

    res.json(transcript);
  } catch (err) {
    next(err);
  }
}

module.exports = { upsertTranscript, getTranscript };
