import { useLastFm } from '@/hooks/useLastFm';
import { LastFmConnect } from '@/components/lastfm/LastFmConnect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Music2, ExternalLink, Youtube, Music } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LastFm() {
  const {
    isAuthenticated,
    username,
    recentTracks,
    topArtists,
    topAlbums,
    topTracks,
    userInfo,
    isLoading,
  } = useLastFm();

  

  if (!isAuthenticated) {
    return (
      <div className="space-y-6 px-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Last.fm Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your Last.fm account to see your listening history and stats
          </p>
        </div>
        <LastFmConnect />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ml-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Last.fm Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Connected as <span className="font-medium text-foreground">{username}</span>
          </p>
        </div>
        
      </div>

      {/* User Info Card */}
      {userInfo && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={userInfo.image && Array.isArray(userInfo.image) ? userInfo.image.find(img => img.size === 'large')?.['#text'] : ''} 
                  alt={userInfo.name} 
                />
                <AvatarFallback>{userInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold col-span-2">{userInfo.name}</h3>
                <p className="text-sm text-muted-foreground">Total Plays: {userInfo.playcount}</p>
                <p className="text-sm text-muted-foreground">Real Name: {userInfo.realname || 'Not provided'}</p>
                {userInfo.country && <p className="text-sm text-muted-foreground">Country: {userInfo.country}</p>}
                {userInfo.registered && <p className="text-sm text-muted-foreground">Registered: {new Date(parseInt(userInfo.registered.uts) * 1000).toLocaleDateString()}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tracks */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recently Played
          </CardTitle>
          <CardDescription>
            Your latest listening activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentTracks.length > 0 ? (
            <div className="space-y-4">
              {recentTracks.slice(0, 5).map((track, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {track.image && track.image.length > 0 ? (
                      <img 
                        src={track.image.find(img => img.size === 'medium')?.['#text'] || track.image[0]['#text']} 
                        alt={`${track.name} album art`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{track.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{track.artist['#text']}</p>
                    {track.album && (
                      <p className="text-xs text-muted-foreground truncate">{track.album['#text']}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {!track.date ? (
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        Now Playing
                      </Badge>
                    ) : (
                      track.date['#text']
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent tracks found</p>
          )}
        </CardContent>
      </Card>

      {/* Top Artists */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            Top Artists
          </CardTitle>
          <CardDescription>
            Your most played artists of all time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : topArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topArtists.map((artist, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {artist.image && artist.image.length > 0 ? (
                      <img 
                        src={artist.image.find(img => img.size === 'medium')?.['#text'] || artist.image[0]['#text']} 
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{artist.name}</h4>
                    <p className="text-sm text-muted-foreground">{artist.playcount} plays</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a 
                      href={`https://www.last.fm/music/${encodeURIComponent(artist.name)}`} 
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
            <p className="text-muted-foreground">No top artists data available</p>
          )}
        </CardContent>
      </Card>
    {/* Top Albums */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            Top Albums
          </CardTitle>
          <CardDescription>
            Your most played albums of all time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : topAlbums.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topAlbums.map((album, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {album.image && album.image.length > 0 ? (
                      <img 
                        src={album.image.find(img => img.size === 'medium')?.['#text'] || album.image[0]['#text']} 
                        alt={album.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{album.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{album.artist.name}</p>
                    <p className="text-xs text-muted-foreground">{album.playcount} plays</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a 
                      href={`https://www.last.fm/music/${encodeURIComponent(album.artist.name)}/${encodeURIComponent(album.name)}`} 
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
            <p className="text-muted-foreground">No top albums data available</p>
          )}
        </CardContent>
      </Card>

      {/* Top Tracks */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            Top Tracks
          </CardTitle>
          <CardDescription>
            Your most played tracks of all time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : topTracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topTracks.map((track, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {track.image && track.image.length > 0 ? (
                      <img 
                        src={track.image.find(img => img.size === 'medium')?.['#text'] || track.image[0]['#text']} 
                        alt={track.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{track.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{track.artist['#text']}</p>
                    <p className="text-xs text-muted-foreground">{track.playcount} plays</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a 
                      href={`https://www.last.fm/music/${encodeURIComponent(track.artist['#text'])}/_/${encodeURIComponent(track.name)}`} 
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
            <p className="text-muted-foreground">No top tracks data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}