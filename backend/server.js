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
import mp3Routes from './routes/mp3s.route.js';
import cookieParser from 'cookie-parser';

//#region Initializations
const app = express();
const env = process.env;
// Comement out below if you are only running locally.
if (env.ENVIRONMENT === 'production') {
    app.use(helmet());
}
app.use(express.json());
//#endregion

//#region Dev Conditions
if (env.ENVIRONMENT === 'development') {
  // Adjust the ip addresses to your machines ip addresses. I use vite so that's where the 5173 port comes from.
    app.use(cors({ origin: ["http://localhost:5173", `http://localhost:${env.PORT}`, /http:\/\/192.168.1.*:5173/, /http:\/\/192.168.1.*:\d\d\d\d/], credentials: true }));
}
//#endregion

app.use(cookieParser())

//#region Global Routes

app.use("/api/auth", authRoutes);
app.use("/api/initialize", initializeRoutes);
app.use("/api/ytdlp", ytdlpRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/mp3s", mp3Routes);

//#endregion

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/media', express.static(path.join(__dirname, 'media')));

//#region Production Conditions
if (process.env.ENVIRONMENT === "production" || process.env.ENVIRONMENT === "local") {
  // To make the node server serve the contents of the dist folder in the frontend/dist
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.all("/*splat/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
//#endregion