
interface Song {
  title: string;
  artist: string;
  album: string;
  playing: boolean;
}

interface AudioPlayerProps {
  currentSong: Song | null;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ currentSong, onPlayPause, onNext, onPrevious }) => {
  return (
    <div className="audio-player p-4 bg-gray-800 text-white rounded-md flex justify-between items-center">
      <div>
        <h3 className="text-xl">{currentSong?.title || 'No song selected'}</h3>
        <p>{currentSong?.artist}</p>
      </div>
      <div className="controls flex items-center space-x-4">
        <button onClick={onPrevious} className="text-lg">Prev</button>
        <button onClick={onPlayPause} className="text-lg">{currentSong?.playing ? 'Pause' : 'Play'}</button>
        <button onClick={onNext} className="text-lg">Next</button>
      </div>
    </div>
  );
};

export default AudioPlayer;
