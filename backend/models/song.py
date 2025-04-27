# /backend/app/models/song.py

from sqlalchemy import Column, Integer, String
from .database import Base

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    artist = Column(String)
    album = Column(String)
    duration = Column(Integer)  # Duration in seconds
    source = Column(String)  # Path to the mp3 file
    album_art = Column(String)  # URL to the album art (or path)
