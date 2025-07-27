import { useEffect, useRef, useState } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Heart
} from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { MusicQueue } from "./MusicQueue";
import { ListMusic } from "lucide-react";
import { Slider } from "../ui/slider";
import { cn } from "../../lib/utils";
import { Track, useMusic } from "../../hooks/useMusic";

interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  className?: string;
  isQueueOpen: boolean;
  setIsQueueOpen: (isOpen: boolean) => void;
}

export function MusicPlayer({ track, isPlaying, className, isQueueOpen, setIsQueueOpen }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const { 
    play, 
    pause, 
    nextTrack, 
    previousTrack, 
    setCurrentTime: setGlobalTime,
    setVolume: setGlobalVolume,
    isRepeat,
    toggleRepeat,
    isShuffle,
    toggleShuffle,
  } = useMusic();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = track.filePath;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [track.filePath, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      setGlobalTime(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const time = value[0];
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      setGlobalTime(time);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setGlobalVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      nextTrack();
    }
  };

  return (
    <div className={cn("p-4 bg-player-bg border-t border-border", className)}>
      <audio
        ref={audioRef}
        src={track.filePath}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <div className="flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
            {track.albumArt ? (
              <img 
                src={track.albumArt} 
                alt={track.album}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{track.title}</p>
            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
          </div>
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          {/* Control Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShuffle}
              className={cn(
                "text-muted-foreground hover:text-foreground",
                isShuffle && "text-primary"
              )}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={previousTrack}
              className="text-foreground"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={isPlaying ? pause : play}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-10 h-10 rounded-full glow"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTrack}
              className="text-foreground"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRepeat}
              className={cn(
                "text-muted-foreground hover:text-foreground",
                isRepeat && "text-primary"
              )}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
          <Sheet open={isQueueOpen} onOpenChange={setIsQueueOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open Queue"
              >
                <ListMusic className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96 flex flex-col">
              <SheetHeader>
                <SheetTitle>Queue</SheetTitle>
              </SheetHeader>
              <MusicQueue />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}