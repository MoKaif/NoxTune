# /backend/app/services/song_service.py

import eyed3
import base64
import os
from pathlib import Path
from ..models.database import SessionLocal
from ..models.song import Song
from fastapi import HTTPException

def extract_metadata(file_path: str):
    audio_file = eyed3.load(file_path)
    if audio_file.tag is None:
        return None

    metadata = {
        "title": audio_file.tag.title,
        "artist": audio_file.tag.artist,
        "album": audio_file.tag.album,
        "duration": int(audio_file.info.time_secs),
        "albumArt": None,
    }

    # Extract album art if available
    if audio_file.tag.images:
        album_art = audio_file.tag.images[0].image_data
        metadata["albumArt"] = f"data:image/jpeg;base64,{base64.b64encode(album_art).decode('utf-8')}"
    
    return metadata

def get_album_art(mp3_file_path: str):
    audiofile = eyed3.load(mp3_file_path)
    if audiofile.tag is not None and audiofile.tag.frame_set.get(b"APIC"):
        album_art_frame = audiofile.tag.frame_set.get(b"APIC")[0]
        album_art = album_art_frame.image_data
        return album_art
    return None

def store_album_art(song_id: int, album_art_data: bytes):
    # Save the image to a static folder or CDN and return the URL
    static_folder = "static/album_art"
    Path(static_folder).mkdir(parents=True, exist_ok=True)
    file_path = os.path.join(static_folder, f"{song_id}.jpg")
    with open(file_path, "wb") as f:
        f.write(album_art_data)
    return f"/static/album_art/{song_id}.jpg"
