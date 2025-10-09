# 🎥🔊 yt-dlp Library 🚀

Welcome to the **ultimate** media downloading experience! 📥 This **Video & MP3 Library** app, powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp), lets users download videos and audio from the web and store them in their own **private libraries**! 🎉 Built with a modern tech stack, it’s fast, user-friendly, and secure.

## 🌟 Features

- **Private User Libraries** 🔒: Each user gets their own secure space to store downloaded videos and MP3s.
- **Multi-User Support** 👥: Multiple users can use the app simultaneously, with isolated libraries.
- **Powered by yt-dlp** ⚡: Leverage the robust downloading capabilities of yt-dlp for reliable media fetching.
- **Sleek UI** ✨: Built with React, Vite, and Bootstrap for a smooth and responsive experience.
- **Robust Backend** 🛠️: Node.js, Express.js, and MySQL ensure scalability and secure data management.
- **Fast Development** 🚀: Vite’s lightning-fast build tool makes development a breeze.

## 🛠️ Tech Stack

- **Frontend**: React ⚛️, Vite ⚡, Bootstrap 🎨
- **Backend**: Node.js 🟢, Express.js 🚀
- **Database**: MySQL 🗄️
- **Downloader**: yt-dlp 📥

## 🚀 Getting Started

Ready to dive in? Follow these steps to get your media library up and running! 🏃‍♂️

### Prerequisites

- Node.js (v16 or higher) 🟢
- MySQL 🗄️
- yt-dlp installed globally or locally 📥
- A passion for downloading media! 😎

### Installation

1. **Clone the repo** 📂
   ```bash
   git clone https://github.com/alfred-delacosta/yt-dlp-library.git
   cd yt-dlp-library
   ```

2. **Install dependencies** 🛠️
   ```bash
   npm run build
   ```

3. **Set up environment variables** ⚙️

Copy the .env-sample in the backend folder to a .env file, fill in the appropriate values.

4. **Set up MySQL & yt-dlp** 🗄️:
  Ensure that you have MySQL and yt-dlp installed on the system.
  **yt-dlp must be accessible through the terminal from any location on the system (aka make sure it's in your environment variables)**

5. **Start the backend** 🚀
   ```bash
   npm run server
   ```

6. **Start the frontend** ⚛️
   ```bash
   npm run dev
   ```

7. **Open the app** 🌐
   Visit `http://localhost:PORT_YOU_ADDED_IN_THE_.ENV` in your browser and start downloading! 🎉

## 📖 Usage

1. **Sign Up/Login** 👤: Create an account or log in to access your private library.
2. **Enter URLs** 🔗: Paste video or audio URLs supported by yt-dlp.
3. **Download** 📥: Choose your format (video or MP3) and hit download!
4. **Manage Library** 📚: View, organize, and delete your downloaded media.

## 🙌 Acknowledgements

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for the awesome downloading capabilities.
- The open-source community for making this possible! 🌍

---

🎉 **Start building your media empire today!** 🎥🔊