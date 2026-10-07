const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
]);

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const DROPPED_PARAMS = new Set(["fbclid", "gclid", "si", "feature"]);
const PUBLIC_FIELDS = ["id", "name", "link", "ext", "downloadDate", "videoPath", "serverPath", "thumbnailPath"];

export function groupDuplicateVideos(rows) {
  const videos = dedupeByThumbnail(rows);
  return {
    link: groupBy(videos, linkKey, shortestLink),
    title: groupBy(videos, titleKey, (members) => members[0].name),
    path: groupBy(videos, pathKey, (members) => pathKey(members[0])),
  };
}

function dedupeByThumbnail(rows) {
  const byId = new Map();
  for (const row of rows) {
    const existing = byId.get(row.id);
    if (!existing || thumbnailRank(row) < thumbnailRank(existing)) {
      byId.set(row.id, row);
    }
  }
  return [...byId.values()];
}

function thumbnailRank(row) {
  const id = Number(row.thumbnailId);
  return Number.isInteger(id) ? id : Number.MAX_SAFE_INTEGER;
}

function groupBy(videos, keyFor, labelFor) {
  const buckets = new Map();
  for (const video of videos) {
    const key = keyFor(video);
    if (!key) continue;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(video);
    else buckets.set(key, [video]);
  }

  const groups = [];
  for (const [key, members] of buckets) {
    if (members.length < 2) continue;
    members.sort(compareVideos);
    groups.push({
      key,
      label: labelFor(members),
      videos: members.map(toPublic),
    });
  }

  groups.sort((a, b) => b.videos.length - a.videos.length || a.label.localeCompare(b.label));
  return groups;
}

function compareVideos(a, b) {
  const difference = timeValue(a.downloadDate) - timeValue(b.downloadDate);
  if (difference !== 0) return difference;
  return Number(a.id) - Number(b.id);
}

function timeValue(value) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function toPublic(row) {
  const video = {};
  for (const field of PUBLIC_FIELDS) video[field] = row[field];
  return video;
}

function linkKey(row) {
  const trimmed = text(row.link);
  if (!trimmed) return null;
  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed;
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  if (YOUTUBE_HOSTS.has(host)) {
    const id = youtubeId(url, host);
    if (id) return `youtube:${id}`;
  }
  return canonicalUrl(url);
}

function shortestLink(members) {
  return members.reduce((best, video) => (video.link.length < best.length ? video.link : best), members[0].link);
}

function youtubeId(url, host) {
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return YOUTUBE_ID.test(id || "") ? id : null;
  }

  const fromQuery = url.searchParams.get("v");
  if (YOUTUBE_ID.test(fromQuery || "")) return fromQuery;

  const [section, id] = url.pathname.split("/").filter(Boolean);
  if (["shorts", "embed", "live", "v"].includes(section) && YOUTUBE_ID.test(id || "")) return id;
  return null;
}

function canonicalUrl(url) {
  url.hash = "";
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
  const kept = [];
  for (const [key, value] of url.searchParams.entries()) {
    const lower = key.toLowerCase();
    if (lower.startsWith("utm_") || DROPPED_PARAMS.has(lower)) continue;
    kept.push([key, value]);
  }
  url.search = "";
  for (const [key, value] of kept) url.searchParams.append(key, value);
  return url.toString();
}

function titleKey(row) {
  const collapsed = text(row.name).replace(/\s+/g, " ");
  return collapsed ? collapsed.toLowerCase() : null;
}

function pathKey(row) {
  const chosen = text(row.serverPath) || text(row.videoPath);
  if (!chosen) return null;
  return chosen.replaceAll("\\", "/").toLowerCase();
}

function text(value) {
  if (value == null) return "";
  return String(value).trim();
}
