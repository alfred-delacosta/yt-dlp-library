import "./env.js";
import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import { checkAuth } from "../middleware/jwt.middleware.js";
import { rateLimit, resetRateLimits } from "../middleware/rateLimit.js";
import { ACCESS_AUDIENCE, TOKEN_ISSUER, signAccessToken } from "../utils/authTokens.js";

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    set(name, value) {
      this.headers[name] = value;
    },
  };
}

test("checkAuth authorizes from the access token and always answers", async () => {
  const req = {
    get(name) {
      return name === "Authorization" ? `Bearer ${signAccessToken(12)}` : undefined;
    },
    cookies: { refresh: "someone-else" },
  };
  const res = mockResponse();
  let nextCalled = false;
  await Promise.race([
    checkAuth(req, res, () => {
      nextCalled = true;
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("middleware hung")), 500)),
  ]);
  assert.equal(nextCalled, true);
  assert.equal(req.userId, 12);

  const expired = jwt.sign({ token_use: "access" }, process.env.ACCESS_TOKEN_SECRET, {
    algorithm: "HS256",
    subject: "12",
    expiresIn: -10,
    issuer: TOKEN_ISSUER,
    audience: ACCESS_AUDIENCE,
  });
  const expiredReq = { get: () => `Bearer ${expired}`, cookies: {} };
  const expiredRes = mockResponse();
  const started = Date.now();
  await checkAuth(expiredReq, expiredRes, () => {
    throw new Error("next should not run");
  });
  assert.equal(expiredRes.statusCode, 401);
  assert.equal(expiredRes.body.message, "Unauthorized");
  assert.ok(Date.now() - started < 500);

  const missing = mockResponse();
  await checkAuth({ get: () => undefined, cookies: { refresh: "still-here" } }, missing, () => {
    throw new Error("next should not run");
  });
  assert.equal(missing.statusCode, 401);
});

test("rate limit blocks the request after the maximum", () => {
  resetRateLimits();
  const limiter = rateLimit({ name: "unit-login", windowMs: 60_000, max: 2 });
  const req = { ip: "203.0.113.5", socket: {} };

  const first = mockResponse();
  let passed = 0;
  limiter(req, first, () => {
    passed += 1;
  });
  limiter(req, mockResponse(), () => {
    passed += 1;
  });
  const blocked = mockResponse();
  let blockedNext = false;
  limiter(req, blocked, () => {
    blockedNext = true;
  });

  assert.equal(passed, 2);
  assert.equal(blockedNext, false);
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.headers["Retry-After"] > 0, true);
});
