// /frontend/src/pages/Home.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import SongCard from "../Components/SongCard";

const Home: React.FC = () => {
  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios.get(`/songs?skip=${(page - 1) * 50}&limit=50`)
      .then((response) => {
        setSongs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching songs:", error);
      });
  }, [page]);

  return (
    <div>
      <div className="song-list">
        {songs.map((song: any) => (
          <SongCard key={song.id} {...song} />
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => setPage((prev) => prev - 1)} disabled={page === 1}>Previous</button>
        <span>Page {page}</span>
        <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Home;
