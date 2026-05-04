function attachUser(req, _res, next) {
  req.user = {
    id: req.header("x-user-id") || null,
    role: req.header("x-user-role") || "guest",
  };
  next();
}

function requireRole(allowedRoles) {
  return function roleGuard(req, res, next) {
    const role = req.user && req.user.role ? req.user.role : "guest";
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { attachUser, requireRole };
