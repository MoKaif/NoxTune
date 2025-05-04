import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import SongList from './Components/SongList';
import ArtistList from './Components/ArtistList';
import AlbumList from './Components/AlbumList';
import GenreList from './Components/GenreList';
import PlaylistPage from './Components/PlaylistPage';
import MusicPlayer from './Components/MusicPlayer';
import { Song, Playlist } from './Types/types';
import api from './Services/api';

const App: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [songList, setSongList] = useState<Song[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    if (!songList.some((s) => s.id === song.id)) {
      setSongList((prev) => [...prev, song]);
    }
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSongList(playlist.songs);
    if (playlist.songs.length > 0) {
      // Start with a random song for shuffle
      const randomIndex = Math.floor(Math.random() * playlist.songs.length);
      setCurrentSong(playlist.songs[randomIndex]);
    }
  };

  // Update songList based on the current view
  useEffect(() => {
    const updateSongList = async () => {
      const path = window.location.pathname;
      let songs: Song[] = [];
      try {
        if (path === '/') {
          const data = await api.fetchSongs(0, 50);
          songs = data.songs;
        } else if (path === '/playlists') {
          const data = await api.fetchPlaylists();
          const ogPlaylist = data.find((p) => p.name === 'OG Playlist');
          songs = ogPlaylist ? ogPlaylist.songs : [];
        } else if (path.startsWith('/artists')) {
          const artistName = decodeURIComponent(path.split('/')[2] || '');
          if (artistName) {
            const data = await api.fetchSongsByArtist(artistName, 0, 50);
            songs = data.songs;
          }
        } else if (path.startsWith('/albums')) {
          const albumName = decodeURIComponent(path.split('/')[2] || '');
          if (albumName) {
            const data = await api.fetchSongsByAlbum(albumName, 0, 50);
            songs = data.songs;
          }
        } else if (path.startsWith('/genres')) {
          const genreName = decodeURIComponent(path.split('/')[2] || '');
          if (genreName) {
            const data = await api.fetchSongs(0, 50, `genre:${genreName}`);
            songs = data.songs;
          }
        }
        setSongList(songs);
      } catch (error) {
        console.error('Error updating song list:', error);
      }
    };
    updateSongList();
  }, [window.location.pathname]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded"
        onClick={toggleSidebar}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="md:ml-64 p-4">
        <Routes>
          <Route
            path="/"
            element={<SongList onSelectSong={handleSelectSong} />}
          />
          <Route
            path="/artists"
            element={<ArtistList onSelectSong={handleSelectSong} />}
          />
          <Route
            path="/albums"
            element={<AlbumList onSelectSong={handleSelectSong} />}
          />
          <Route
            path="/genres"
            element={<GenreList onSelectSong={handleSelectSong} />}
          />
          <Route
            path="/playlists"
            element={<PlaylistPage onSelectPlaylist={handleSelectPlaylist} onSelectSong={handleSelectSong} />}
          />
          <Route path="/insights" element={<div>Insights (Coming Soon)</div>} />
        </Routes>
      </div>
      <MusicPlayer
        currentSong={currentSong}
        songList={songList}
        onSelectSong={handleSelectSong}
      />
    </div>
  );
};

export default App;