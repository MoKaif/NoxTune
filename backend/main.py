import base64
import os
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware  # Added for CORS
from sqlalchemy import create_engine, Column, Integer, Boolean, String, Text, or_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from sqlalchemy import ForeignKey
from typing import Dict
from pydantic import BaseModel
import uvicorn
import eyed3
from sqlalchemy import func
import time
import asyncio

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

# SQLAlchemy model for Playlist
class Playlist(Base):
    __tablename__ = "playlists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    is_user_created = Column(Boolean, default=True)
    created_by = Column(String, default="system")

# SQLAlchemy model for PlaylistSong
class PlaylistSong(Base):
    __tablename__ = "playlist_songs"
    playlist_id = Column(Integer, ForeignKey("playlists.id"), primary_key=True)
    song_id = Column(Integer, ForeignKey("songs.id"), primary_key=True)

# Pydantic models
class PlaylistResponse(BaseModel):
    id: int
    name: str
    is_user_created: bool
    created_by: str
    songs: List[SongResponse]
    song_count: int

class CreatePlaylistRequest(BaseModel):
    name: str
    song_ids: List[int] = []

class UpdatePlaylistRequest(BaseModel):
    name: str

class AddSongsRequest(BaseModel):
    song_ids: List[int]
# Create database tables
Base.metadata.create_all(bind=engine)

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

