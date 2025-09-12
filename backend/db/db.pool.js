import mysql from "mysql2/promise";
import "@dotenvx/dotenvx/config";

// Create a new connection with the updated database
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT === "" ? "3306" : process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
