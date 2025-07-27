import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Grid, List, Play, MoreVertical, ListMusic } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { useMusic, useTracks, useSearchTracks, Track } from "../hooks/useMusic";

const PAGE_SIZE = 50; // Number of tracks to fetch per request

export default function Library() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const { setCurrentTrack, play, addToQueue } = useMusic();

  // Fetch initial tracks or search results
  const {
    data: fetchedTracks,
    isLoading: isLoadingTracks,
    isFetching: isFetchingTracks,
    isSuccess: isSuccessTracks,
  } = useTracks(PAGE_SIZE, offset);

  const {
    data: fetchedSearchResults,
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
    isSuccess: isSuccessSearch,
  } = useSearchTracks(searchQuery, PAGE_SIZE, offset);

  const isLoading = searchQuery ? isLoadingSearch : isLoadingTracks;
  const isFetchingNextPage = searchQuery ? isFetchingSearch : isFetchingTracks;

  const observer = useRef<IntersectionObserver>();
  const lastTrackElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setOffset((prevOffset) => prevOffset + PAGE_SIZE);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasMore, setOffset]
  );

  useEffect(() => {
    const dataToProcess = searchQuery ? fetchedSearchResults : fetchedTracks;

    if (isSuccessTracks || isSuccessSearch) {
      if (offset === 0) {
        setAllTracks(dataToProcess || []);
      } else if (dataToProcess) {
        setAllTracks((prevTracks) => [...prevTracks, ...dataToProcess]);
      }
      setHasMore((dataToProcess?.length || 0) === PAGE_SIZE);
    }
  }, [fetchedTracks, fetchedSearchResults, searchQuery, offset, isSuccessTracks, isSuccessSearch]);

  // Reset offset and tracks when search query changes
  useEffect(() => {
    setOffset(0);
    setHasMore(true);
  }, [searchQuery]);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    play();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Library</h1>
          <p className="text-muted-foreground">
            {allTracks.length} tracks in your collection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none border-l"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search your library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {isLoading && allTracks.length === 0 ? (
        <Card className="text-center p-12">
          <div className="text-muted-foreground mb-4">Loading tracks...</div>
        </Card>
      ) : (allTracks.length === 0 && !isLoading && !isFetchingNextPage) ? (
        <Card className="text-center p-12">
          <div className="text-muted-foreground mb-4">
            {searchQuery
              ? "No tracks match your search"
              : "No music in your library yet"}
          </div>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {allTracks.map((track, index) => (
            <Card
              key={track.id}
              className="group cursor-pointer bg-card hover:bg-card-hover transition-all duration-300 glow-hover"
              onClick={() => playTrack(track)}
              ref={index === allTracks.length - 1 ? lastTrackElementRef : null}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
                  {track.albumArt ? (
                    <img
                      src={track.albumArt}
                      alt={track.album}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-medium text-sm truncate mb-1">
                  {track.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {track.artist}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {track.album}
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()} // Prevent card click
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={5} forceMount>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); addToQueue(track); }}>
                      <ListMusic className="w-4 h-4 mr-2" /> Add to Queue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
          {isFetchingNextPage && (
            <Card className="text-center p-4 col-span-full">
              <div className="text-muted-foreground">Loading more...</div>
            </Card>
          )}
          {!hasMore && allTracks.length > 0 && (
            <Card className="text-center p-4 col-span-full">
              <div className="text-muted-foreground">No more tracks.</div>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {allTracks.map((track, index) => (
            <div
              key={track.id}
              className="track-item flex items-center justify-between p-3 rounded-lg hover:bg-track-hover cursor-pointer group"
              onClick={() => playTrack(track)}
              ref={index === allTracks.length - 1 ? lastTrackElementRef : null}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="text-sm text-muted-foreground w-8 text-center">
                  {index + 1}
                </div>

                <div className="w-10 h-10 bg-muted rounded flex-shrink-0 overflow-hidden">
                  {track.albumArt ? (
                    <img
                      src={track.albumArt}
                      alt={track.album}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <Play className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artist}
                  </p>
                </div>

                <div className="hidden md:block flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {track.album}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground">
                  {formatDuration(track.duration)}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()} // Prevent card click
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={5} forceMount>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); addToQueue(track); }}>
                      <ListMusic className="w-4 h-4 mr-2" /> Add to Queue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {isFetchingNextPage && (
            <Card className="text-center p-4 col-span-full">
              <div className="text-muted-foreground">Loading more...</div>
            </Card>
          )}
          {!hasMore && allTracks.length > 0 && (
            <Card className="text-center p-4 col-span-full">
              <div className="text-muted-foreground">No more tracks.</div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}