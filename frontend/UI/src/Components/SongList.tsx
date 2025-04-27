import { useState, useEffect } from 'react';
import api from '../Services/api';
import SongCard from './SongCard';
import SearchBar from './SearchBar';
import { Song } from '../Types/types';

interface SongListProps {
  onSelectSong: (song: Song) => void;
  filterType?: 'artist' | 'album' | 'genre';
  filterValue?: string;
}

const SongList: React.FC<SongListProps> = ({ onSelectSong, filterType, filterValue }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 50;

  const fetchSongs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let searchQuery = search;
      if (filterType && filterValue) {
        searchQuery = `${filterType}:${filterValue} ${search}`.trim();
      }
      const data = await api.fetchSongs((page - 1) * limit, limit, searchQuery);
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

  useEffect(() => {
    fetchSongs();
  }, [page, search, filterType, filterValue]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4">
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
          <span>Page {page} of {totalPages}</span>
          <button
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SongList;