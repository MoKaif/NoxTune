export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre?: string;
  year?: number;
  duration?: number;
  source_type: string;
  album_art?: string;
}

export interface SongListResponse {
  songs: Song[];
  total: number;
}

export interface Artist {
  name: string;
  song_count: number;
}

export interface Album {
  name: string;
  artist: string;
  song_count: number;
}

export interface Genre {
  name: string;
  song_count: number;
}