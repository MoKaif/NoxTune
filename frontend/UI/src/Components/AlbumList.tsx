import { useState, useEffect } from 'react';
import api from '../Services/api';
import SongCard from './SongCard';
import SearchBar from './SearchBar';
import { Album } from '../Types/types';

interface AlbumListProps {
    onSelectSong: (song: Song) => void;
  }
  
  const AlbumList: React.FC<AlbumListProps> = ({ onSelectSong }) => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const limit = 50;
  
    useEffect(() => {
      const fetchAlbums = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await api.fetchAlbums();
          setAlbums(data);
        } catch (error) {
          console.error('Error fetching albums:', error);
          setError('Failed to load albums. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAlbums();
    }, []);
  
    useEffect(() => {
      if (selectedAlbum) {
        const fetchSongs = async () => {
          setIsLoading(true);
          setError(null);
          try {
            const data = await api.fetchSongsByAlbum(selectedAlbum, (page - 1) * limit, limit);
            if (!data || !Array.isArray(data.songs)) {
              throw new Error('Invalid response from server: songs array missing');
            }
            setSongs(data.songs);
            setTotal(data.total || 0);
          } catch (error) {
            console.error('Error fetching songs:', error);
            setError('Failed to load songs. Please try again.');
            setSongs([]);
          } finally {
            setIsLoading(false);
          }
        };
        fetchSongs();
      }
    }, [selectedAlbum, page, search]);
  
    return (
      <div className="p-4">
        {isLoading && <p className="text-center text-gray-400">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!isLoading && !error && !selectedAlbum && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Albums</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map((album) => (
                <div
                  key={`${album.name}-${album.artist}`}
                  className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
                  onClick={() => setSelectedAlbum(album.name)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && setSelectedAlbum(album.name)}
                  aria-label={`View songs from ${album.name}`}
                >
                  <h3 className="text-sm font-semibold">{album.name}</h3>
                  <p className="text-xs text-gray-400">{album.artist}</p>
                  <p className="text-xs text-gray-400">{album.song_count} songs</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedAlbum && (
          <div>
            <button
              className="mb-4 text-green-500 hover:underline"
              onClick={() => setSelectedAlbum(null)}
              aria-label="Back to albums"
            >
              Back to Albums
            </button>
            <SearchBar onSearch={setSearch} />
            {isLoading && <p className="text-center text-gray-400">Loading...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!isLoading && !error && songs.length === 0 && (
              <p className="text-center text-gray-400">No songs found.</p>
            )}
            {!isLoading && !error && songs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} onSelect={onSelectSong} />
                ))}
              </div>
            )}
            {!isLoading && songs.length > 0 && (
              <div className="flex justify-between mt-4">
                <button
                  className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span>Page {page} of {Math.ceil(total / limit)}</span>
                <button
                  className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(p + 1, Math.ceil(total / limit)))}
                  disabled={page === Math.ceil(total / limit)}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  export default AlbumList;