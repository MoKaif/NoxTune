interface Song {
  title: string;
  artist: string;
  album: string;
}

interface SongItemProps {
  song: Song;
}

const SongItem: React.FC<SongItemProps> = ({ song }) => {
  return (
    <li className="song-item p-2 bg-gray-700 rounded mb-2">
      <h3 className="text-lg">{song.title}</h3>
      <p>{song.artist} - {song.album}</p>
    </li>
  );
};

export default SongItem;
