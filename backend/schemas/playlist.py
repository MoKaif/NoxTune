from pydantic import BaseModel
from typing import List
from .song import Song

class PlaylistBase(BaseModel):
    name: str

class PlaylistCreate(PlaylistBase):
    song_ids: List[int] = []

class Playlist(PlaylistBase):
    id: int
    songs: List[Song] = []

    class Config:
        orm_mode = True
