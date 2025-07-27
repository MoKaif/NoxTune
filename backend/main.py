import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import eyed3
import logging
eyed3.log.setLevel("ERROR")

DATABASE_URL = os.getenv("DATABASE_URL")
TRACKS_FOLDER = os.getenv("TRACKS_FOLDER")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()





from fastapi.responses import StreamingResponse, JSONResponse
from fastapi import Query, HTTPException

app = FastAPI()

# --- CORS Middleware: Add IMMEDIATELY after app creation ---
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. For production, set to your frontend URL (e.g. http://localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# New Track model with detailed metadata
import base64
from sqlalchemy.dialects.postgresql import BYTEA

class Track(Base):
    __tablename__ = "tracks"
    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(String, unique=True, index=True)  # Unique song identifier
    title = Column(String)
    artist = Column(String)
    album = Column(String)
    year = Column(Integer)
    genre = Column(String)
    duration = Column(Float)
    path = Column(String, unique=True)
    album_art = Column(String)  # Store base64 string of image
    comment = Column(String)

# Utility function to generate song_id
import uuid
def generate_song_id():
    return str(uuid.uuid4())

# Utility function to extract album art as base64
def extract_album_art(audio):
    if audio.tag and audio.tag.images:
        for img in audio.tag.images:
            return base64.b64encode(img.image_data).decode('utf-8')
    return None

# Scan and seed database with detailed metadata
def scan_and_seed():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    logger = logging.getLogger("track_seed")
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(handler)

    import time
    MAX_PROCESS_TIME = 5  # seconds per track

    for root, _, files in os.walk(TRACKS_FOLDER):
        for file in files:
            if file.endswith(".mp3"):
                full_path = os.path.join(root, file)
                start_time = time.time()
                try:
                    audio = eyed3.load(full_path)
                except Exception as e:
                    logger.error(f"Error loading {full_path}: {e}")
                    continue
                elapsed = time.time() - start_time
                if elapsed > MAX_PROCESS_TIME or audio is None or audio.tag is None:
                    logger.warning(f"Skipped {full_path}: took {elapsed:.2f}s or missing metadata.")
                    continue
                title = audio.tag.title or file
                artist = audio.tag.artist or "Unknown"
                album = audio.tag.album or "Unknown"
                year = audio.tag.getBestDate() or 0
                genre = audio.tag.genre.name if audio.tag.genre else "Unknown"
                duration = audio.info.time_secs if audio.info else 0
                album_art = extract_album_art(audio)
                comment = audio.tag.comments[0].text if audio.tag.comments else ""
                song_id = generate_song_id()
                # Check if already exists
                if not session.query(Track).filter_by(path=full_path).first():
                    track = Track(
                        song_id=song_id,
                        title=title,
                        artist=artist,
                        album=album,
                        year=year if isinstance(year, int) else 0,
                        genre=genre,
                        duration=duration,
                        path=full_path,
                        album_art=album_art,
                        comment=comment
                    )
                    session.add(track)
    session.commit()
    session.close()

# Paginated track list endpoint
@app.get("/tracks")
def get_tracks(limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0)):
    import time
    from sqlalchemy.orm import load_only
    start = time.time()
    session = SessionLocal()
    tracks = (
        session.query(Track)
        .options(load_only(
            Track.song_id, Track.title, Track.artist, Track.album, Track.year, Track.genre, Track.duration, Track.album_art
        ))
        .order_by(Track.id)
        .offset(offset)
        .limit(limit)
        .all()
    )
    session.close()
    end = time.time()
    print(f"/tracks query executed in {end - start:.2f} seconds for {len(tracks)} tracks (optimized)")
    return [
        {
            "song_id": t.song_id,
            "title": t.title,
            "artist": t.artist,
            "album": t.album,
            "year": t.year,
            "genre": t.genre,
            "duration": t.duration,
            "album_art": getattr(t, "album_art", None)
        }
        for t in tracks
    ]

# Track details endpoint
@app.get("/tracks/{song_id}")
def get_track_details(song_id: str):
    session = SessionLocal()
    track = session.query(Track).filter_by(song_id=song_id).first()
    session.close()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return {
        "song_id": track.song_id,
        "title": track.title,
        "artist": track.artist,
        "album": track.album,
        "year": track.year,
        "genre": track.genre,
        "duration": track.duration,
        "album_art": track.album_art,
        "comment": track.comment,
        "path": track.path
    }

# Album art endpoint
@app.get("/tracks/{song_id}/album-art")
def get_album_art(song_id: str):
    session = SessionLocal()
    track = session.query(Track).filter_by(song_id=song_id).first()
    session.close()
    if not track or not track.album_art:
        raise HTTPException(status_code=404, detail="Album art not found")
    return JSONResponse(content={"album_art": track.album_art})

# Search endpoint
@app.get("/search")
def search_tracks(q: str = Query(..., min_length=1)):
    session = SessionLocal()
    search_term = f"%{q}%"
    tracks = session.query(Track).filter(
        Track.title.ilike(search_term) |
        Track.artist.ilike(search_term) |
        Track.album.ilike(search_term)
    ).all()
    session.close()
    return [
        {
            "song_id": t.song_id,
            "title": t.title,
            "artist": t.artist,
            "album": t.album,
            "year": t.year,
            "genre": t.genre,
            "duration": t.duration,
            "album_art": t.album_art
        }
        for t in tracks
    ]

# Audio streaming endpoint
@app.get("/tracks/{song_id}/audio")
def stream_audio(song_id: str):
    session = SessionLocal()
    track = session.query(Track).filter_by(song_id=song_id).first()
    session.close()
    if not track or not os.path.exists(track.path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    def iterfile():
        with open(track.path, mode="rb") as file_like:
            yield from file_like
    return StreamingResponse(iterfile(), media_type="audio/mpeg")
