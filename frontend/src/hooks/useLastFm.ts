import { useState, useEffect } from 'react';
import { useMusic, Track } from './useMusic';

// Last.fm API configuration
const LASTFM_API_KEY = '92875a57b1ba5bb270443b16ac66ba71';
const LASTFM_SHARED_SECRET = '96617117519a6a13bdb11b7f4c732f25';
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

interface LastFmTrack {
  name: string;
  artist: {
    '#text': string;
  };
  album: {
    '#text': string;
  };
  image?: Array<{
    '#text': string;
    size: string;
  }>;
  playcount: string;
  date?: {
    '#text': string;
    uts: string;
  };
}

interface LastFmArtist {
  name: string;
  playcount: string;
  image?: Array<{
    '#text': string;
    size: string;
  }>;
  albumArt?: string; // New field for album art fallback
}

interface LastFmAlbum {
  name: string;
  artist: {
    name: string;
  };
  playcount: string;
  image?: Array<{
    '#text': string;
    size: string;
  }>;
}

interface LastFmUser {
  name: string;
  realname: string;
  image: Array<{
    '#text': string;
    size: string;
  }>;
  playcount: string;
  country?: string;
  registered?: {
    unixtime: string;
    '#text': string;
    uts: string;
  };
}

interface LastFmTag {
  name: string;
  count: string;
  reach: string;
}

