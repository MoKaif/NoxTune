import axios from 'axios';
import { SongListResponse, Artist, Album, Genre } from '../Types/types';

const api = {
  async fetchSongs(skip: number = 0, limit: number = 50, search: string = ''): Promise<SongListResponse> {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    const response = await axios.get(`http://localhost:8000/songs?${params}`);
    return response.data;
  },
  async fetchSongsByArtist(artistName: string, skip: number = 0, limit: number = 50): Promise<SongListResponse> {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    const response = await axios.get(`http://localhost:8000/songs/by_artist/${encodeURIComponent(artistName)}?${params}`);
    return response.data;
  },
  async fetchSongsByAlbum(albumName: string, skip: number = 0, limit: number = 50): Promise<SongListResponse> {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    const response = await axios.get(`http://localhost:8000/songs/by_album/${encodeURIComponent(albumName)}?${params}`);
    return response.data;
  },
  async fetchArtists(): Promise<Artist[]> {
    const response = await axios.get('http://localhost:8000/artists');
    return response.data;
  },
  async fetchAlbums(): Promise<Album[]> {
    const response = await axios.get('http://localhost:8000/albums');
    return response.data;
  },
  async fetchGenres(): Promise<Genre[]> {
    const response = await axios.get('http://localhost:8000/genres');
    return response.data;
  },
  getStreamUrl(songId: number): string {
    return `http://localhost:8000/stream/${songId}`;
  },
};

export default api;