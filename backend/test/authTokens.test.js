import "./env.js";
import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import {
  ACCESS_AUDIENCE,
  AuthTokenError,
  MEDIA_AUDIENCE,
  TOKEN_ISSUER,
  applyMediaCookie,
  applyRefreshCookie,
  clearMediaCookie,
  clearRefreshCookie,
  create256BitLongString,
  create512BitLongString,
  hashOpaqueToken,
  mediaCookieOptions,
  refreshCookieOptions,
  refreshTtlMs,
  signAccessToken,
  signMediaToken,
  verifyAccessToken,
  verifyMediaToken,
} from "../utils/authTokens.js";

function mockResponse() {
  return {
    cookies: [],
    cleared: [],
    cookie(name, value, options) {
      this.cookies.push({ name, value, options });
    },
    clearCookie(name, options) {
      this.cleared.push({ name, options });
    },
  };
}

test("access tokens are pinned to issuer, audience, and token use", () => {
  const token = signAccessToken(4);
  const verified = verifyAccessToken(token);
  assert.deepEqual(verified, { userId: 4 });

  const decoded = jwt.decode(token);
  assert.equal(decoded.sub, "4");
  assert.equal(decoded.token_use, "access");
  assert.equal(decoded.iss, TOKEN_ISSUER);
  assert.equal(decoded.aud, ACCESS_AUDIENCE);
  assert.equal(decoded.userId, undefined);
});

test("access token verification rejects old, unsigned, and swapped tokens", () => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  const legacy = jwt.sign({ userId: 4 }, secret, { expiresIn: 60 });
  assert.throws(() => verifyAccessToken(legacy), /jwt issuer invalid|jwt audience invalid|Access token use/);

  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({
    sub: "4",
    token_use: "access",
    iss: TOKEN_ISSUER,
    aud: ACCESS_AUDIENCE,
  })).toString("base64url");
  assert.throws(() => verifyAccessToken(`${header}.${body}.`), jwt.JsonWebTokenError);

  const media = signMediaToken(4, "family-1");
  assert.throws(() => verifyAccessToken(media));
  assert.deepEqual(verifyMediaToken(media), { userId: 4, familyId: "family-1" });
  assert.throws(() => verifyMediaToken(signAccessToken(4)), jwt.JsonWebTokenError);
  assert.equal(jwt.decode(media).aud, MEDIA_AUDIENCE);
});

test("cookie set and clear use the same name, path, and flags", () => {
  const res = mockResponse();
  applyRefreshCookie(res, "refresh-token");
  clearRefreshCookie(res);
  applyMediaCookie(res, "media-token");
  clearMediaCookie(res);

  const refresh = res.cookies[0];
  const media = res.cookies[1];
  assert.equal(refresh.options.path, "/api/auth");
  assert.equal(media.options.path, "/media");
  assert.equal(refresh.options.httpOnly, true);
  assert.equal(refresh.options.sameSite, "strict");
  assert.equal(refresh.options.maxAge, refreshTtlMs());
  assert.equal(media.options.maxAge, refresh.options.maxAge);
  assert.deepEqual(res.cleared[0], { name: refresh.name, options: refresh.options });
  assert.deepEqual(res.cleared[1], { name: media.name, options: media.options });
  assert.deepEqual(refresh.options, refreshCookieOptions());
  assert.deepEqual(media.options, mediaCookieOptions());
});

test("opaque token hashes are 256-bit digests and secret helpers use the requested width", () => {
  const hash = hashOpaqueToken("sample-token");
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(hash, hashOpaqueToken("other-token"));
  assert.equal(create256BitLongString().length, 64);
  assert.equal(create512BitLongString().length, 128);
  assert.equal(new AuthTokenError("x").name, "AuthTokenError");
});
