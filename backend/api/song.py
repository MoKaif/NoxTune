# /backend/app/api/song.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas.song import Song as SongSchema
from ..services.song_service import extract_metadata, store_album_art
from ..models.song import Song
from ..models.database import SessionLocal

router = APIRouter()

@router.get("/songs", response_model=list[SongSchema])
def get_songs(skip: int = 0, limit: int = 50, db: Session = Depends(SessionLocal)):
    songs = db.query(Song).offset(skip).limit(limit).all()
    print(songs)
    return songs

# /backend/app/api/song.py

@router.get("/songs/{id}", response_model=SongSchema)
def get_song(id: int, db: Session = Depends(SessionLocal)):
    db_song = db.query(Song).filter(Song.id == id).first()
    print(db_song)
    if db_song is None:
        raise HTTPException(status_code=404, detail="Song not found")
    return db_song