# Improved seeding logic
@app.on_event("startup")
async def seed_database():
    start_time = time.time()
    db = SessionLocal()
    try:
        # Check if seeding is needed (6 playlists: 1 OG + 5 genre)
        playlist_count = db.query(Playlist).count()
        song_count = db.query(Song).count()
        if playlist_count >= 6 and song_count > 0:
            print(f"Database seeded (Songs: {song_count}, Playlists: {playlist_count}, Elapsed: {time.time() - start_time:.2f}s)")
            return

        # Step 1: Seed songs if none exist
        if song_count == 0:
            print("No songs found, seeding songs...")
            song_data = scan_music_dir(MUSIC_DIR)
            total_songs = len(song_data)
            print(f"Found {total_songs} songs to seed")
            batch_size = 100
            for i in range(0, total_songs, batch_size):
                batch = song_data[i:i + batch_size]
                db.bulk_insert_mappings(Song, batch)
                db.commit()
                print(f"Seeded {min(i + batch_size, total_songs)}/{total_songs} songs")
                await asyncio.sleep(0.1)  # Prevent I/O thrashing
            print(f"Songs seeded (Elapsed: {time.time() - start_time:.2f}s)")
        else:
            print(f"Found {song_count} songs, skipping song seeding")

        # Step 2: Create or update OG Playlist
        all_song_ids = list(set(song.id for song in db.query(Song.id).all()))  # Ensure unique song IDs
        og_playlist = db.query(Playlist).filter(Playlist.name == "OG Playlist").first()
        if not og_playlist:
            print("Creating OG Playlist...")
            og_playlist = Playlist(name="OG Playlist", is_user_created=False, created_by="system")
            db.add(og_playlist)
            db.flush()
        else:
            print(f"Updating OG Playlist (ID: {og_playlist.id})...")
        
        # Clear existing PlaylistSong entries
        db.query(PlaylistSong).filter(PlaylistSong.playlist_id == og_playlist.id).delete()
        db.commit()

        # Check existing songs in playlist to avoid duplicates
        existing_songs = set(
            ps.song_id for ps in db.query(PlaylistSong).filter(PlaylistSong.playlist_id == og_playlist.id).all()
        )
        new_playlist_songs = [
            {"playlist_id": og_playlist.id, "song_id": song_id}
            for song_id in all_song_ids
            if song_id not in existing_songs
        ]

        # Batch insert PlaylistSong for OG Playlist
        batch_size = 100
        for i in range(0, len(new_playlist_songs), batch_size):
            batch = new_playlist_songs[i:i + batch_size]
            db.bulk_insert_mappings(PlaylistSong, batch)
            db.commit()
            print(f"Seeded {min(i + batch_size, len(new_playlist_songs))}/{len(new_playlist_songs)} songs for OG Playlist")
            await asyncio.sleep(0.1)
        print(f"Seeded OG Playlist with {len(all_song_ids)} songs (Elapsed: {time.time() - start_time:.2f}s)")

        # Step 3: Create 5 genre playlists with most songs
        existing_genre_playlists = db.query(Playlist).filter(Playlist.is_user_created == False, Playlist.name != "OG Playlist").count()
        if existing_genre_playlists < 5:
            top_genres = (
                db.query(Song.genre, func.count(Song.id).label("song_count"))
                .group_by(Song.genre)
                .order_by(func.count(Song.id).desc())
                .limit(5)
                .all()
            )
            print(f"Top 5 genres: {[g.genre + f' ({g.song_count} songs)' for g in top_genres if g.genre]}")

            for genre, song_count in top_genres:
                genre_name = genre or "Unknown"
                playlist_name = f"{genre_name} Hits"
                genre_playlist = db.query(Playlist).filter(Playlist.name == playlist_name).first()
                if not genre_playlist:
                    print(f"Creating {playlist_name}...")
                    genre_playlist = Playlist(name=playlist_name, is_user_created=False, created_by="system")
                    db.add(genre_playlist)
                    db.flush()
                else:
                    print(f"Updating {playlist_name} (ID: {genre_playlist.id})...")
                
                # Clear existing PlaylistSong entries
                db.query(PlaylistSong).filter(PlaylistSong.playlist_id == genre_playlist.id).delete()
                db.commit()

                # Get up to 50 unique song IDs for the genre
                genre_songs = (
                    db.query(Song.id)
                    .filter(Song.genre == genre_name)
                    .limit(50)
                    .all()
                )
                genre_song_ids = list(set(song.id for song in genre_songs))  # Ensure unique song IDs
                playlist_songs = [
                    {"playlist_id": genre_playlist.id, "song_id": song_id}
                    for song_id in genre_song_ids
                ]

                # Batch insert PlaylistSong
                for i in range(0, len(playlist_songs), batch_size):
                    batch = playlist_songs[i:i + batch_size]
                    db.bulk_insert_mappings(PlaylistSong, batch)
                    db.commit()
                    print(f"Seeded {min(i + batch_size, len(playlist_songs))}/{len(playlist_songs)} songs for {playlist_name}")
                    await asyncio.sleep(0.1)
                print(f"Seeded {playlist_name} with {len(genre_song_ids)} songs (Elapsed: {time.time() - start_time:.2f}s)")

        print(f"Seeding completed successfully (Total Elapsed: {time.time() - start_time:.2f}s)")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {str(e)} (Elapsed: {time.time() - start_time:.2f}s)")
        raise
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
# Endpoint to create a playlist
# Create playlist
@app.post("/playlists", response_model=PlaylistResponse)
async def create_playlist(request: CreatePlaylistRequest, db: Session = Depends(get_db)):
    try:
        playlist = Playlist(name=request.name, is_user_created=True, created_by="user")
        db.add(playlist)
        db.flush()
        for song_id in request.song_ids:
            if db.query(Song).filter(Song.id == song_id).first():
                db.add(PlaylistSong(playlist_id=playlist.id, song_id=song_id))
        db.commit()
        songs = db.query(Song).join(PlaylistSong).filter(PlaylistSong.playlist_id == playlist.id).all()
        return PlaylistResponse(
            id=playlist.id,
            name=playlist.name,
            is_user_created=playlist.is_user_created,
            created_by=playlist.created_by,
            songs=[SongResponse(**song.__dict__) for song in songs],
            song_count=len(songs),
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Playlist name already exists")

# List playlists
@app.get("/playlists", response_model=List[PlaylistResponse])
async def list_playlists(db: Session = Depends(get_db)):
    playlists = db.query(Playlist).all()
    result = []
    for playlist in playlists:
        songs = db.query(Song).join(PlaylistSong).filter(PlaylistSong.playlist_id == playlist.id).all()
        result.append(
            PlaylistResponse(
                id=playlist.id,
                name=playlist.name,
                is_user_created=playlist.is_user_created,
                created_by=playlist.created_by,
                songs=[SongResponse(**song.__dict__) for song in songs],
                song_count=len(songs),
            )
        )
    return result

# Get single playlist
@app.get("/playlists/{playlist_id}", response_model=PlaylistResponse)
async def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    songs = db.query(Song).join(PlaylistSong).filter(PlaylistSong.playlist_id == playlist.id).all()
    return PlaylistResponse(
        id=playlist.id,
        name=playlist.name,
        is_user_created=playlist.is_user_created,
        created_by=playlist.created_by,
        songs=[SongResponse(**song.__dict__) for song in songs],
        song_count=len(songs),
    )

# Add songs to playlist
@app.post("/playlists/{playlist_id}/songs", response_model=PlaylistResponse)
async def add_songs_to_playlist(playlist_id: int, request: AddSongsRequest, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if not playlist.is_user_created:
        raise HTTPException(status_code=403, detail="Cannot modify recommended playlists")
    try:
        for song_id in request.song_ids:
            if db.query(Song).filter(Song.id == song_id).first():
                if not db.query(PlaylistSong).filter_by(playlist_id=playlist_id, song_id=song_id).first():
                    db.add(PlaylistSong(playlist_id=playlist_id, song_id=song_id))
        db.commit()
        songs = db.query(Song).join(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).all()
        return PlaylistResponse(
            id=playlist.id,
            name=playlist.name,
            is_user_created=playlist.is_user_created,
            created_by=playlist.created_by,
            songs=[SongResponse(**song.__dict__) for song in songs],
            song_count=len(songs),
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Some songs could not be added")

# Rename playlist
@app.put("/playlists/{playlist_id}", response_model=PlaylistResponse)
async def rename_playlist(playlist_id: int, request: UpdatePlaylistRequest, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if not playlist.is_user_created:
        raise HTTPException(status_code=403, detail="Cannot modify recommended playlists")
    try:
        playlist.name = request.name
        db.commit()
        songs = db.query(Song).join(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).all()
        return PlaylistResponse(
            id=playlist.id,
            name=playlist.name,
            is_user_created=playlist.is_user_created,
            created_by=playlist.created_by,
            songs=[SongResponse(**song.__dict__) for song in songs],
            song_count=len(songs),
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Playlist name already exists")

# Delete playlist
@app.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: int, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if not playlist.is_user_created:
        raise HTTPException(status_code=403, detail="Cannot delete recommended playlists")
    db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).delete()
    db.delete(playlist)
    db.commit()
    return {"detail": "Playlist deleted"}

# Run the application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)