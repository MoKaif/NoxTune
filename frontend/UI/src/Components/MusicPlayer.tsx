import { useRef, useState, useEffect } from 'react';
import api from '../Services/api';
import { Song } from '../Types/types';

interface MusicPlayerProps {
  currentSong: Song | null;
  songList: Song[];
  onSelectSong: (song: Song) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentSong, songList, onSelectSong }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);1
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);

  useEffect(() => {
    // Update queue when songList changes
    setQueue(songList);
  }, [songList]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = api.getStreamUrl(currentSong.id);
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [currentSong]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || currentSong?.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const handleEnded = () => {
    if (isRepeat) {
      audioRef.current?.play();
    } else if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * queue.length);
      onSelectSong(queue[nextIndex]);
    } else {
      const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
      if (currentIndex < queue.length - 1) {
        onSelectSong(queue[currentIndex + 1]);
      } else {
        setIsPlaying(false); // Stop playback at end of queue
      }
    }
  };

  const playPrevious = () => {
    const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
    if (currentIndex > 0) {
      onSelectSong(queue[currentIndex - 1]);
    }
  };

  const playNext = () => {
    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * queue.length);
      onSelectSong(queue[nextIndex]);
    } else {
      const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
      if (currentIndex < queue.length - 1) {
        onSelectSong(queue[currentIndex + 1]);
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-bar bg-gray-800 p-4 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 transition-all duration-300">
      {currentSong && (
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative">
            <img
              src={currentSong.album_art || 'https://via.placeholder.com/64?text=🎵'}
              alt={`Album art for ${currentSong.title}`}
              className="w-16 h-16 rounded transform transition-transform duration-300 hover:scale-105"
            />
            <svg className="absolute inset-0 w-16 h-16" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="green"
                strokeWidth="4"
                strokeDasharray={`${progressPercentage * 3.14} 314`}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate-ellipsis">{currentSong.title}</p>
            <p className="text-xs text-gray-400 truncate-ellipsis">{currentSong.artist}</p>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col items-center space-y-2 w-full md:w-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`text-gray-400 hover:text-white ${isShuffle ? 'text-green-500' : ''}`}
            aria-label="Toggle shuffle"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 12v-4m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          <button
            onClick={playPrevious}
            disabled={!currentSong || queue.findIndex((s) => s.id === currentSong?.id) === 0}
            aria-label="Previous song"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={togglePlay}
            className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              {isPlaying ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          </button>
          <button
            onClick={playNext}
            disabled={!currentSong || queue.findIndex((s) => s.id === currentSong?.id) === queue.length - 1}
            aria-label="Next song"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16" />
            </svg>
          </button>
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`text-gray-400 hover:text-white ${isRepeat ? 'text-green-500' : ''}`}
            aria-label="Toggle repeat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5m-5 6v5h5m10-10h-5m5 6h-5" />
            </svg>
          </button>
        </div>
        <div className="flex items-center w-full space-x-2">
          <span className="text-xs">{formatDuration(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1"
            aria-label="Seek"
          />
          <span className="text-xs">{formatDuration(duration)}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => setShowQueue(!showQueue)} aria-label="Toggle queue">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h7" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            className="w-20"
            aria-label="Volume"
          />
        </div>
      </div>
      {showQueue && (
        <div className="absolute bottom-20 left-0 right-0 bg-gray-700 p-4 max-h-64 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Queue</h3>
          {queue.length === 0 && <p className="text-gray-400">No songs in queue.</p>}
          {queue.map((song) => (
            <div
              key={song.id}
              className={`p-2 hover:bg-gray-600 cursor-pointer ${song.id === currentSong?.id ? 'bg-gray-600' : ''}`}
              onClick={() => onSelectSong(song)}
            >
              <p className="text-sm">{song.title} - {song.artist}</p>
            </div>
          ))}
        </div>
      )}
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />
    </div>
  );
};

export default MusicPlayer;