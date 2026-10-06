const buckets = new Map();

export function resetRateLimits() {
  buckets.clear();
}

export function rateLimit({ name, windowMs, max }) {
  return (req, res, next) => {
    const now = Date.now();
    if (buckets.size > 10000) {
      for (const [key, bucket] of buckets) {
        if (now >= bucket.resetAt) buckets.delete(key);
      }
    }

    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `${name}:${ip}`;
    let bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({ message: "Too many attempts. Try again later." });
    }
    return next();
  };
}
