import express from 'express';
import '@dotenvx/dotenvx/config';
import helmet from "helmet";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.route.js"
import initializeRoutes from "./routes/initialize.route.js"
import ytdlpRoutes from './routes/yt-dlp.route.js';
import videosRoutes from './routes/videos.route.js';
import cookieParser from 'cookie-parser';

//#region Initializations
const app = express();
const env = process.env;
app.use(helmet());
app.use(express.json());
//#endregion

//#region Dev Conditions
if (env.ENVIRONMENT === 'development') {
    app.use(cors());
}
//#endregion

app.use(cookieParser())

//#region Global Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use("/api/auth", authRoutes);
app.use("/api/initialize", initializeRoutes);
app.use("/api/ytdlp", ytdlpRoutes);
app.use("/api/videos", videosRoutes)
//#endregion

//#region Production Conditions
if (process.env.ENVIRONMENT === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // To make the node server serve the contents of the dist folder in the frontend/dist
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.all("/*splat/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
//#endregion