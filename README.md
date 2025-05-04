# 🎵 NoxTune

**NoxTune** is a powerful, self-hosted personal music streaming platform built for organizing, streaming, and exploring your music collection in a beautiful Spotify-like UI. It's designed to run on a local server and stream both local files and online links (Spotify, YouTube, etc.) with insights and smart tagging.

---

## 🚀 Features

- 🎶 Stream music directly from your local library
- 🖼️ Display album art via metadata extraction
- 🔍 Real-time search and filter functionality
- 📃 Playlist management (create, add, delete)
- 📦 Fully responsive, mobile-friendly UI
- ⏯️ Music queue support with auto-play
- 🗂️ Tagging system with genre/year/etc.
- 🌐 Optional streaming from Spotify/YouTube
- 📊 Insights and stats planned (plays, favorites)
- 🧠 Smart API integration roadmap (Last.fm, Discogs)

---

## 🛠️ Tech Stack

### Frontend
- **React** (TypeScript)
- **TailwindCSS** for styling

### Backend
- **FastAPI** - RESTful API server
- **SQLite** - Lightweight database
- **eyeD3** - Metadata extraction from MP3 files
- SQLAlchemy ORM

---

## 📂 Project Structure

```
noxtune/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── schemas/
│   ├── scanner.py
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── ...
│   └── ...
├── noxtune.db
├── README.md
└── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- SQLite (optional for viewing the DB)
- FFmpeg (for extended media format support)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend/UI
npm install
npm run dev
```

---

## 🌐 API Endpoints

- `GET /songs` - Fetch all songs with pagination
- `GET /songs/{id}` - Get details and album art
- `POST /songs` - Add a new song
- `GET /stream/{id}` - Stream a song
- `GET /playlists` / `POST /playlists` - Playlist CRUD

---

## 🔮 Roadmap

- 🎛️ Advanced queue management (shuffle, repeat, skip logic)
- 🧠 AI-based recommendations
- 📈 Listening insights and analytics dashboard
- 🔐 Optional authentication for multi-user mode
- ☁️ Cloud upload and backup
- 🪞 PWA support for mobile installability

---

## 🧠 Learnings & Architecture

- FastAPI is used for performance and async streaming.
- Metadata extraction is done during DB seeding and can be cached or persisted.
- Tailwind helps in building a fast and clean UI.
- SQLite was chosen for simplicity, but can be upgraded to Postgres later.

---


## 📄 License

MIT License © 2025 [NoxTune](https://github.com/MoKaif)