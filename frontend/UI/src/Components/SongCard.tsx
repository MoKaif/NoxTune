import { Song } from '../Types/types';

interface SongCardProps {
  song: Song;
  onSelect: (song: Song) => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onSelect }) => {
  const fallbackImage = 'https://via.placeholder.com/150?text=🎵';

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition w-full md:w-60"
      onClick={() => onSelect(song)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelect(song)}
      aria-label={`Play ${song.title} by ${song.artist}`}
    >
      <img
        src={song.album_art || fallbackImage}
        alt={`Album art for ${song.title}`}
        className="w-full h-40 object-cover rounded mb-2"
        loading="lazy"
      />
      <h3 className="text-sm font-semibold truncate-ellipsis">{song.title}</h3>
      <p className="text-xs text-gray-400 truncate-ellipsis">{song.artist}</p>
      <p className="text-xs text-gray-400 truncate-ellipsis">{song.album}</p>
      <p className="text-xs text-gray-400">{formatDuration(song.duration)}</p>
    </div>
  );
};

export default SongCard;