import "./env.js";
import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const container = "yt-dlp-duplicates-test";
const dbPort = "3309";
let server;
let pool;
let base;
let rootFolder;
const createdFiles = [];

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
    "-p", `127.0.0.1:${dbPort}:3306`,
    "mysql:8",
  ]);
  process.env.DB_HOST = "127.0.0.1";
  process.env.DB_PORT = dbPort;
  process.env.DB_USER = "auth_test";
  process.env.DB_PASS = "auth_test";
  process.env.DB_NAME = "auth_test";
  process.env.ENVIRONMENT = "test";
}

async function request(urlPath, { method = "GET", token, body } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (body !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(`${base}${urlPath}`, {
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
  return { status: response.status, data };
}

async function writeMedia(relativePath, contents) {
  const absolute = path.join(rootFolder, relativePath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, contents);
  createdFiles.push(absolute);
  return absolute;
}

test("duplicate removal deletes owned rows only and leaves files in place", { timeout: 180000 }, async () => {
  try {
    await startDatabase();
    const [{ app }, db, schema, tokens, files] = await Promise.all([
      import("../server.js"),
      import("../db/db.pool.js"),
      import("../db/queries.initialize.db.js"),
      import("../utils/authTokens.js"),
      import("../utils/fileOperations.js"),
    ]);
    pool = db.pool;
    rootFolder = files.rootFolder;
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

    await pool.query(schema.createUsersTable);
    await pool.query(schema.createVideosTable);
    await pool.query(`
      CREATE TABLE thumbnails (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        videoId INT,
        name VARCHAR(500) NOT NULL,
        thumbnailPath TEXT,
        serverPath TEXT,
        CONSTRAINT fk_videoId FOREIGN KEY (videoId) REFERENCES videos (id)
      )
    `);

    const [owner] = await pool.execute("INSERT INTO users (email, password) VALUES (?, ?)", ["owner@example.com", "hash"]);
    const [other] = await pool.execute("INSERT INTO users (email, password) VALUES (?, ?)", ["other@example.com", "hash"]);
    const stamp = randomUUID();
    const keepRelative = path.join("media", "videos", `${stamp}-keep.mp4`);
    const dropRelative = path.join("media", "videos", `${stamp}-drop.mp4`);
    const keepThumbRelative = path.join("media", "videos", "thumbnails", `${stamp}-keep.jpg`);
    const dropThumbRelative = path.join("media", "videos", "thumbnails", `${stamp}-drop.jpg`);
    const keepSubtitleRelative = path.join("media", "subtitles", `${stamp}-keep.vtt`);
    const dropSubtitleRelative = path.join("media", "subtitles", `${stamp}-drop.vtt`);
    const keepFile = await writeMedia(keepRelative, "keep-video");
    const dropFile = await writeMedia(dropRelative, "drop-video");
    const keepThumb = await writeMedia(keepThumbRelative, "keep-thumb");
    const dropThumb = await writeMedia(dropThumbRelative, "drop-thumb");
    const keepSubtitle = await writeMedia(keepSubtitleRelative, "keep-subs");
    const dropSubtitle = await writeMedia(dropSubtitleRelative, "drop-subs");

    const [keep] = await pool.execute(
      "INSERT INTO videos (name, description, ext, downloadDate, link, type, videoPath, serverPath, subtitles, subtitlesFile, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ["Keep me", "desc", ".mp4", "2020-01-01 00:00:00", "https://youtu.be/dQw4w9WgXcQ", 0, keepRelative, keepFile, "secret subtitles", keepSubtitle, owner.insertId]
    );
    const [drop] = await pool.execute(
      "INSERT INTO videos (name, description, ext, downloadDate, link, type, videoPath, serverPath, subtitles, subtitlesFile, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ["Remove me", "desc", ".mp4", "2021-01-01 00:00:00", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL", 0, dropRelative, dropFile, "more secret subtitles", dropSubtitle, owner.insertId]
    );
    const [otherVideo] = await pool.execute(
      "INSERT INTO videos (name, description, ext, downloadDate, link, type, videoPath, serverPath, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ["Other", "desc", ".mp4", "2022-01-01 00:00:00", "https://www.youtube.com/shorts/dQw4w9WgXcQ", 0, dropRelative, dropFile, other.insertId]
    );
    await pool.execute(
      "INSERT INTO thumbnails (name, videoId, thumbnailPath, serverPath) VALUES (?, ?, ?, ?)",
      [`${stamp}-keep.jpg`, keep.insertId, keepThumbRelative, keepThumb]
    );
    await pool.execute(
      "INSERT INTO thumbnails (name, videoId, thumbnailPath, serverPath) VALUES (?, ?, ?, ?)",
      [`${stamp}-drop.jpg`, drop.insertId, dropThumbRelative, dropThumb]
    );

    server = app.listen(0);
    await once(server, "listening");
    base = `http://127.0.0.1:${server.address().port}`;
    const token = tokens.signAccessToken(owner.insertId);

    const anonymousScan = await request("/api/videos/duplicates");
    assert.equal(anonymousScan.status, 401);

    const scan = await request("/api/videos/duplicates", { token });
    assert.equal(scan.status, 200);
    assert.equal(scan.data.link.length, 1);
    assert.deepEqual(scan.data.link[0].videos.map((item) => item.id), [keep.insertId, drop.insertId]);
    assert.equal(scan.data.link[0].videos.some((item) => Object.hasOwn(item, "subtitles")), false);
    assert.equal(scan.data.link[0].videos[0].thumbnailPath, keepThumbRelative);
    assert.equal(scan.data.link[0].videos.some((item) => item.id === otherVideo.insertId), false);

    const removed = await request("/api/videos/duplicates/remove", {
      method: "POST",
      token,
      body: { ids: [drop.insertId] },
    });
    assert.equal(removed.status, 200);
    assert.deepEqual(removed.data.deletedIds, [drop.insertId]);
    assert.equal(await count(pool, "videos", drop.insertId), 0);
    assert.equal(await count(pool, "thumbnails", drop.insertId, "videoId"), 0);
    assert.equal(await count(pool, "videos", keep.insertId), 1);
    assert.equal(await count(pool, "thumbnails", keep.insertId, "videoId"), 1);
    assert.equal(await count(pool, "videos", otherVideo.insertId), 1);
    assert.equal(await readFile(dropFile, "utf8"), "drop-video");
    assert.equal(await readFile(dropThumb, "utf8"), "drop-thumb");
    assert.equal(await readFile(dropSubtitle, "utf8"), "drop-subs");
    assert.equal(await readFile(keepFile, "utf8"), "keep-video");

    const mixedOwner = await request("/api/videos/duplicates/remove", {
      method: "POST",
      token,
      body: { ids: [keep.insertId, otherVideo.insertId] },
    });
    assert.equal(mixedOwner.status, 400);
    assert.equal(await count(pool, "videos", keep.insertId), 1);
    assert.equal(await count(pool, "videos", otherVideo.insertId), 1);
    assert.equal(await readFile(keepFile, "utf8"), "keep-video");
    await access(keepThumb);
    await access(keepSubtitle);

    const mixedMissing = await request("/api/videos/duplicates/remove", {
      method: "POST",
      token,
      body: { ids: [keep.insertId, 999999] },
    });
    assert.equal(mixedMissing.status, 400);
    assert.equal(await count(pool, "videos", keep.insertId), 1);
    assert.equal(await count(pool, "thumbnails", keep.insertId, "videoId"), 1);

    const anonymous = await request("/api/videos/duplicates/remove", {
      method: "POST",
      body: { ids: [keep.insertId] },
    });
    assert.equal(anonymous.status, 401);
    assert.equal(await count(pool, "videos", keep.insertId), 1);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (pool) await pool.end();
    await Promise.all(createdFiles.map((file) => rm(file, { force: true })));
    await run("docker", ["rm", "-f", container]).catch(() => {});
  }
});

function count(db, table, id, column = "id") {
  return db.execute(`SELECT COUNT(*) AS total FROM ${table} WHERE ${column} = ?`, [id]).then(([rows]) => Number(rows[0].total));
}
