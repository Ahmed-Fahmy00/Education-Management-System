const officeHoursService = require("../services/office-hours");

async function publishOfficeHour(req, res, next) {
  try {
    const row = await officeHoursService.publishOfficeHour(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function listOfficeHours(req, res, next) {
  try {
    const query = {};
    if (req.query.staff) query.staff = req.query.staff;
    if (req.query.dayOfWeek) query.dayOfWeek = Number(req.query.dayOfWeek);
    const rows = await officeHoursService.listOfficeHours(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { publishOfficeHour, listOfficeHours };
