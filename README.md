# NoxTunes

## A Local Music Streaming Application with Last.fm Integration

NoxTunes is a full-stack web application designed to provide a seamless local music streaming experience with rich metadata management and Last.fm integration. It allows users to manage their local music library, stream tracks, and view their listening statistics and global charts powered by Last.fm.

## Features

- **Local Music Management**: Scan and organize your local MP3 files.
- **Metadata Extraction**: Automatically extracts title, artist, album, year, genre, duration, and album art from MP3 files using `eyed3`.
- **Music Streaming**: Stream your local music collection directly through the web interface.
- **Last.fm Integration**:
  - Connect your Last.fm account to scrobble played tracks.
  - View personal Last.fm listening statistics (total scrobbles, recent tracks, top artists, top albums, top tracks).
  - Explore global Last.fm charts for top artists, tracks, and tags.
- **Responsive UI**: Built with React and Tailwind CSS for a modern and adaptive user experience.
- **Search Functionality**: Quickly find tracks by title, artist, or album.

## Technologies Used

### Frontend

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Vite**: A fast build tool that provides a lightning-fast development experience.
- **Shadcn UI**: A collection of reusable components built with Radix UI and Tailwind CSS.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
- **Zustand**: A small, fast, and scalable bearbones state-management solution.
- **React Query**: Hooks for fetching, caching and updating asynchronous data in React.

### Backend

- **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.7+.
- **SQLAlchemy**: The Python SQL Toolkit and Object Relational Mapper that gives developers the full power of SQL.
- **eyed3**: A Python library for processing ID3 tags (metadata) in MP3 files.
- **python-dotenv**: Reads key-value pairs from a `.env` file and sets them as environment variables.
- **Uvicorn**: An ASGI web server for Python.

## Setup and Installation

Follow these steps to set up and run NoxTunes locally.

### Prerequisites

- Node.js (LTS recommended)
- npm (comes with Node.js)
- Python 3.9+
- `pip` (Python package installer)

### 1. Clone the Repository

```bash
git clone https://github.com/mokaif/noxtune
```

### 2. Backend Setup

Navigate to the `Backend` directory and set up the Python environment.

```bash
cd Backend
```

#### Create a Virtual Environment (Recommended)

```bash
python -m venv venv
source venv/Scripts/activate  # On Windows
# source venv/bin/activate    # On macOS/Linux
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Environment Variables

Create a `.env` file in the `Backend` directory with the following content:

```
DATABASE_URL="sqlite:///./sql_app.db"
TRACKS_FOLDER="D:/path/to/your/music/folder" # IMPORTANT: Use forward slashes and ensure this path is correct for your system
```

- `DATABASE_URL`: The SQLAlchemy database URL. For a simple SQLite file, use `sqlite:///./sql_app.db`.
- `TRACKS_FOLDER`: **Crucial**: This should be the absolute path to the folder containing your MP3 music files. **Ensure you use forward slashes (`/`) even on Windows.**

### 3. Frontend Setup

Navigate back to the project root/frontend and install frontend dependencies.

```bash
cd .. # Go back to the project root if you are in the Backend folder
npm install
```

## Running the Application

### 1. Start the Backend Server

From the `Backend` directory:

```bash
uvicorn main:app --reload
```

This will start the FastAPI server, typically on `http://127.0.0.1:8000`. The `--reload` flag will automatically restart the server on code changes.

### 2. Start the Frontend Development Server

From the frontend directory:

```bash
npm run dev
```

This will start the React development server, usually on `http://localhost:5173`.

Open your browser and navigate to `http://localhost:5173` to access the NoxTunes application.

## API Endpoints (Backend)

- `/tracks`: Get a paginated list of all tracks.
- `/tracks/{song_id}`: Get details for a specific track.
- `/tracks/{song_id}/album-art`: Get album art for a specific track.
- `/tracks/{song_id}/audio`: Stream audio for a specific track.
- `/search?q={query}`: Search for tracks by title, artist, or album.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
