import { pool } from "../db/db.pool.js";
import { getMaintenanceTableEntry } from "../db/queries.initialize.db.js";
import { checkAuth } from "./jwt.middleware.js";

export async function appIsInitialized() {
  try {
    await pool.query(getMaintenanceTableEntry);
    return true;
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE" || error.code === "ER_BAD_DB_ERROR") return false;
    throw error;
  }
}

export async function requireAuthWhenInitialized(req, res, next) {
  try {
    const initialized = await appIsInitialized();
    if (!initialized) return next();
  } catch (error) {
    console.error("Unable to verify application state", error);
    return res.status(500).json({ message: "Unable to verify application state." });
  }
  return checkAuth(req, res, next);
}
