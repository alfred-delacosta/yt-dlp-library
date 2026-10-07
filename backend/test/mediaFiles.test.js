import "./env.js";
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { removeMediaFiles, resolveMediaFile } from "../utils/mediaFiles.js";
import { rootFolder } from "../utils/fileOperations.js";

test("resolveMediaFile stays inside the media directory", () => {
  const inside = path.join(rootFolder, "media", "videos", "clip.mp4");
  assert.equal(resolveMediaFile(inside), path.resolve(inside));
  assert.equal(resolveMediaFile(path.join("media", "videos", "clip.mp4")), path.resolve(inside));
  assert.equal(resolveMediaFile(path.join(rootFolder, "server.js")), null);
  assert.equal(resolveMediaFile(path.join("..", "server.js")), null);
  assert.equal(resolveMediaFile(""), null);
  assert.equal(resolveMediaFile(null), null);
});

test("removeMediaFiles deletes only files inside media", async () => {
  const directory = path.join(rootFolder, "media", "videos");
  await mkdir(directory, { recursive: true });
  const video = path.join(directory, `delete-unit-${randomUUID()}.mp4`);
  const outsideDirectory = await mkdtemp(path.join(os.tmpdir(), "yt-dlp-outside-"));
  const outside = path.join(outsideDirectory, "secret.txt");
  await writeFile(video, "video");
  await writeFile(outside, "secret");
  try {
    await removeMediaFiles([video, outside, path.join(rootFolder, "media")]);
    await assert.rejects(readFile(video));
    assert.equal(await readFile(outside, "utf8"), "secret");
  } finally {
    await rm(video, { force: true });
    await rm(outsideDirectory, { recursive: true, force: true });
  }
});
