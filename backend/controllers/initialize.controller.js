import mysql from "mysql2/promise";
import "@dotenvx/dotenvx/config";
import { createVideosTable, createThumbnailsTable, createMP3sTable, createUsersTable } from "../db/queries.initialize.db.js";
import { addUsersToVideosTable, addUsersToMp3sTable, addServerPathToVideos, addServerPathToMp3s, addServerPathToThumbnails, getAllVideos } from "../db/queries.general.js";
import { __dirname, rootFolder, createFolders } from "../utils/fileOperations.js";
import path from 'path'
import { pool } from "../db/db.pool.js";
import { sqlUpdateVideoPaths } from "../db/queries.videos.js";

// TODO Come back and refactor this at some point...
export const initializeDb = async (req, res) => {
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
        // Create the users table
        const [results, fields] = await pool.query(createUsersTable);
      } catch (error) {
        console.error(error);
        res.status(400).json({
          message:
            "There was an error creating the videos table. Please check your database connection, mysql instance, or hard drive space."
        });
      }
      try {
        // Create videos table
        const [results, fields] = await pool.query(createVideosTable);
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
      } catch (error) {
        console.error(error);
        res.status(400).json({
          message:
            "There was an error creating the thumbnails table. Please check your database connection, mysql instance, or hard drive space."
        });
      }

      try {
        const [results, fields] = await pool.query(createMP3sTable);
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

          try {
            const [results, fields] = await pool.query(createUsersTable);
            console.log("Users table created.");
          } catch (error) {
            console.error(error);
            res.status(400).json({
              message:
                "There was an error creating the users table. Please check your database connection, mysql instance, or hard drive space."
            });
          }

          res.status(200).json({ message: "Database successfully initialized."});
        }
      }
    }
  }
};

export const initializeFolders = async (req, res) => {
    try {
        await createFolders();
        res.status(200).json({ message: "Folders successfully created."})
    } catch (error) {
        if (error.errno === -4075) res.status(200).json({ message: "Folders already created!"});
        else {
            res.status(400).json({ message: "There was an error initializing the folders."});
            console.error(error);
        }
    }
}

export const updateLegacyTables = async (req, res) => {
  try {
    const [ uResults, uFields ] = await pool.query(createUsersTable);
    const [ uvResults, uvFields ] = await pool.query(addUsersToVideosTable);
    const [ umResults, umFields ] = await pool.query(addUsersToMp3sTable);
    const [ spvResults, spvFields ] = await pool.query(addServerPathToVideos);
    const [ spmResults, spmFields ] = await pool.query(addServerPathToMp3s);
    const [ sptResults, sptFields ] = await pool.query(addServerPathToThumbnails);

    res.status(200).json({ message: "Tables updated successfully!"})
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'There was an error updating the Legacy Tables.' })
  }
}

export const updateVideoPaths = async (req, res) => {
  try {
    const [videoResults, videoFields] = await pool.query(getAllVideos);
    for (const video of videoResults) {
      const baseVideoPath = video.videoPath.split('/videos/')[1];
      if (baseVideoPath) {
        const newVideoPath = path.join('media', baseVideoPath);
        const newServerPath = path.join(rootFolder, 'media', 'videos', video.name);
        await sqlUpdateVideoPaths(newVideoPath, newServerPath, video.id);
      }
    }

    const [newVideoResults, newVideoFields] = await pool.query(getAllVideos);

    res.json(newVideoResults);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "There was an error!", error});
  }
}