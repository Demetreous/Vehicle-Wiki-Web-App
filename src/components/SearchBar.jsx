import { useState } from 'react';
import './SearchBar.css';
import arrowUp from "../assets/search_arrow.png";

const SearchBar = ({ onSearch, isDarkMode }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query) {
      onSearch(query);
    }
  };

  return (
    <div className="search-bar-container"> {/* Added container for centering */}
      <form onSubmit={handleSubmit} className={`search-form ${isDarkMode ? 'dark-mode' : ''}`}>
        <input
          className={`search-bar ${isDarkMode ? 'dark-mode' : ''}`}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Enter search term"
        />
        <button type="submit" className="search-button">
          <img src={arrowUp} alt="Search" className="search-icon" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
