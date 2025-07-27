import { useMusic } from "../../hooks/useMusic";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Play, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function MusicQueue() {
  const { queue, currentTrack, setCurrentTrack, play, removeTrack, currentIndex } = useMusic();

  const handlePlayTrack = (trackId: string) => {
    const trackToPlay = queue.find(track => track.id === trackId);
    if (trackToPlay) {
      setCurrentTrack(trackToPlay);
      play();
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    removeTrack(trackId); // This removes from the main tracks list, not just the queue
    // Need a specific remove from queue action in useMusic
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Up Next</h2>
      {queue.length === 0 ? (
        <p className="text-muted-foreground">Queue is empty. Add some songs!</p>
      ) : (
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {queue.map((track, index) => (
              <div
                key={track.id}
                className={cn(
                  "flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer group",
                  currentTrack?.id === track.id && "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden mr-3">
                  {track.albumArt ? (
                    <img src={track.albumArt} alt={track.album} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Play className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveTrack(track.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}