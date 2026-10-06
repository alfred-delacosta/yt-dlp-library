import "./env.js";
import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { hashOpaqueToken } from "../utils/authTokens.js";
import { resetRateLimits } from "../middleware/rateLimit.js";
import { createUsersTable } from "../db/queries.initialize.db.js";

const email = `auth-test-${randomUUID()}@example.com`;
const password = "correct-horse-1";
const container = "yt-dlp-auth-test";
let server;
let base;
let pool;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`${command} ${args.join(" ")} failed (${code}): ${output}`));
    });
  });
}

async function startDatabase() {
  await run("docker", ["rm", "-f", container]).catch(() => {});
  await run("docker", [
    "run", "-d", "--name", container,
    "-e", "MYSQL_ROOT_PASSWORD=auth_test",
    "-e", "MYSQL_DATABASE=auth_test",
    "-e", "MYSQL_USER=auth_test",
    "-e", "MYSQL_PASSWORD=auth_test",
    "-p", "127.0.0.1:3307:3306",
    "mysql:8",
  ]);
  process.env.DB_HOST = "127.0.0.1";
  process.env.DB_PORT = "3307";
  process.env.DB_USER = "auth_test";
  process.env.DB_PASS = "auth_test";
  process.env.DB_NAME = "auth_test";
  process.env.ENVIRONMENT = "test";
}

function parseSetCookie(line) {
  const [pair, ...attrs] = line.split(";").map((part) => part.trim());
  const eq = pair.indexOf("=");
  const attributes = {};
  for (const attr of attrs) {
    const [rawKey, ...rest] = attr.split("=");
    attributes[rawKey.toLowerCase()] = rest.length ? rest.join("=") : true;
  }
  return { name: pair.slice(0, eq), value: pair.slice(eq + 1), attributes, line };
}

function updateJar(response, jar = {}) {
  const next = { ...jar };
  const lines = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  for (const line of lines) {
    const parsed = parseSetCookie(line);
    const expires = typeof parsed.attributes.expires === "string" ? Date.parse(parsed.attributes.expires) : NaN;
    const expired = parsed.value === "" || parsed.attributes["max-age"] === "0" || (Number.isFinite(expires) && expires <= Date.now());
    if (expired) delete next[parsed.name];
    else next[parsed.name] = parsed.value;
  }
  return { jar: next, lines };
}

function cookieHeader(jar) {
  return Object.entries(jar).map(([name, value]) => `${name}=${value}`).join("; ");
}

async function request(path, { method = "GET", body, token, jar } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  if (jar && Object.keys(jar).length > 0) headers.cookie = cookieHeader(jar);
  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  const cookies = updateJar(response, jar);
  return { status: response.status, data, ...cookies };
}

