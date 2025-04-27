import os
from mutagen import File

def scan_music_dir(base_path):
    songs = []
    for root, _, files in os.walk(base_path):
        for file in files:
            if file.endswith((".mp3", ".flac", ".wav")):
                full_path = os.path.join(root, file)
                audio = File(full_path, easy=True)
                if audio:
                    song = {
                        "title": audio.get("title", [os.path.splitext(file)[0]])[0],
                        "artist": audio.get("artist", ["Unknown Artist"])[0],
                        "album": audio.get("album", ["Unknown Album"])[0],
                        "genre": audio.get("genre", ["Unknown"])[0],
                        "year": int(audio.get("date", ["0"])[0][:4]) if "date" in audio else 0,
                        "duration": int(audio.info.length),
                        "source_type": "local",
                        "source": full_path,
                    }
                    songs.append(song)
    return songs
