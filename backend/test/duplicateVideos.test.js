import assert from "node:assert/strict";
import test from "node:test";
import { groupDuplicateVideos } from "../utils/duplicateVideos.js";

const YOUTUBE_ID = "dQw4w9WgXcQ";

function video(overrides) {
  return {
    id: 1,
    name: "Clip",
    link: "",
    ext: ".mp4",
    downloadDate: "2020-01-01T00:00:00.000Z",
    videoPath: "",
    serverPath: "",
    thumbnailId: 1,
    thumbnailPath: "",
    description: "hidden description",
    subtitles: "hidden subtitles",
    ...overrides,
  };
}

function publicVideo(row) {
  return {
    id: row.id,
    name: row.name,
    link: row.link,
    ext: row.ext,
    downloadDate: row.downloadDate,
    videoPath: row.videoPath,
    serverPath: row.serverPath,
    thumbnailPath: row.thumbnailPath,
  };
}

test("youtube watch, youtu.be, and shorts links form one group", () => {
  const oldest = video({
    id: 2,
    name: "Watch copy",
    downloadDate: "2019-05-01T00:00:00.000Z",
    link: `https://www.youtube.com/watch?v=${YOUTUBE_ID}&list=PL123&t=10`,
    thumbnailPath: "older.jpg",
    serverPath: "watch.mp4",
  });
  const shorts = video({
    id: 5,
    name: "Shorts copy",
    downloadDate: "2021-01-01T00:00:00.000Z",
    link: `https://www.youtube.com/shorts/${YOUTUBE_ID}?feature=share`,
    thumbnailPath: "shorts.jpg",
    serverPath: "shorts.mp4",
  });
  const shortLink = video({
    id: 9,
    name: "Short link copy",
    downloadDate: "2022-01-01T00:00:00.000Z",
    link: `https://www.youtu.be/${YOUTUBE_ID}`,
    thumbnailPath: "short.jpg",
    serverPath: "short.mp4",
  });
  const other = video({
    id: 3,
    name: "Different video",
    link: "https://www.youtube.com/watch?v=abcdefghijk",
    serverPath: "other.mp4",
    videoPath: "other.mp4",
  });

  const groups = groupDuplicateVideos([oldest, shorts, shortLink, other]);

  assert.equal(groups.link.length, 1);
  assert.equal(groups.link[0].key, `youtube:${YOUTUBE_ID}`);
  assert.equal(groups.link[0].label, `https://www.youtu.be/${YOUTUBE_ID}`);
  assert.deepEqual(groups.link[0].videos.map((item) => item.id), [2, 5, 9]);
  assert.deepEqual(groups.link[0].videos[0], publicVideo(oldest));
  assert.equal(groups.title.length, 0);
  assert.equal(groups.path.length, 0);
});

test("music and nocookie youtube hosts use the same video id", () => {
  const rows = [
    video({ id: 1, link: `https://music.youtube.com/watch?v=${YOUTUBE_ID}` }),
    video({ id: 2, link: `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?si=abc`, downloadDate: "2021-01-01T00:00:00.000Z" }),
  ];

  const groups = groupDuplicateVideos(rows);

  assert.equal(groups.link.length, 1);
  assert.equal(groups.link[0].key, `youtube:${YOUTUBE_ID}`);
  assert.deepEqual(groups.link[0].videos.map((item) => item.id), [1, 2]);
});

test("a youtube channel page is not treated as a video id", () => {
  const rows = [
    video({ id: 1, link: "https://www.youtube.com/channel/UCdQw4w9WgXcQaaaa", name: "Channel A", serverPath: "a.mp4" }),
    video({ id: 2, link: "https://www.youtube.com/@someone", name: "Channel B", serverPath: "b.mp4", downloadDate: "2021-01-01T00:00:00.000Z" }),
  ];

  const groups = groupDuplicateVideos(rows);

  assert.equal(groups.link.length, 0);
});

