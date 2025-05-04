import { useState, useEffect } from 'react';
import api from '../Services/api';
import SongCard from './SongCard';
import { Playlist, Song } from '../Types/types';

interface PlaylistPageProps {
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectSong: (song: Song) => void;
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({ onSelectPlaylist, onSelectSong }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [editPlaylistId, setEditPlaylistId] = useState<number | null>(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');

  const fetchWithRetry = async (fn: () => Promise<any>, retries: number = 3, delay: number = 2000): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        console.warn(`Retry ${i + 1}/${retries} after error: ${err}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch playlists with retry
        const playlistData = await fetchWithRetry(() => api.fetchPlaylists());
        console.log('Setting playlists:', playlistData);
        setPlaylists(playlistData);
        // Set OG Playlist as default
        const ogPlaylist = playlistData.find((p) => p.name === 'OG Playlist');
        console.log('OG Playlist found:', ogPlaylist);
        if (ogPlaylist) {
          setSelectedPlaylist(ogPlaylist);
          onSelectPlaylist(ogPlaylist);
        }
        // Fetch all songs for adding to playlists
        const songData = await fetchWithRetry(() => api.fetchSongs(0, 1000));
        console.log('Fetched songs:', songData.songs);
        setAllSongs(songData.songs);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load playlists or songs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError('Playlist name is required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newPlaylist = await api.createPlaylist(newPlaylistName, []);
      setPlaylists((prev) => [...prev, newPlaylist]);
      setNewPlaylistName('');
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError('Failed to create playlist. Name may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSongs = async (playlistId: number) => {
    if (selectedSongIds.length === 0) {
      setError('No songs selected.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log('Selected song IDs:', selectedSongIds);
      const updatedPlaylist = await api.addSongsToPlaylist(playlistId, selectedSongIds);
      console.log('Updated playlist:', updatedPlaylist);
      setPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? updatedPlaylist : p))
      );
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(updatedPlaylist);
      }
      setSelectedSongIds([]);
    } catch (error) {
      console.error('Error adding songs:', error);
      setError('Failed to add songs to playlist. Please check if songs exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPlaylist = async (playlistId: number) => {
    if (!editPlaylistName.trim()) {
      setError('Playlist name is required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const updatedPlaylist = await api.renamePlaylist(playlistId, editPlaylistName);
      setPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? updatedPlaylist : p))
      );
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(updatedPlaylist);
      }
      setEditPlaylistId(null);
      setEditPlaylistName('');
    } catch (error) {
      console.error('Error renaming playlist:', error);
      setError('Failed to rename playlist. Name may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deletePlaylist(playlistId);
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setError('Failed to delete playlist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {isLoading && <p className="text-center text-gray-400">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!isLoading && !error && !selectedPlaylist && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Playlists</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Create New Playlist</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Playlist name"
                className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                aria-label="New playlist name"
              />
              <button
                onClick={handleCreatePlaylist}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                aria-label="Create playlist"
              >
                Create
              </button>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">User-Created Playlists</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {playlists
              .filter((playlist) => playlist.is_user_created)
              .map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition relative"
                  onClick={() => {
                    setSelectedPlaylist(playlist);
                    onSelectPlaylist(playlist);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && setSelectedPlaylist(playlist) && onSelectPlaylist(playlist)}
                  aria-label={`Play ${playlist.name}`}
                >
                  <img
                    src={playlist.songs[0]?.album_art || 'https://via.placeholder.com/150?text=🎵'}
                    alt={`${playlist.name} cover`}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h3 className="text-sm font-semibold">{playlist.name}</h3>
                  <p className="text-xs text-gray-400">{playlist.song_count} songs</p>
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPlaylistId(playlist.id);
                        setEditPlaylistName(playlist.name);
                      }}
                      className="text-gray-400 hover:text-white"
                      aria-label={`Edit ${playlist.name}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                      aria-label={`Delete ${playlist.name}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <h3 className="text-xl font-semibold mb-2">Recommended Playlists</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists
              .filter((playlist) => !playlist.is_user_created)
              .map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
                  onClick={() => {
                    setSelectedPlaylist(playlist);
                    onSelectPlaylist(playlist);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && setSelectedPlaylist(playlist) && onSelectPlaylist(playlist)}
                  aria-label={`Play ${playlist.name}`}
                >
                  <img
                    src={playlist.songs[0]?.album_art || 'https://via.placeholder.com/150?text=🎵'}
                    alt={`${playlist.name} cover`}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h3 className="text-sm font-semibold">{playlist.name}</h3>
                  <p className="text-xs text-gray-400">{playlist.song_count} songs</p>
                </div>
              ))}
          </div>
        </div>
      )}
      {selectedPlaylist && (
        <div>
          <button
            className="mb-4 text-green-500 hover:underline"
            onClick={() => {
              setSelectedPlaylist(null);
              const ogPlaylist = playlists.find((p) => p.name === 'OG Playlist');
              if (ogPlaylist) {
                setSelectedPlaylist(ogPlaylist);
                onSelectPlaylist(ogPlaylist);
              }
            }}
            aria-label="Back to playlists"
          >
            Back to Playlists
          </button>
          <h2 className="text-2xl font-bold mb-4">{selectedPlaylist.name}</h2>
          {selectedPlaylist.is_user_created && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Add Songs to Playlist</h3>
              <select
                multiple
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500 max-h-40 overflow-y-auto"
                value={selectedSongIds.map(String)}
                onChange={(e) =>
                  setSelectedSongIds(Array.from(e.target.selectedOptions, (option) => Number(option.value)))
                }
                aria-label="Select songs to add"
              >
                {allSongs
                  .filter((song) => !selectedPlaylist.songs.some((s) => s.id === song.id))
                  .map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.title} - {song.artist}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => handleAddSongs(selectedPlaylist.id)}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                aria-label="Add selected songs"
              >
                Add Songs
              </button>
            </div>
          )}
          {selectedPlaylist.songs.length === 0 && (
            <p className="text-center text-gray-400">No songs in this playlist.</p>
          )}
          {selectedPlaylist.songs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedPlaylist.songs.map((song) => (
                <SongCard key={song.id} song={song} onSelect={onSelectSong} />
              ))}
            </div>
          )}
        </div>
      )}
      {editPlaylistId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Edit Playlist</h3>
            <input
              type="text"
              placeholder="New playlist name"
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
              value={editPlaylistName}
              onChange={(e) => setEditPlaylistName(e.target.value)}
              aria-label="Edit playlist name"
            />
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleEditPlaylist(editPlaylistId)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                aria-label="Save changes"
              >
                Save
              </button>
              <button
                onClick={() => setEditPlaylistId(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;