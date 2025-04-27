import { useState, useEffect } from 'react';
import api from '../Services/api';
import SongList from './SongList';
import { Genre } from '../Types/types';

interface GenreListProps {
  onSelectSong: (song: Song) => void;
}

const GenreList: React.FC<GenreListProps> = ({ onSelectSong }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.fetchGenres();
        setGenres(data);
      } catch (error) {
        console.error('Error fetching genres:', error);
        setError('Failed to load genres. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenres();
  }, []);

  return (
    <div className="p-4">
      {isLoading && <p className="text-center text-gray-400">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!isLoading && !error && !selectedGenre && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Genres</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.name}
                className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
                onClick={() => setSelectedGenre(genre.name)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && setSelectedGenre(genre.name)}
                aria-label={`View songs in ${genre.name} genre`}
              >
                <h3 className="text-sm font-semibold">{genre.name}</h3>
                <p className="text-xs text-gray-400">{genre.song_count} songs</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedGenre && (
        <div>
          <button
            className="mb-4 text-green-500 hover:underline"
            onClick={() => setSelectedGenre(null)}
            aria-label="Back to genres"
          >
            Back to Genres
          </button>
          <SongList
            onSelectSong={onSelectSong}
            filterType="genre"
            filterValue={selectedGenre}
          />
        </div>
      )}
    </div>
  );
};

export default GenreList;