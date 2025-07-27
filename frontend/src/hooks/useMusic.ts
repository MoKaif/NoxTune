// Backend integration: fetch tracks from FastAPI
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const API_URL = "http://localhost:8000";

const fetchTracks = async () => {
  const res = await fetch(`${API_URL}/tracks?limit=50&offset=0`);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await res.json();
  return data.map((track: any) => ({
    id: track.song_id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    duration: track.duration,
    filePath: `${API_URL}/tracks/${track.song_id}/audio`,
    albumArt: track.album_art
      ? `data:image/jpeg;base64,${track.album_art}`
      : undefined,
    genre: track.genre,
    year: track.year,
  }));
};

export const useTracks = (limit: number, offset: number) => {
  return useQuery({
    queryKey: ["tracks", limit, offset],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/tracks?limit=${limit}&offset=${offset}`);
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      return data.map((track: any) => ({
        id: track.song_id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        filePath: `${API_URL}/tracks/${track.song_id}/audio`,
        albumArt: track.album_art
          ? `data:image/jpeg;base64,${track.album_art}`
          : undefined,
        genre: track.genre,
        year: track.year,
      }));
    },
    refetchOnMount: true,
    
  });
};

export const useSearchTracks = (query: string, limit: number, offset: number) => {
  return useQuery({
    queryKey: ["tracks", query, limit, offset],
    queryFn: async () => {
      if (!query) return [];
      const res = await fetch(`${API_URL}/search?q=${query}&limit=${limit}&offset=${offset}`);
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      return data.map((track: any) => ({
        id: track.song_id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        filePath: `${API_URL}/tracks/${track.song_id}/audio`,
        albumArt: track.album_art
          ? `data:image/jpeg;base64,${track.album_art}`
          : undefined,
        genre: track.genre,
        year: track.year,
      }));
    },
    enabled: !!query,
  });
};
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  filePath: string;
  albumArt?: string;
  genre?: string;
  year?: number;
  playCount?: number;
  lastPlayed?: Date;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}

interface MusicState {
  // Current playback
  currentTrack: Track | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;

  // Library
  tracks: Track[];
  playlists: Playlist[];

  // Queue
  queue: Track[];
  currentIndex: number;

  // History
  playHistory: Track[];

  // Actions
  setCurrentTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  addTrack: (track: Track) => void;
  addTracks: (tracks: Track[]) => void;
  removeTrack: (id: string) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  updatePlayCount: (trackId: string) => void;
  addToHistory: (track: Track) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export const useMusic = create<MusicState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTrack: null,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      volume: 0.8,
      isShuffle: false,
      isRepeat: false,
      tracks: [],
      playlists: [],
      queue: [],
      currentIndex: 0,
      playHistory: [],

      // Actions
      setCurrentTrack: (track) => {
        set({
          currentTrack: track,
          currentTime: 0,
        });
        get().addToHistory(track);
        get().updatePlayCount(track.id);
      },

      play: () => set({ isPlaying: true, isPaused: false }),
      pause: () => set({ isPlaying: false, isPaused: true }),
      stop: () => set({ isPlaying: false, isPaused: false, currentTime: 0 }),

      setCurrentTime: (time) => set({ currentTime: time }),
      setVolume: (volume) => set({ volume }),

      addTrack: (track) => {
        const { tracks } = get();
        if (!tracks.find((t) => t.id === track.id)) {
          set({ tracks: [...tracks, track] });
        }
      },

      addTracks: (newTracks) => {
        const { tracks } = get();
        const uniqueTracks = newTracks.filter(
          (newTrack) => !tracks.find((t) => t.id === newTrack.id)
        );
        set({ tracks: [...tracks, ...uniqueTracks] });
      },

      removeTrack: (id) => {
        const { tracks } = get();
        set({ tracks: tracks.filter((t) => t.id !== id) });
      },

      addToQueue: (track) => {
        const { queue } = get();
        set({ queue: [...queue, track] });
      },

      removeFromQueue: (trackId) => {
        const { queue, currentIndex, currentTrack } = get();
        const newQueue = queue.filter((t) => t.id !== trackId);
        let newIndex = currentIndex;

        // Adjust currentIndex if the removed track was before the current track
        if (currentIndex > 0 && queue.findIndex(t => t.id === trackId) < currentIndex) {
          newIndex = currentIndex - 1;
        }
        
        // If the current track is removed, set currentTrack to null or next in queue
        if (currentTrack && currentTrack.id === trackId) {
          set({ currentTrack: null, isPlaying: false, isPaused: false });
        }

        set({ queue: newQueue, currentIndex: newIndex });
      },

      clearQueue: () => set({ queue: [], currentIndex: 0 }),

      nextTrack: () => {
        const { queue, currentIndex, isRepeat, isShuffle } = get();
        if (isRepeat) {
          get().setCurrentTrack(queue[currentIndex]);
          return;
        }
        if (isShuffle) {
          const availableTracks = queue.filter((_, index) => index !== currentIndex);
          if (availableTracks.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableTracks.length);
            const nextTrack = availableTracks[randomIndex];
            const nextIndex = queue.findIndex(t => t.id === nextTrack.id);
            set({ currentIndex: nextIndex });
            get().setCurrentTrack(nextTrack);
          }
          return;
        }
        if (currentIndex < queue.length - 1) {
          const nextIndex = currentIndex + 1;
          set({ currentIndex: nextIndex });
          get().setCurrentTrack(queue[nextIndex]);
        }
      },

      previousTrack: () => {
        const { queue, currentIndex, isShuffle } = get();
        if (isShuffle) {
          const availableTracks = queue.filter((_, index) => index !== currentIndex);
          if (availableTracks.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableTracks.length);
            const prevTrack = availableTracks[randomIndex];
            const prevIndex = queue.findIndex(t => t.id === prevTrack.id);
            set({ currentIndex: prevIndex });
            get().setCurrentTrack(prevTrack);
          }
          return;
        }
        if (currentIndex > 0) {
          const prevIndex = currentIndex - 1;
          set({ currentIndex: prevIndex });
          get().setCurrentTrack(queue[prevIndex]);
        }
      },

      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),

      createPlaylist: (name) => {
        const newPlaylist: Playlist = {
          id: Date.now().toString(),
          name,
          tracks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const { playlists } = get();
        set({ playlists: [...playlists, newPlaylist] });
      },

      addToPlaylist: (playlistId, track) => {
        const { playlists } = get();
        const updatedPlaylists = playlists.map((playlist) => {
          if (playlist.id === playlistId) {
            return {
              ...playlist,
              tracks: [...playlist.tracks, track],
              updatedAt: new Date(),
            };
          }
          return playlist;
        });
        set({ playlists: updatedPlaylists });
      },

      removeFromPlaylist: (playlistId, trackId) => {
        const { playlists } = get();
        const updatedPlaylists = playlists.map((playlist) => {
          if (playlist.id === playlistId) {
            return {
              ...playlist,
              tracks: playlist.tracks.filter((t) => t.id !== trackId),
              updatedAt: new Date(),
            };
          }
          return playlist;
        });
        set({ playlists: updatedPlaylists });
      },

      updatePlayCount: (trackId) => {
        const { tracks } = get();
        const updatedTracks = tracks.map((track) => {
          if (track.id === trackId) {
            return {
              ...track,
              playCount: (track.playCount || 0) + 1,
              lastPlayed: new Date(),
            };
          }
          return track;
        });
        set({ tracks: updatedTracks });
      },

      addToHistory: (track) => {
        const { playHistory } = get();
        const updatedHistory = [
          track,
          ...playHistory.filter((t) => t.id !== track.id),
        ].slice(0, 100);
        set({ playHistory: updatedHistory });
      },
    }),
    {
      name: "noxtunes-music-storage",
      partialize: (state) => ({
        tracks: state.tracks,
        playlists: state.playlists,
        playHistory: state.playHistory,
        volume: state.volume,
      }),
    }
  )
);
