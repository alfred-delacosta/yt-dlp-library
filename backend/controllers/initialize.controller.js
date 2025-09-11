import mysql from "mysql2/promise";
import "@dotenvx/dotenvx/config";
import { createVideosTable, createThumbnailsTable, createMP3sTable } from "../db/queries.initialize.db.js";

// TODO Come back and refactor this at some point...
export const initialize = async (req, res) => {
  let pool = {};

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT === "" ? "3306" : process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    const sqlCreateDb = `CREATE DATABASE \`${process.env.DB_NAME}\``;

    const [dbResults, dbFields] = await connection.query(sqlCreateDb);

    // Create a new connection with the updated database
    pool = mysql.createPool({
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

    const [videoResults, videoFields] = await pool.query(
      "SELECT * FROM `videos`"
    );
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      try {
        // Create videos table
        const [results, fields] = await pool.query(createVideosTable);
        console.log("Videos table created.");
      } catch (error) {
        console.error(error);
        res.status(400).json({
          message:
            "There was an error creating the videos table. Please check your database connection, mysql instance, or hard drive space."
        });
      }

      try {
        // Create the thumbnails
        const [results, fields] = await pool.query(createThumbnailsTable);
        console.log("Thumbnails table created.");
      } catch (error) {
        console.error(error);
        res.status(400).json({
          message:
            "There was an error creating the thumbnails table. Please check your database connection, mysql instance, or hard drive space."
        });
      }

      try {
        const [results, fields] = await pool.query(createMP3sTable);
        console.log("MP3's table created.");
      } catch (error) {
        console.error(error);
        res.status(400).json({
          message:
            "There was an error creating the mp3s table. Please check your database connection, mysql instance, or hard drive space."
        });
      }

      res.status(200).json({ message: "Database successfully initialized."});
    }

    if (error.code === "ER_DB_CREATE_EXISTS") {
      try {
        // Create a new connection with the updated database
        pool = mysql.createPool({
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

        const [videoResults, videoFields] = await pool.query("SELECT * FROM `videos`");
        const [thumbnailResults, thumbnailFields] = await pool.query("SELECT * FROM `thumbnails`");
        const [mp3Results, mp3Fields] = await pool.query("SELECT * FROM `thumbnails`");

        res.status(200).json({ message: "Database already initialized!", videoResults, thumbnailResults, mp3Results });

      } catch (error) {
        if (error && error.code === "ER_NO_SUCH_TABLE") {
          try {
            // Create videos table
            const [results, fields] = await pool.query(createVideosTable);
            console.log("Videos table created.");
          } catch (error) {
            console.error(error);
            res.status(400).json({
              message:
                "There was an error creating the videos table. Please check your database connection, mysql instance, or hard drive space."
            });
          }

          try {
            // Create the thumbnails
            const [results, fields] = await pool.query(createThumbnailsTable);
            console.log("Thumbnails table created.");
          } catch (error) {
            console.error(error);
            res.status(400).json({
              message:
                "There was an error creating the thumbnails table. Please check your database connection, mysql instance, or hard drive space."
            });
          }

          try {
            const [results, fields] = await pool.query(createMP3sTable);
            console.log("MP3's table created.");
          } catch (error) {
            console.error(error);
            res.status(400).json({
              message:
                "There was an error creating the mp3s table. Please check your database connection, mysql instance, or hard drive space."
            });
          }

          res.status(200).json({ message: "Database successfully initialized."});
        }
      }
    }
  }
};

