import { pool } from "./db.pool.js";
import {
  addDownloadOptionToMp3s,
  addDownloadOptionToVideos,
  createDownloadsTable,
  createMp3TagsTable,
  createTagsTable,
  createVideoTagsTable,
} from "./queries.initialize.db.js";

const MISSING_PARENT = [
  "ER_NO_SUCH_TABLE",
  "ER_BAD_DB_ERROR",
  "ER_FK_CANNOT_OPEN_PARENT",
  "ER_CANNOT_ADD_FOREIGN",
];

let schemaReady = false;
let schemaPromise = null;

async function ignoreDuplicate(query) {
  try {
    await pool.query(query);
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME" || error.code === "ER_DUP_KEYNAME") return;
    throw error;
  }
}

async function ensureMediaSchemaOnce() {
  await pool.query(createTagsTable);
  await pool.query(createVideoTagsTable);
  await pool.query(createMp3TagsTable);
  await pool.query(createDownloadsTable);
  await ignoreDuplicate(addDownloadOptionToVideos);
  await ignoreDuplicate(addDownloadOptionToMp3s);
  await pool.execute("UPDATE videos SET downloadOption = 'unknown' WHERE downloadOption IS NULL");
  await pool.execute("UPDATE mp3s SET downloadOption = 'mp3' WHERE downloadOption IS NULL");
  schemaReady = true;
}

export function ensureMediaSchema() {
  if (schemaReady) return Promise.resolve();
  if (!schemaPromise) {
    schemaPromise = ensureMediaSchemaOnce()
      .catch((error) => {
        if (MISSING_PARENT.includes(error.code)) return;
        throw error;
      })
      .finally(() => {
        schemaPromise = null;
      });
  }
  return schemaPromise;
}