test("other urls group after tracking params and fragments are removed", () => {
  const rows = [
    video({ id: 4, link: "https://Example.com/Video/?utm_source=newsletter&fbclid=abc#t=3" }),
    video({ id: 8, link: "https://example.com/Video?si=1&feature=share", downloadDate: "2021-06-01T00:00:00.000Z" }),
    video({ id: 6, link: "https://example.com/other", name: "Other", serverPath: "other.mp4", downloadDate: "2021-07-01T00:00:00.000Z" }),
  ];

  const groups = groupDuplicateVideos(rows);

  assert.equal(groups.link.length, 1);
  assert.deepEqual(groups.link[0].videos.map((item) => item.id), [4, 8]);
  assert.equal(groups.link[0].label, "https://example.com/Video?si=1&feature=share");
});

test("non-url links group on the trimmed text", () => {
  const rows = [
    video({ id: 1, link: "  copied-link  " }),
    video({ id: 2, link: "copied-link", downloadDate: "2021-01-01T00:00:00.000Z" }),
    video({ id: 3, link: "different", name: "Different", serverPath: "c.mp4", downloadDate: "2021-02-01T00:00:00.000Z" }),
  ];

  const groups = groupDuplicateVideos(rows);

  assert.equal(groups.link.length, 1);
  assert.equal(groups.link[0].key, "copied-link");
  assert.deepEqual(groups.link[0].videos.map((item) => item.id), [1, 2]);
});

test("blank links are not a duplicate group", () => {
  const rows = [
    video({ id: 1, link: "   ", name: "One", serverPath: "one.mp4" }),
    video({ id: 2, link: "", name: "Two", serverPath: "two.mp4", downloadDate: "2021-01-01T00:00:00.000Z" }),
  ];

  assert.equal(groupDuplicateVideos(rows).link.length, 0);
});

test("titles group by case and inner whitespace, and the label keeps the oldest original name", () => {
  const oldest = video({ id: 7, name: "  My   Video  ", link: "https://example.com/a", serverPath: "a.mp4", downloadDate: "2018-01-01T00:00:00.000Z" });
  const newer = video({ id: 4, name: "my video", link: "https://example.com/b", serverPath: "b.mp4", downloadDate: "2020-01-01T00:00:00.000Z" });
  const alone = video({ id: 1, name: "Solo", link: "https://example.com/c", serverPath: "c.mp4" });

  const groups = groupDuplicateVideos([newer, oldest, alone]);

  assert.equal(groups.title.length, 1);
  assert.equal(groups.title[0].key, "my video");
  assert.equal(groups.title[0].label, "  My   Video  ");
  assert.deepEqual(groups.title[0].videos.map((item) => item.id), [7, 4]);
  assert.equal(groups.title[0].videos[0].name, "  My   Video  ");
});

test("blank titles are not a duplicate group", () => {
  const rows = [
    video({ id: 1, name: "   ", link: "https://example.com/a", serverPath: "a.mp4" }),
    video({ id: 2, name: "", link: "https://example.com/b", serverPath: "b.mp4", downloadDate: "2021-01-01T00:00:00.000Z" }),
  ];

  assert.equal(groupDuplicateVideos(rows).title.length, 0);
});

test("serverPath wins, and slash direction plus case still group", () => {
  const windows = video({
    id: 3,
    name: "Windows copy",
    link: "https://example.com/win",
    serverPath: "C:\\Media\\Videos\\Clip.mp4",
    videoPath: "ignored-by-server-path.mp4",
    downloadDate: "2019-01-01T00:00:00.000Z",
  });
  const posix = video({
    id: 11,
    name: "Posix copy",
    link: "https://example.com/posix",
    serverPath: "",
    videoPath: "c:/media/videos/clip.mp4",
    downloadDate: "2020-01-01T00:00:00.000Z",
  });
  const differentFile = video({
    id: 12,
    name: "Different file",
    link: "https://example.com/different",
    serverPath: "c:/media/videos/other.mp4",
    videoPath: "c:/media/videos/clip.mp4",
    downloadDate: "2021-01-01T00:00:00.000Z",
  });

  const groups = groupDuplicateVideos([posix, windows, differentFile]);

  assert.equal(groups.path.length, 1);
  assert.equal(groups.path[0].key, "c:/media/videos/clip.mp4");
  assert.equal(groups.path[0].label, "c:/media/videos/clip.mp4");
  assert.deepEqual(groups.path[0].videos.map((item) => item.id), [3, 11]);
});

