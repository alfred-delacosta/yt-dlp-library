import mysql from "mysql2/promise";
import "@dotenvx/dotenvx/config";
import { createVideosTable, createThumbnailsTable, createMP3sTable, createUsersTable, createMaintenanceTable, addMaintenanceTableEntry, getMaintenanceTableEntry } from "../db/queries.initialize.db.js";
import { addUsersToVideosTable, addUsersToMp3sTable, addServerPathToVideos, addServerPathToMp3s, addServerPathToThumbnails, getAllVideos } from "../db/queries.general.js";
import { __dirname, rootFolder, createFolders } from "../utils/fileOperations.js";
import path from 'path'
import { pool } from "../db/db.pool.js";
import { sqlUpdateVideoPaths } from "../db/queries.videos.js";

export const initializeDb = async (req, res) => {
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
    res.status(200).json({ message: "Database initialized!", dbInitialized: true, queryResults: dbResults });

  } catch (error) {
    // if (error.code === "ER_NO_SUCH_TABLE") {
    //   // Create the Maintenance table 
    //   try {
    //     const [results, fields] = await pool.query(createMaintenanceTable);
    //     console.log("Maintenance table created.");
    //   } catch (error) {
    //     console.error(error);
    //     res.status(400).json({
    //       message:
    //         "There was an error creating the maintenance table. Please check your database connection, mysql instance, or hard drive space."
    //     });
    //   }
    //   try {
    //     // Create the users table
    //     const [results, fields] = await pool.query(createUsersTable);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(400).json({
    //       message:
    //         "There was an error creating the videos table. Please check your database connection, mysql instance, or hard drive space."
    //     });
    //   }
    //   try {
    //     // Create videos table
    //     const [results, fields] = await pool.query(createVideosTable);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(400).json({
    //       message:
    //         "There was an error creating the videos table. Please check your database connection, mysql instance, or hard drive space."
    //     });
    //   }

    //   try {
    //     // Create the thumbnails
    //     const [results, fields] = await pool.query(createThumbnailsTable);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(400).json({
    //       message:
    //         "There was an error creating the thumbnails table. Please check your database connection, mysql instance, or hard drive space."
    //     });
    //   }

    //   try {
    //     const [results, fields] = await pool.query(createMP3sTable);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(400).json({
    //       message:
    //         "There was an error creating the mp3s table. Please check your database connection, mysql instance, or hard drive space."
    //     });
    //   }

    //   res.status(200).json({ message: "Database successfully initialized."});
    // }

    if (error.code === "ER_DB_CREATE_EXISTS") {
      try {
        res.status(200).json({ message: "Database already initialized!", dbInitialized: true });
      } catch (error) {
        console.error(error);
        res.status(400).json({ message: "There was an error initializing the database", dbInitialized: false });
        // if (error && error.code === "ER_NO_SUCH_TABLE") {
        //   // Create the Maintenance table 
        //   try {
        //     const [results, fields] = await pool.query(createMaintenanceTable);
        //     console.log("Maintenance table created.");
        //   } catch (error) {
        //     console.error(error);
        //     res.status(400).json({
        //       message:
        //         "There was an error creating the maintenance table. Please check your database connection, mysql instance, or hard drive space."
        //     });
        //   }

        //   try {
        //     const [results, fields] = await pool.query(createUsersTable);
        //     console.log("Users table created.");
        //   } catch (error) {
        //     console.error(error);
        //     res.status(400).json({
        //       message:
        //         "There was an error creating the users table. Please check your database connection, mysql instance, or hard drive space."
        //     });
        //   }

        //   try {
        //     // Create videos table
        //     const [results, fields] = await pool.query(createVideosTable);
        //     console.log("Videos table created.");
        //   } catch (error) {
        //     console.error(error);
        //     res.status(400).json({
        //       message:
        //         "There was an error creating the videos table. Please check your database connection, mysql instance, or hard drive space."
        //     });
        //   }

        //   try {
        //     // Create the thumbnails
        //     const [results, fields] = await pool.query(createThumbnailsTable);
        //     console.log("Thumbnails table created.");
        //   } catch (error) {
        //     console.error(error);
        //     res.status(400).json({
        //       message:
        //         "There was an error creating the thumbnails table. Please check your database connection, mysql instance, or hard drive space."
        //     });
        //   }

        //   try {
        //     const [results, fields] = await pool.query(createMP3sTable);
        //     console.log("MP3's table created.");
        //   } catch (error) {
        //     console.error(error);
        //     res.status(400).json({
        //       message:
        //         "There was an error creating the mp3s table. Please check your database connection, mysql instance, or hard drive space."
        //     });
        //   }
        //   res.status(200).json({ message: "Database successfully initialized."});
        // }
      }
    } else {
        console.error(error);
        res.status(400).json({ message: "There was an error initializing the database", dbInitialized: false });
    }
  }
};

