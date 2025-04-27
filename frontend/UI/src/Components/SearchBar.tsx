import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, onSearch]);

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search by title, artist, or album..."
        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search songs"
      />
    </div>
  );
};

export default SearchBar;