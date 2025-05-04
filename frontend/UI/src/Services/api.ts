import axios from 'axios';
import { SongListResponse, Artist, Album, Genre, Playlist } from '../Types/types';

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
  async fetchPlaylists(): Promise<Playlist[]> {
    try {
      const response = await axios.get('http://localhost:8000/playlists');
      console.log('Fetched playlists:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  },
  async fetchPlaylist(playlistId: number): Promise<Playlist> {
    const response = await axios.get(`http://localhost:8000/playlists/${playlistId}`);
    return response.data;
  },
  async createPlaylist(name: string, songIds: number[]): Promise<Playlist> {
    const response = await axios.post('http://localhost:8000/playlists', { name, song_ids: songIds });
    return response.data;
  },
  async addSongsToPlaylist(playlistId: number, songIds: number[]): Promise<Playlist> {
    try {
      console.log(`Adding songs ${songIds} to playlist ${playlistId}`);
      const response = await axios.post(`http://localhost:8000/playlists/${playlistId}/songs`, { song_ids: songIds });
      console.log('Add songs response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding songs to playlist:', error);
      throw error;
    }
  },
  async renamePlaylist(playlistId: number, name: string): Promise<Playlist> {
    const response = await axios.put(`http://localhost:8000/playlists/${playlistId}`, { name });
    return response.data;
  },
  async deletePlaylist(playlistId: number): Promise<void> {
    await axios.delete(`http://localhost:8000/playlists/${playlistId}`);
  },
  getStreamUrl(songId: number): string {
    return `http://localhost:8000/stream/${songId}`;
  },
};

export default api;