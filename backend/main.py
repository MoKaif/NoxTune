import base64
import os
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware  # Added for CORS
from sqlalchemy import create_engine, Column, Integer, String, Text, or_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from pydantic import BaseModel
import uvicorn
import eyed3
from sqlalchemy import func

# Initialize FastAPI app
app = FastAPI(title="NoxTune Music Streaming API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust for your frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup with SQLite
DATABASE_URL = "sqlite:///noxtune.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Music directory path
MUSIC_DIR = "/home/nox/Music/OG Playlist"

# SQLAlchemy model for Song
class Song(Base):
    __tablename__ = "songs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    artist = Column(String, index=True)
    album = Column(String, index=True)
    genre = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)  # Duration in seconds
    source_type = Column(String, default="local")
    source = Column(String, unique=True)  # Path to audio file
    album_art = Column(Text, nullable=True)  # Base64 encoded album art

# Create database tables
Base.metadata.create_all(bind=engine)

# Pydantic models for API responses
class SongResponse(BaseModel):
    id: int
    title: str
    artist: str
    album: str
    genre: Optional[str] = None
    year: Optional[int] = None
    duration: Optional[int] = None
    source_type: str
    album_art: Optional[str] = None

class SongListResponse(BaseModel):
    songs: List[SongResponse]
    total: int

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper function to extract metadata and album art from audio file
def extract_metadata(file_path: str) -> dict:
    audio_file = eyed3.load(file_path)
    if not audio_file or audio_file.tag is None:
        return {
            "title": os.path.splitext(os.path.basename(file_path))[0],
            "artist": "Unknown Artist",
            "album": "Unknown Album",
            "genre": "Unknown",
            "year": 0,
            "duration": 0,
            "source_type": "local",
            "album_art": None
        }
    
    # Extract basic metadata
    title = audio_file.tag.title or os.path.splitext(os.path.basename(file_path))[0]
    artist = audio_file.tag.artist or "Unknown Artist"
    album = audio_file.tag.album or "Unknown Album"
    genre = audio_file.tag.genre.name if audio_file.tag.genre else "Unknown"
    year = audio_file.tag.getBestDate().year if audio_file.tag.getBestDate() else 0
    duration = int(audio_file.info.time_secs) if audio_file.info else 0
    
    # Extract album art if available
    album_art = None
    if audio_file.tag.images:
        album_art_data = audio_file.tag.images[0].image_data
        album_art = f"data:image/jpeg;base64,{base64.b64encode(album_art_data).decode('utf-8')}"
        print(f"Found album art for {file_path}")  # Debug
    else:
        print(f"No album art for {file_path}")  # Debug
    
    return {
        "title": title,
        "artist": artist,
        "album": album,
        "genre": genre,
        "year": year,
        "duration": duration,
        "source_type": "local",
        "album_art": album_art
    }

# Scanner function to scan music directory
def scan_music_dir(base_path: str) -> List[dict]:
    songs = []
    for root, _, files in os.walk(base_path):
        for file in files:
            if file.endswith((".mp3", ".flac", ".wav")):
                full_path = os.path.join(root, file)
                song_data = extract_metadata(full_path)
                song_data["source"] = full_path
                songs.append(song_data)
    return songs

# Seed database on startup
@app.on_event("startup")
def seed_database():
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(Song).count() > 0:
            print("Database already seeded, skipping...")
            return
        
        # Scan the music directory
        songs = scan_music_dir(MUSIC_DIR)
        
        # Seed songs into the DB
        for i, song_data in enumerate(songs):
            print(f"Seeding song {i+1}/{len(songs)}: {song_data['source']}")  # Debug
            song = Song(**song_data)
            db.add(song)
        db.commit()
        print(f"Seeded {len(songs)} songs into the database.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {str(e)}")
    finally:
        db.close()

# Endpoint to get song metadata by ID
@app.get("/songs/{song_id}", response_model=SongResponse)
async def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    return SongResponse(
        id=song.id,
        title=song.title,
        artist=song.artist,
        album=song.album,
        genre=song.genre,
        year=song.year,
        duration=song.duration,
        source_type=song.source_type,
        album_art=song.album_art
    )

# Endpoint to stream song by ID
@app.get("/stream/{song_id}")
async def stream_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song or not os.path.exists(song.source):
        raise HTTPException(status_code=404, detail="Song not found")
    
    return FileResponse(song.source, media_type="audio/mp3")
# Endpoint to list artists
@app.get("/artists", response_model=List[dict])
async def list_artists(db: Session = Depends(get_db)):
    artists = db.query(
        Song.artist.label("name"),
        func.count(Song.id).label("song_count")
    ).group_by(Song.artist).order_by(Song.artist).all()
    return [{"name": artist.name, "song_count": artist.song_count} for artist in artists]

# Endpoint to list albums
@app.get("/albums", response_model=List[dict])
async def list_albums(db: Session = Depends(get_db)):
    albums = db.query(
        Song.album.label("name"),
        Song.artist.label("artist"),
        func.count(Song.id).label("song_count")
    ).group_by(Song.album, Song.artist).order_by(Song.album).all()
    return [{"name": album.name, "artist": album.artist, "song_count": album.song_count} for album in albums]

# Endpoint to list genres
@app.get("/genres", response_model=List[dict])
async def list_genres(db: Session = Depends(get_db)):
    genres = db.query(
        Song.genre.label("name"),
        func.count(Song.id).label("song_count")
    ).group_by(Song.genre).order_by(Song.genre).all()
    return [{"name": genre.name, "song_count": genre.song_count} for genre in genres]
# Endpoint to list songs with pagination and search
@app.get("/songs", response_model=SongListResponse)
async def list_songs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),  # Increased default limit to 50
    search: str = Query(''),
    db: Session = Depends(get_db)
):
    query = db.query(Song)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Song.title.ilike(search_term),
                Song.artist.ilike(search_term),
                Song.album.ilike(search_term)
            )
        )
    
    total = query.count()
    songs = query.order_by(Song.title).offset(skip).limit(limit).all()  # Added sorting by title
    
    return SongListResponse(
        songs=[
            SongResponse(
                id=song.id,
                title=song.title,
                artist=song.artist,
                album=song.album,
                genre=song.genre,
                year=song.year,
                duration=song.duration,
                source_type=song.source_type,
                album_art=song.album_art
            )
            for song in songs
        ],
        total=total
    )
@app.get("/songs/by_artist/{artist_name}", response_model=SongListResponse)
async def list_songs_by_artist(
    artist_name: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Song).filter(Song.artist == artist_name)
    total = query.count()
    songs = query.order_by(Song.title).offset(skip).limit(limit).all()
    
    return SongListResponse(
        songs=[
            SongResponse(
                id=song.id,
                title=song.title,
                artist=song.artist,
                album=song.album,
                genre=song.genre,
                year=song.year,
                duration=song.duration,
                source_type=song.source_type,
                album_art=song.album_art
            )
            for song in songs
        ],
        total=total
    )

@app.get("/songs/by_album/{album_name}", response_model=SongListResponse)
async def list_songs_by_album(
    album_name: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Song).filter(Song.album == album_name)
    total = query.count()
    songs = query.order_by(Song.title).offset(skip).limit(limit).all()
    
    return SongListResponse(
        songs=[
            SongResponse(
                id=song.id,
                title=song.title,
                artist=song.artist,
                album=song.album,
                genre=song.genre,
                year=song.year,
                duration=song.duration,
                source_type=song.source_type,
                album_art=song.album_art
            )
            for song in songs
        ],
        total=total
    )
# Run the application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)