export const initializeMaintenanceTable = async (req, res) => {
  try {
    const pool =  mysql.createPool({
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

    const [results, fields] = await pool.query(createMaintenanceTable);
    res.json({ message: "Maintenance table created successfully.", maintenanceTableInitialized: true, queryResults: results });
  } catch (error) {
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        res.json({ message: "Maintenance table already created.", maintenanceTableInitialized: true });
      } else {
        console.error(error);
        res.status(400).json({message: "There was an error creating the maintenance table. Please check your database connection, mysql instance, or hard drive space."});
      }
  }
}

export const initializeUsersTable = async (req, res) => {
  try {
    const pool =  mysql.createPool({
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

    const [results, fields] = await pool.query(createUsersTable);
    res.json({ message: "Users table created successfully.", usersTableInitialized: true, queryResults: results });
  } catch (error) {
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        res.json({ message: "Users table already created.", usersTableInitialized: true });
      } else {
        console.error(error);
        res.status(400).json({message: "There was an error creating the users table. Please check your database connection, mysql instance, or hard drive space."});
      }
  }
}

export const initializeThumbnailsTable = async (req, res) => {
  try {
    const pool =  mysql.createPool({
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

    const [results, fields] = await pool.query(createThumbnailsTable);
    res.json({ message: "Thumbnails table created successfully.", thumbnailsTableInitialized: true, queryResults: results });
  } catch (error) {
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        res.json({ message: "Thumbnails table already created.", thumbnailsTableInitialized: true });
      } else {
        console.error(error);
        res.status(400).json({message: "There was an error creating the thumbnails table. Please check your database connection, mysql instance, or hard drive space."});
      }
  }
}

export const initializeMp3sTable = async (req, res) => {
  try {
    const pool =  mysql.createPool({
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

    const [results, fields] = await pool.query(createMP3sTable);
    res.json({ message: "MP3s table created successfully.", Mp3sTableInitialized: true, queryResults: results });
  } catch (error) {
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        res.json({ message: "MP3s table already created.", Mp3sTableInitialized: true });
      } else {
        console.error(error);
        res.status(400).json({message: "There was an error creating the MP3s table. Please check your database connection, mysql instance, or hard drive space."});
      }
  }
}

export const initializeVideosTable = async (req, res) => {
  try {
    const pool =  mysql.createPool({
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

    const [results, fields] = await pool.query(createVideosTable);
    res.json({ message: "Videos table created successfully.", videosTableInitialized: true, queryResults: results });
  } catch (error) {
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        res.json({ message: "Videos table already created.", videosTableInitialized: true });
      } else {
        console.error(error);
        res.status(400).json({message: "There was an error creating the videos table. Please check your database connection, mysql instance, or hard drive space."});
      }
  }
}

export const initializeFolders = async (req, res) => {
    try {
        await createFolders();
        res.status(200).json({ message: "Folders successfully created."})
    } catch (error) {
        if (error.errno === -4075) res.status(200).json({ message: "Folders already created!", foldersInitialized: true});
        else {
            res.status(400).json({ message: "There was an error initializing the folders."});
            console.error(error);
        }
    }
}

export const updateLegacyTables = async (req, res) => {
  try {
    // const [ uResults, uFields ] = await pool.query(createUsersTable);
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

export const checkForUsersTable = async (req, res) => {
  try {
    const [results, fields] = await pool.query('SHOW TABLES LIKE ?', ['users']);
    res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "There was an error checking for the users table.", error: error.message })
  }
  
}

export const createMaintenanceTableEntry = async (req, res) => {
  try {
    const pool =  mysql.createPool({
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

    const [results, fields] = await pool.query(addMaintenanceTableEntry);
    res.json({ message: "Maintenance table entry created successfully.", queryResults: results });
  } catch (error) {
      console.error(error);
      res.status(400).json({message: "There was an error creating the entry in the maintenance table. Please check your database connection, mysql instance, or hard drive space."});
  }
}

export const checkForAppInitialization = async (req, res) => {
  try {
    const pool =  mysql.createPool({
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

    const [results, fields] = await pool.query(getMaintenanceTableEntry);
    res.json({ results, appInit: true });
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      res.json({ message: "Maintenance table has not been created.", appInit: false, results: [] });
    } else {
      console.error(error);
      res.status(400).json({message: "There was an error creating the entry in the maintenance table. Please check your database connection, mysql instance, or hard drive space."});
    }
  }
}