export function useLastFm() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [recentTracks, setRecentTracks] = useState<LastFmTrack[]>([]);
  const [topArtists, setTopArtists] = useState<LastFmArtist[]>([]);
  const [artistTopAlbums, setArtistTopAlbums] = useState<{[key: string]: LastFmAlbum[]}>({});
  const [artistInfo, setArtistInfo] = useState<{[key: string]: any}>({});
  const [topAlbums, setTopAlbums] = useState<LastFmAlbum[]>([]);
  const [topTracks, setTopTracks] = useState<LastFmTrack[]>([]);
  const [chartTopArtists, setChartTopArtists] = useState<LastFmArtist[]>([]);
  const [chartTopTracks, setChartTopTracks] = useState<LastFmTrack[]>([]);
  const [chartTopTags, setChartTopTags] = useState<LastFmTag[]>([]);
  const [userInfo, setUserInfo] = useState<LastFmUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentTrack } = useMusic();

  // Load stored session
  useEffect(() => {
    const storedUsername = localStorage.getItem('lastfm_username');
    const storedSessionKey = localStorage.getItem('lastfm_session_key');
    
    if (storedUsername && storedSessionKey) {
      setUsername(storedUsername);
      setSessionKey(storedSessionKey);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated && username) {
      fetchUserData();
    }
  }, [isAuthenticated, username]);

  const fetchUserData = async () => {
    if (!username) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        fetchRecentTracks(),
        fetchTopArtists(),
        fetchTopAlbums(),
        fetchTopTracks(),
        fetchUserInfo(),
        fetchChartTopArtists(),
        fetchChartTopTracks(),
        fetchChartTopTags()
      ]);
    } catch (error) {
      console.error('Error fetching Last.fm data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentTracks = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `${LASTFM_BASE_URL}?method=user.getrecenttracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=50`
      );
      const data = await response.json();
      
      if (data.recenttracks?.track) {
        setRecentTracks(Array.isArray(data.recenttracks.track) ? data.recenttracks.track : [data.recenttracks.track]);
      }
    } catch (error) {
      console.error('Error fetching recent tracks:', error);
    }
  };

  const fetchTopArtists = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `${LASTFM_BASE_URL}?method=user.gettopartists&user=${username}&api_key=${LASTFM_API_KEY}&format=json&period=overall&limit=10`
      );
      const data = await response.json();
      
      if (data.topartists?.artist) {
        const artistsWithInfo = await Promise.all(
          (Array.isArray(data.topartists.artist) ? data.topartists.artist : [data.topartists.artist]).map(async (artist: LastFmArtist) => {
            const artistInfoResponse = await fetch(
              `${LASTFM_BASE_URL}?method=artist.getinfo&artist=${artist.name}&api_key=${LASTFM_API_KEY}&format=json`
            );
            const artistInfoData = await artistInfoResponse.json();
            let artistImage = undefined;
            if (artistInfoData.artist?.image) {
              artistImage = artistInfoData.artist.image.find((img: any) => img.size === 'medium')?.['#text'] || artistInfoData.artist.image[0]['#text'];
            }
            return { ...artist, image: artistInfoData.artist?.image };
          })
        );
        setTopArtists(artistsWithInfo);
      }
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  };

  const fetchUserInfo = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `${LASTFM_BASE_URL}?method=user.getinfo&user=${username}&api_key=${LASTFM_API_KEY}&format=json`
      );
      const data = await response.json();
      
      if (data.user) {
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchTopAlbums = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `${LASTFM_BASE_URL}?method=user.gettopalbums&user=${username}&api_key=${LASTFM_API_KEY}&format=json&period=overall&limit=10`
      );
      const data = await response.json();
      
      if (data.topalbums?.album) {
        setTopAlbums(Array.isArray(data.topalbums.album) ? data.topalbums.album : [data.topalbums.album]);
      }
    } catch (error) {
      console.error('Error fetching top albums:', error);
    }
  };

  const fetchTopTracks = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `${LASTFM_BASE_URL}?method=user.gettoptracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&period=overall&limit=10`
      );
      const data = await response.json();
      
      if (data.toptracks?.track) {
        setTopTracks(Array.isArray(data.toptracks.track) ? data.toptracks.track : [data.toptracks.track]);
      }
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  };

  const fetchChartTopArtists = async () => {
    try {
      const response = await fetch(
        `${LASTFM_BASE_URL}?method=chart.gettopartists&api_key=${LASTFM_API_KEY}&format=json&limit=10`
      );
      const data = await response.json();
      if (data.artists?.artist) {
        setChartTopArtists(Array.isArray(data.artists.artist) ? data.artists.artist : [data.artists.artist]);
      }
    } catch (error) {
      console.error('Error fetching chart top artists:', error);
    }
  };

  const fetchChartTopTracks = async () => {
    try {
      const response = await fetch(
        `${LASTFM_BASE_URL}?method=chart.gettoptracks&api_key=${LASTFM_API_KEY}&format=json&limit=10`
      );
      const data = await response.json();
      if (data.tracks?.track) {
        setChartTopTracks(Array.isArray(data.tracks.track) ? data.tracks.track : [data.tracks.track]);
      }
    } catch (error) {
      console.error('Error fetching chart top tracks:', error);
    }
  };

  const fetchChartTopTags = async () => {
    try {
      const response = await fetch(
        `${LASTFM_BASE_URL}?method=chart.gettoptags&api_key=${LASTFM_API_KEY}&format=json&limit=10`
      );
      const data = await response.json();
      if (data.tags?.tag) {
        setChartTopTags(Array.isArray(data.tags.tag) ? data.tags.tag : [data.tags.tag]);
      }
    } catch (error) {
      console.error('Error fetching chart top tags:', error);
    }
  };

  const scrobbleTrack = async (track: Track, timestamp?: number) => {
    if (!sessionKey || !isAuthenticated) {
      console.warn('Not authenticated with Last.fm');
      return;
    }

    try {
      const params = {
        method: 'track.scrobble',
        api_key: LASTFM_API_KEY,
        sk: sessionKey,
        'track[0]': track.title,
        'artist[0]': track.artist,
        'album[0]': track.album,
        'timestamp[0]': timestamp ? timestamp.toString() : Math.floor(Date.now() / 1000).toString(),
      };

      // In a real implementation, you would need to sign this request
      // For now, we'll just log it
      console.log('Would scrobble track:', params);
    } catch (error) {
      console.error('Error scrobbling track:', error);
    }
  };

  const updateNowPlaying = async (track: Track) => {
    if (!sessionKey || !isAuthenticated) {
      console.warn('Not authenticated with Last.fm');
      return;
    }

    try {
      const params = {
        method: 'track.updateNowPlaying',
        api_key: LASTFM_API_KEY,
        sk: sessionKey,
        track: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration.toString(),
      };

      // In a real implementation, you would need to sign this request
      console.log('Would update now playing:', params);
    } catch (error) {
      console.error('Error updating now playing:', error);
    }
  };

  const connectLastFm = (userUsername: string) => {
    // Simplified authentication - in reality, you'd need OAuth flow
    setUsername(userUsername);
    setIsAuthenticated(true);
    localStorage.setItem('lastfm_username', userUsername);
    
    // Mock session key for demo
    const mockSessionKey = 'demo_session_key';
    setSessionKey(mockSessionKey);
    localStorage.setItem('lastfm_session_key', mockSessionKey);
  };

  const disconnectLastFm = () => {
    setUsername(null);
    setSessionKey(null);
    setIsAuthenticated(false);
    setRecentTracks([]);
    setTopArtists([]);
    setUserInfo(null);
    localStorage.removeItem('lastfm_username');
    localStorage.removeItem('lastfm_session_key');
  };

  // Auto-scrobble current track after 30 seconds or 50% completion
  useEffect(() => {
    if (!currentTrack || !isAuthenticated) return;

    updateNowPlaying(currentTrack);

    const scrobbleTime = Math.min(30000, currentTrack.duration * 500); // 30s or 50% of track
    const timer = setTimeout(() => {
      scrobbleTrack(currentTrack);
    }, scrobbleTime);

    return () => clearTimeout(timer);
  }, [currentTrack, isAuthenticated]);

  return {
    isAuthenticated,
    username,
    userInfo,
    recentTracks,
    topArtists,
    topAlbums,
    topTracks,
    chartTopArtists,
    chartTopTracks,
    chartTopTags,
    isLoading,
    connectLastFm,
    disconnectLastFm,
    scrobbleTrack,
    updateNowPlaying,
    fetchUserData
  };
}