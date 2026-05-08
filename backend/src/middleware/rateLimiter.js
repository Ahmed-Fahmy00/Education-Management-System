/**
 * Custom Lightweight Rate Limiter
 * For production, use 'express-rate-limit' or Redis-based limiting.
 */
const rateLimit = new Map();

const customRateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    const data = rateLimit.get(ip);

    if (now - data.firstRequest > windowMs) {
      // Reset window
      data.count = 1;
      data.firstRequest = now;
      return next();
    }

    data.count++;
    if (data.count > limit) {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later.",
      });
    }

    next();
  };
};

module.exports = customRateLimiter;