test("blank paths are not a duplicate group", () => {
  const rows = [
    video({ id: 1, name: "One", link: "https://example.com/a", serverPath: "  ", videoPath: "" }),
    video({ id: 2, name: "Two", link: "https://example.com/b", serverPath: "", videoPath: "   ", downloadDate: "2021-01-01T00:00:00.000Z" }),
  ];

  assert.equal(groupDuplicateVideos(rows).path.length, 0);
});

test("repeated thumbnail rows collapse to the lowest thumbnail id", () => {
  const laterThumb = video({
    id: 1,
    link: `https://youtu.be/${YOUTUBE_ID}`,
    thumbnailId: 20,
    thumbnailPath: "later.jpg",
  });
  const earlierThumb = video({
    id: 1,
    link: `https://youtu.be/${YOUTUBE_ID}`,
    thumbnailId: 4,
    thumbnailPath: "earlier.jpg",
  });
  const partner = video({
    id: 2,
    link: `https://www.youtube.com/watch?v=${YOUTUBE_ID}`,
    downloadDate: "2021-01-01T00:00:00.000Z",
    thumbnailId: 1,
    thumbnailPath: "partner.jpg",
  });

  const groups = groupDuplicateVideos([laterThumb, partner, earlierThumb]);

  assert.equal(groups.link[0].videos.length, 2);
  assert.equal(groups.link[0].videos[0].thumbnailPath, "earlier.jpg");
  assert.equal(Object.hasOwn(groups.link[0].videos[0], "description"), false);
  assert.equal(Object.hasOwn(groups.link[0].videos[0], "subtitles"), false);
  assert.equal(Object.hasOwn(groups.link[0].videos[0], "thumbnailId"), false);
});

test("one video can appear in a link group and a title group", () => {
  const rows = [
    video({ id: 1, name: "Shared Title", link: `https://youtu.be/${YOUTUBE_ID}`, serverPath: "one.mp4" }),
    video({ id: 2, name: "Shared Title", link: "https://example.com/unrelated", serverPath: "two.mp4", downloadDate: "2021-01-01T00:00:00.000Z" }),
    video({ id: 3, name: "Different", link: `https://www.youtube.com/shorts/${YOUTUBE_ID}`, serverPath: "three.mp4", downloadDate: "2022-01-01T00:00:00.000Z" }),
  ];

  const groups = groupDuplicateVideos(rows);

  assert.deepEqual(groups.link[0].videos.map((item) => item.id), [1, 3]);
  assert.deepEqual(groups.title[0].videos.map((item) => item.id), [1, 2]);
  assert.equal(groups.path.length, 0);
});

test("a unique video appears in no group", () => {
  const groups = groupDuplicateVideos([
    video({ id: 1, name: "Only", link: "https://example.com/only", serverPath: "only.mp4" }),
  ]);

  assert.deepEqual(groups, { link: [], title: [], path: [] });
});

test("larger groups come first, then labels", () => {
  const rows = [
    video({ id: 1, name: "alpha", link: "https://example.com/1", serverPath: "1.mp4" }),
    video({ id: 2, name: "alpha", link: "https://example.com/2", serverPath: "2.mp4", downloadDate: "2021-01-01T00:00:00.000Z" }),
    video({ id: 3, name: "bravo", link: "https://example.com/3", serverPath: "3.mp4", downloadDate: "2021-02-01T00:00:00.000Z" }),
    video({ id: 4, name: "bravo", link: "https://example.com/4", serverPath: "4.mp4", downloadDate: "2021-03-01T00:00:00.000Z" }),
    video({ id: 5, name: "bravo", link: "https://example.com/5", serverPath: "5.mp4", downloadDate: "2021-04-01T00:00:00.000Z" }),
  ];

  const groups = groupDuplicateVideos(rows);

  assert.deepEqual(groups.title.map((group) => group.label), ["bravo", "alpha"]);
});
