# 🎵 Jammming

## 📌 Overview
**Jammming** is a React-based web application built as part of a Codecademy portfolio project.  
It integrates with the Spotify API to allow users to search for music, create playlists, and save them directly to their Spotify account.

---

## 🚀 Features
- 🔍 Search the Spotify library for songs
- ➕ Add/remove tracks to a custom playlist
- ✏️ Name your playlist
- 💾 Save playlists directly to your Spotify account
- ▶️ Preview songs with basic playback controls

---

## 🧠 Project Goals
This project focuses on:
- Building real-world frontend applications using **React + Vite**
- Integrating third-party APIs (Spotify Web API)
- Handling **authentication & authorization (OAuth)**
- Structuring a full-stack app with a **Node.js + Express backend**

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite
- **Backend:** Node.js, Express.js
- **API:** Spotify Web API
- **Auth:** OAuth 2.0

---

## ⚙️ Prerequisites
Before setting up the project, ensure you have:

- ✅ A **Spotify Premium account**
- ✅ A **Spotify Developer account**
- ✅ **Node.js (latest version)** installed

> ℹ️ You’ll need your Spotify **Client ID** and **Client Secret** from the developer dashboard.

---

## 📦 Installation & Setup

### 1. Download the Project
Download the latest release from:  
👉 `[TODO: Add Releases Link]`

---

### 2. Extract & Open
- Unzip the project
- Open it in your preferred IDE (recommended: **VS Code**)

---

### 3. Configure Environment Variables

#### 📁 Client (`/client/.env`)
```env
VITE_SERVER_BASE_URL=http://127.0.0.1:3000
```

#### 📁 Server (`/server/.env`)
```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
CLIENT_DEV_URL=http://127.0.0.1:5173
CLIENT_PROD_URL=http://127.0.0.1:4173
SERVER_BASE_URL=http://127.0.0.1:3000
SERVER_PORT=3000
```

---

### 4. Install Dependencies
From the project root:

```bash
npm install
```

---

### 5. Run the Application

Use **two terminals**:

#### ▶️ Start Backend
```bash
npm run server-dev
```

#### 💻 Start Frontend
```bash
npm run client-dev
```

---

### 6. Open the App
Visit:
```
http://127.0.0.1:5173/
```

---

## ✅ Expected Behaviour
- You’ll see a **“Login to Spotify”** button
- After logging in:
  - Search for songs
  - Play previews
  - Build and save playlists

---

## 📚 Resources
- https://www.codecademy.com/
- https://open.spotify.com/
- https://developer.spotify.com/
- https://developer.spotify.com/documentation/web-api
- https://developer.spotify.com/documentation/web-api/tutorials/authorization-guide
- https://react.dev/
- https://vitejs.dev/
- https://expressjs.com/
- https://nodejs.org/en

---

## 📌 Notes
- This project is for **learning and portfolio purposes**
- Spotify Premium is required for full functionality

---

## 👤 Author
Zodiac Willoughby-O'Neill
