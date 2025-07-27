import { BarChart3, TrendingUp, Clock, Music, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useMusic } from "../hooks/useMusic";
import { useMemo } from "react";

export default function Reports() {
  const { tracks, playHistory } = useMusic();

  const stats = useMemo(() => {
    const totalPlayTime = tracks.reduce((sum, track) => sum + (track.duration * (track.playCount || 0)), 0);
    
    const artistStats = tracks.reduce((acc, track) => {
      if (!acc[track.artist]) {
        acc[track.artist] = { plays: 0, tracks: 0 };
      }
      acc[track.artist].plays += track.playCount || 0;
      acc[track.artist].tracks += 1;
      return acc;
    }, {} as Record<string, { plays: number; tracks: number }>);

    const topArtists = Object.entries(artistStats)
      .sort(([, a], [, b]) => b.plays - a.plays)
      .slice(0, 10);

    const topTracks = tracks
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 10);

    const genreStats = tracks.reduce((acc, track) => {
      const genre = track.genre || "Unknown";
      acc[genre] = (acc[genre] || 0) + (track.playCount || 0);
      return acc;
    }, {} as Record<string, number>);

    const topGenres = Object.entries(genreStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalTracks: tracks.length,
      totalPlays: tracks.reduce((sum, track) => sum + (track.playCount || 0), 0),
      totalPlayTime,
      uniqueArtists: Object.keys(artistStats).length,
      topArtists,
      topTracks,
      topGenres,
      averagePlayCount: tracks.length > 0 ? tracks.reduce((sum, track) => sum + (track.playCount || 0), 0) / tracks.length : 0
    };
  }, [tracks]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Music Reports</h1>
        <p className="text-muted-foreground">Insights about your listening habits</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card hover:bg-card-hover transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTracks}</div>
            <p className="text-xs text-muted-foreground">in your library</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-card-hover transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlays.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              avg {stats.averagePlayCount.toFixed(1)} per track
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-card-hover transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listening Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalPlayTime)}</div>
            <p className="text-xs text-muted-foreground">total played</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-card-hover transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueArtists}</div>
            <p className="text-xs text-muted-foreground">unique artists</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Artists */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Artists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topArtists.map(([artist, data], index) => (
                <div key={artist} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{artist}</p>
                      <p className="text-sm text-muted-foreground">{data.tracks} tracks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{data.plays}</p>
                    <p className="text-sm text-muted-foreground">plays</p>
                  </div>
                </div>
              ))}
              {stats.topArtists.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Tracks */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Top Tracks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topTracks.map((track, index) => (
                <div key={track.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{track.playCount || 0}</p>
                    <p className="text-sm text-muted-foreground">plays</p>
                  </div>
                </div>
              ))}
              {stats.topTracks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Genres */}
      {stats.topGenres.length > 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Genres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.topGenres.map(([genre, plays]) => (
                <div key={genre} className="bg-muted rounded-lg p-4 text-center">
                  <p className="font-medium text-sm truncate">{genre}</p>
                  <p className="text-2xl font-bold text-primary">{plays}</p>
                  <p className="text-xs text-muted-foreground">plays</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}