import { useMemo } from "react";
import { Play, TrendingUp, Clock, Star, Shuffle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useMusic } from "../hooks/useMusic";

export default function Discover() {
  const { tracks, playHistory, setCurrentTrack, play } = useMusic();

  const recommendations = useMemo(() => {
    // Most played albums
    const albumStats = tracks.reduce((acc, track) => {
      const key = `${track.album}-${track.artist}`;
      if (!acc[key]) {
        acc[key] = {
          album: track.album,
          artist: track.artist,
          albumArt: track.albumArt,
          playCount: 0,
          tracks: []
        };
      }
      acc[key].playCount += track.playCount || 0;
      acc[key].tracks.push(track);
      return acc;
    }, {} as any);

    const topAlbums = Object.values(albumStats)
      .sort((a: any, b: any) => b.playCount - a.playCount)
      .slice(0, 6);

    // Recently added (last 7 days mock)
    const recentlyAdded = tracks
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(-6);

    // Hidden gems (low play count but good tracks)
    const hiddenGems = tracks
      .filter(track => (track.playCount || 0) <= 2)
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    // Top artists
    const artistStats = tracks.reduce((acc, track) => {
      if (!acc[track.artist]) {
        acc[track.artist] = {
          artist: track.artist,
          playCount: 0,
          tracks: 0,
          albumArt: track.albumArt
        };
      }
      acc[track.artist].playCount += track.playCount || 0;
      acc[track.artist].tracks += 1;
      return acc;
    }, {} as any);

    const topArtists = Object.values(artistStats)
      .sort((a: any, b: any) => b.playCount - a.playCount)
      .slice(0, 6);

    return {
      topAlbums,
      recentlyAdded,
      hiddenGems,
      topArtists
    };
  }, [tracks]);

  const playTrack = (track: any) => {
    setCurrentTrack(track);
    play();
  };

  const playAlbumTracks = (albumTracks: any[]) => {
    if (albumTracks.length > 0) {
      playTrack(albumTracks[0]);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-hero rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Discover</span> Your Music
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Explore your collection in new ways. Find hidden gems, rediscover favorites, and see your music from a fresh perspective.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-hover"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Surprise Me
            </Button>
            <Button variant="outline" size="lg">
              <TrendingUp className="w-5 h-5 mr-2" />
              View Stats
            </Button>
          </div>
        </div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-accent rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Most Played Albums */}
      {recommendations.topAlbums.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Most Played Albums</h2>
            <Button variant="ghost">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.topAlbums.map((album: any, index) => (
              <Card 
                key={`${album.album}-${album.artist}`}
                className="group cursor-pointer bg-card hover:bg-card-hover transition-all duration-300 glow-hover"
                onClick={() => playAlbumTracks(album.tracks)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden relative">
                      {album.albumArt ? (
                        <img 
                          src={album.albumArt} 
                          alt={album.album}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{album.album}</h3>
                      <p className="text-muted-foreground truncate">{album.artist}</p>
                      <div className="flex items-center mt-2 text-sm text-accent">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {album.playCount} plays
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added */}
      {recommendations.recentlyAdded.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recently Added</h2>
            <Button variant="ghost">View All</Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.recentlyAdded.map((track) => (
              <Card 
                key={track.id}
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
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-medium text-sm truncate">{track.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Hidden Gems */}
      {recommendations.hiddenGems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Hidden Gems</h2>
              <p className="text-muted-foreground">Tracks you might have missed</p>
            </div>
            <Button variant="ghost">View All</Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.hiddenGems.map((track) => (
              <Card 
                key={track.id}
                className="group cursor-pointer bg-card hover:bg-card-hover transition-all duration-300 glow-hover relative"
                onClick={() => playTrack(track)}
              >
                <CardContent className="p-4">
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 inline mr-1" />
                      Gem
                    </div>
                  </div>
                  <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
                    {track.albumArt ? (
                      <img 
                        src={track.albumArt} 
                        alt={track.album}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-medium text-sm truncate">{track.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Smart Mixes */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Smart Mixes</h2>
            <p className="text-muted-foreground">Curated playlists based on your taste</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="group cursor-pointer bg-gradient-card hover:bg-card-hover transition-all duration-300 glow-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Your Top Hits</h3>
                  <p className="text-muted-foreground text-sm">Most played tracks</p>
                  <p className="text-xs text-accent mt-1">{tracks.filter(t => (t.playCount || 0) > 0).length} tracks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer bg-gradient-card hover:bg-card-hover transition-all duration-300 glow-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Recently Played</h3>
                  <p className="text-muted-foreground text-sm">Your listening history</p>
                  <p className="text-xs text-accent mt-1">{playHistory.length} tracks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer bg-gradient-card hover:bg-card-hover transition-all duration-300 glow-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Shuffle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Discovery Mix</h3>
                  <p className="text-muted-foreground text-sm">Random selections</p>
                  <p className="text-xs text-accent mt-1">{tracks.length} tracks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}