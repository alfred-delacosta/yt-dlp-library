import "./env.js";
import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const container = "yt-dlp-delete-test";
const dbPort = "3308";
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

async function request(urlPath, { method = "GET", token } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(`${base}${urlPath}`, { method, headers });
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

test("delete removes an owned video even when the thumbnail foreign key restricts deletes", { timeout: 180000 }, async () => {
  const decoy = path.join(os.tmpdir(), `yt-dlp-decoy-${randomUUID()}.txt`);
  createdFiles.push(decoy);
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
    await pool.query(schema.createMP3sTable);
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
    const videoRelative = path.join("media", "videos", `${stamp}.mp4`);
    const thumbRelative = path.join("media", "videos", "thumbnails", `${stamp}.jpg`);
    const mp3Relative = path.join("media", "mp3s", `${stamp}.mp3`);
    const videoFile = await writeMedia(videoRelative, "video");
    const thumbFile = await writeMedia(thumbRelative, "thumb");
    const mp3File = await writeMedia(mp3Relative, "audio");
    await writeFile(decoy, "keep");

    const [video] = await pool.execute(
      "INSERT INTO videos (name, description, ext, downloadDate, link, type, videoPath, serverPath, subtitlesFile, userId) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)",
      ["Clip", "desc", ".mp4", "https://example.com/watch", 0, videoRelative, videoFile, decoy, owner.insertId]
    );
    await pool.execute(
      "INSERT INTO thumbnails (name, videoId, thumbnailPath, serverPath) VALUES (?, ?, ?, ?)",
      [`${stamp}.jpg`, video.insertId, thumbRelative, thumbFile]
    );
    const [otherVideo] = await pool.execute(
      "INSERT INTO videos (name, description, ext, downloadDate, link, type, videoPath, serverPath, userId) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)",
      ["Other", "desc", ".mp4", "https://example.com/other", 0, videoRelative, videoFile, other.insertId]
    );
    const [mp3] = await pool.execute(
      "INSERT INTO mp3s (name, description, downloadDate, link, mp3Path, userId, serverPath) VALUES (?, ?, NOW(), ?, ?, ?, ?)",
      ["Song", "desc", "https://example.com/audio", mp3Relative, owner.insertId, mp3File]
    );

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await assert.rejects(
        connection.execute("DELETE FROM videos WHERE id = ?", [video.insertId]),
        (error) => error.errno === 1451
      );
    } finally {
      try {
        await connection.rollback();
      } catch {
        /* The failed statement already ended the transaction. */
      }
      connection.release();
    }

    server = app.listen(0);
    await once(server, "listening");
    base = `http://127.0.0.1:${server.address().port}`;
    const token = tokens.signAccessToken(owner.insertId);
    const otherToken = tokens.signAccessToken(other.insertId);

    const removed = await request(`/api/videos/${video.insertId}`, { method: "DELETE", token });
    assert.equal(removed.status, 200);
    assert.equal(removed.data.message, "Video deleted.");
    assert.equal(await count(pool, "videos", video.insertId), 0);
    assert.equal(await count(pool, "thumbnails", video.insertId, "videoId"), 0);
    await assert.rejects(access(videoFile));
    await assert.rejects(access(thumbFile));
    assert.equal(await readFile(decoy, "utf8"), "keep");

    const missing = await request(`/api/videos/${video.insertId}`, { method: "DELETE", token });
    assert.equal(missing.status, 404);
    assert.equal(missing.data.message, "Video not found.");

    const invalid = await request("/api/videos/undefined", { method: "DELETE", token });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.data.message, "Video id is invalid.");

    const forbidden = await request(`/api/videos/${otherVideo.insertId}`, { method: "DELETE", token });
    assert.equal(forbidden.status, 404);
    assert.equal(await count(pool, "videos", otherVideo.insertId), 1);

    const anonymous = await request(`/api/videos/${otherVideo.insertId}`, { method: "DELETE" });
    assert.equal(anonymous.status, 401);

    const removedAudio = await request(`/api/mp3s/${mp3.insertId}`, { method: "DELETE", token: otherToken });
    assert.equal(removedAudio.status, 404);
    const removedOwnAudio = await request(`/api/mp3s/${mp3.insertId}`, { method: "DELETE", token });
    assert.equal(removedOwnAudio.status, 200);
    assert.equal(removedOwnAudio.data.message, "MP3 deleted.");
    assert.equal(await count(pool, "mp3s", mp3.insertId), 0);
    await assert.rejects(access(mp3File));
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (pool) await pool.end();
    await Promise.all(createdFiles.map((file) => rm(file, { force: true })));
    await rm(decoy, { force: true }).catch(() => {});
    await run("docker", ["rm", "-f", container]).catch(() => {});
  }
});

function count(db, table, id, column = "id") {
  return db.execute(`SELECT COUNT(*) AS total FROM ${table} WHERE ${column} = ?`, [id]).then(([rows]) => Number(rows[0].total));
}
