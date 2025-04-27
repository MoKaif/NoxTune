# /backend/app/schemas/song.py

from pydantic import BaseModel

class SongBase(BaseModel):
    title: str
    artist: str
    album: str
    duration: int
    album_art: str | None = None

class Song(SongBase):
    id: int

    class Config:
        orm_mode = True
