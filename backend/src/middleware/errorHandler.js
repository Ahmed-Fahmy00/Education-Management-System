function errorHandler(err, _req, res, _next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err && err.message ? err.message : 'Server Error',
  });
}

module.exports = { errorHandler };
