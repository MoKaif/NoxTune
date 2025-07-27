import { Upload, Play, TrendingUp, Clock, Music } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { useMusic } from "../hooks/useMusic";
import { LastFmConnect } from "../components/lastfm/LastFmConnect";
import { useLastFm } from "../hooks/useLastFm";
import { ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

export default function Home() {
  const { tracks, playHistory, currentTrack, setCurrentTrack, play } =
    useMusic();
  const {
    isAuthenticated,
    chartTopArtists,
    chartTopTracks,
    chartTopTags,
    isLoading,
  } = useLastFm();

  const recentTracks = playHistory.slice(0, 6);
  const topTracks = tracks
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 6);

  const playTrack = (track: any) => {
    setCurrentTrack(track);
    play();
  };

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-hero rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center glow">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Welcome to <span className="gradient-text">NoxTunes</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Experience your music like never before. Upload your collection and
            discover the premium listening experience.
          </p>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Recently Played */}
      {recentTracks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentTracks.map((track, index) => (
              <Card
                key={`${track.id}-${index}`}
                className="group cursor-pointer bg-card hover:bg-card-hover transition-all duration-300 glow-hover"
                onClick={() => playTrack(track)}
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
                        <Music className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-medium text-sm truncate">
                    {track.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artist}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Last.fm Global Charts</h2>

          {/* Top Artists Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Top Artists</CardTitle>
              <CardDescription>
                Globally popular artists on Last.fm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : chartTopArtists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chartTopArtists.map((artist, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {artist.image && artist.image.length > 0 ? (
                          <img
                            src={
                              artist.image.find(
                                (img) => img.size === "medium"
                              )?.["#text"] || artist.image[0]["#text"]
                            }
                            alt={artist.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {artist.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {parseInt(artist.listeners).toLocaleString()}{" "}
                          listeners
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={artist.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No top artists data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Tracks Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Top Tracks</CardTitle>
              <CardDescription>
                Globally popular tracks on Last.fm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : chartTopTracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chartTopTracks.map((track, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {track.image && track.image.length > 0 ? (
                          <img
                            src={
                              track.image.find(
                                (img) => img.size === "medium"
                              )?.["#text"] || track.image[0]["#text"]
                            }
                            alt={track.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {track.name}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {parseInt(track.listeners).toLocaleString()} listeners
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={track.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No top tracks data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Tags Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Top Tags</CardTitle>
              <CardDescription>
                Globally popular tags on Last.fm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : chartTopTags.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chartTopTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {tag.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {parseInt(tag.reach).toLocaleString()} reach
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://www.last.fm/tag/${encodeURIComponent(
                            tag.name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No top tags data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Last.fm Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Empty State */}
          {tracks.length === 0 && (
            <Card className="text-center p-12 bg-gradient-card">
              <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Music className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Your library is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Add music to your library to start building your premium
                collection
              </p>
            </Card>
          )}
        </div>

        <div>
          <LastFmConnect />
        </div>
      </div>
    </div>
  );
}