test("auth session, media, and reset flow", { timeout: 180000 }, async () => {
  try {
    await startDatabase();
    const [{ app }, db, schema] = await Promise.all([
      import("../server.js"),
      import("../db/db.pool.js"),
      import("../db/refreshTokenStore.js"),
    ]);
    pool = db.pool;
    const deadline = Date.now() + 90000;
    let lastError;
    while (Date.now() < deadline) {
      try {
        await pool.query("SELECT 1");
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    if (lastError) throw lastError;

    await pool.query(createUsersTable);
    await schema.ensureAuthSchema();
    resetRateLimits();
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    base = `http://127.0.0.1:${server.address().port}`;
    const unknown = await request("/api/auth/login", {
      method: "POST",
      body: { email: `missing-${randomUUID()}@example.com`, password },
    });
    const signup = await request("/api/auth/signup", { method: "POST", body: { email, password } });
    assert.equal(signup.status, 201);
    assert.equal(typeof signup.data.accessToken, "string");
    assert.equal(signup.data.user.email, email);
    assert.equal(signup.data.user.password, undefined);

    const duplicate = await request("/api/auth/signup", { method: "POST", body: { email, password: "another-password" } });
    assert.equal(duplicate.status, 400);
    assert.equal(duplicate.data.message, "Unable to create an account.");
    assert.equal(JSON.stringify(duplicate.data).includes(email), false);

    const badPassword = await request("/api/auth/login", { method: "POST", body: { email, password: "wrong-password" } });
    assert.equal(badPassword.status, 400);
    assert.equal(badPassword.data.message, unknown.data.message);

    const refreshCookie = signup.lines.find((line) => /path=\/api\/auth/i.test(line));
    const mediaCookie = signup.lines.find((line) => /path=\/media/i.test(line));
    assert.ok(refreshCookie);
    assert.ok(mediaCookie);
    assert.match(refreshCookie, /httponly/i);
    assert.match(refreshCookie, /samesite=strict/i);
    assert.match(mediaCookie, /httponly/i);
    assert.match(mediaCookie, /samesite=strict/i);

    const authed = await request("/api/auth/checkAuth", { token: signup.data.accessToken });
    assert.equal(authed.status, 200);
    assert.equal(authed.data.isAuthorized, true);

    const cookieOnly = await request("/api/auth/checkAuth", { jar: signup.jar });
    assert.equal(cookieOnly.status, 401);

    const staleBearer = await request("/api/auth/checkAuth", { token: "not-a-token" });
    assert.equal(staleBearer.status, 401);

    const oldGet = await request("/api/auth/getNewAccessToken", { jar: signup.jar });
    assert.equal(oldGet.data?.accessToken, undefined);
    if (oldGet.status === 200) assert.equal(typeof oldGet.data, "string");

    const mediaAllowed = await request(`/media/missing-${randomUUID()}`, { jar: signup.jar });
    assert.notEqual(mediaAllowed.status, 401);
    const mediaDenied = await request(`/media/missing-${randomUUID()}`);
    assert.equal(mediaDenied.status, 401);

    const legacy = await request("/api/initialize/updateLegacyTables");
    assert.equal(legacy.status, 401);
    const initStatus = await request("/api/initialize/checkInitialization");
    assert.notEqual(initStatus.status, 401);

    const refreshed = await request("/api/auth/refresh", { method: "POST", jar: signup.jar });
    assert.equal(refreshed.status, 200);
    assert.notEqual(refreshed.data.accessToken, signup.data.accessToken);
    assert.notEqual(refreshed.jar.refresh, signup.jar.refresh);
    assert.equal(refreshed.data.user.email, email);

    const reused = await request("/api/auth/refresh", { method: "POST", jar: signup.jar });
    assert.equal(reused.status, 401);
    assert.equal(reused.data.code, "refresh_reused");
    const killed = await request("/api/auth/refresh", { method: "POST", jar: refreshed.jar });
    assert.equal(killed.status, 401);

    const login = await request("/api/auth/login", {
      method: "POST",
      body: { email, password },
      headers: { "user-agent": "Device One" },
    });
    assert.equal(login.status, 200);
    const second = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "Device Two" },
      body: JSON.stringify({ email, password }),
    });
    const secondText = await second.text();
    const secondData = JSON.parse(secondText);
    const secondCookies = updateJar(second, {});
    assert.equal(second.status, 200);

    const sessions = await request("/api/auth/sessions", { token: login.data.accessToken, jar: login.jar });
    assert.equal(sessions.status, 200);
    assert.equal(sessions.data.sessions.length, 2);
    assert.equal(sessions.data.sessions.filter((item) => item.current).length, 1);

    const logoutOthers = await request("/api/auth/logout-others", {
      method: "POST",
      token: login.data.accessToken,
      jar: login.jar,
    });
    assert.equal(logoutOthers.status, 200);
    const secondRefresh = await request("/api/auth/refresh", { method: "POST", jar: secondCookies.jar });
    assert.equal(secondRefresh.status, 401);
    const firstRefresh = await request("/api/auth/refresh", { method: "POST", jar: login.jar });
    assert.equal(firstRefresh.status, 200);

    const loggedOut = await request("/api/auth/logout", { method: "POST", jar: firstRefresh.jar });
    assert.equal(loggedOut.status, 200);
    const clearLine = loggedOut.lines.find((line) => /path=\/api\/auth/i.test(line));
    assert.match(clearLine, /httponly/i);
    assert.match(clearLine, /samesite=strict/i);
    const afterLogout = await request("/api/auth/refresh", { method: "POST", jar: firstRefresh.jar });
    assert.equal(afterLogout.status, 401);

    const relogin = await request("/api/auth/login", { method: "POST", body: { email, password } });
    const forgotKnown = await request("/api/auth/forgot-password", { method: "POST", body: { email } });
    const forgotUnknown = await request("/api/auth/forgot-password", {
      method: "POST",
      body: { email: `missing-${randomUUID()}@example.com` },
    });
    assert.equal(forgotKnown.status, 200);
    assert.deepEqual(forgotKnown.data, forgotUnknown.data);

    const [rows] = await pool.execute("SELECT id, resetPasswordToken FROM users WHERE email = ?", [email]);
    assert.match(rows[0].resetPasswordToken, /^[a-f0-9]{64}$/);
    const rawReset = `reset-${randomUUID()}`;
    await pool.execute(
      "UPDATE users SET resetPasswordToken = ?, resetPasswordTokenExpiresAt = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?",
      [hashOpaqueToken(rawReset), rows[0].id]
    );

    const reset = await request(`/api/auth/reset-password/${rawReset}`, {
      method: "POST",
      body: { newPassword: "replacement-password-1" },
      jar: relogin.jar,
    });
    assert.equal(reset.status, 200);
    const oldSession = await request("/api/auth/refresh", { method: "POST", jar: relogin.jar });
    assert.equal(oldSession.status, 401);
    const oldLogin = await request("/api/auth/login", { method: "POST", body: { email, password } });
    assert.equal(oldLogin.status, 400);
    const newLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email, password: "replacement-password-1" },
    });
    assert.equal(newLogin.status, 200);
    assert.equal(newLogin.data.user.password, undefined);
    assert.equal(secondData.user.password, undefined);
  } finally {
    try {
      await pool.execute("DELETE FROM users WHERE email = ?", [email]);
    } catch (error) {
      console.error("Failed to delete auth test user", error);
    }
    if (server) await new Promise((resolve) => server.close(resolve));
    if (pool) await pool.end();
    await run("docker", ["rm", "-f", container]).catch(() => {});
  }
});
