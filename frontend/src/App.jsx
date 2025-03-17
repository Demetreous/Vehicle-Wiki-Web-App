import { useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import SettingsMenu from "./components/SettingsMenu";
import carLogo from "./assets/car_logo.png";

function App() {
  const [indexType, setIndexType] = useState("bert");
  const [numResults, setNumResults] = useState(3);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  //const handleSearch = async (query) => {
  //  if (!query) return;
  //  setSearched(true);
  //  const response = await fetch(`/api/search?q=${query}`);
  //  const data = await response.json();
  //  setResults(data.slice(0, numResults)); // Limit results based on slider
  //};


  const handleSearch = async (query) => {
    if (!query) return;
    
    setSearched(true);

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/search?q=${query}&index_type=${indexType}&top_k=${numResults}`);
        const data = await response.json();

        console.log("Received API Response:", data);

        if (data.error) {
            console.error("API Error:", data.error);
            setResults([]);
        } else {
            setResults(data);
        }
    } catch (error) {
        console.error("Failed to fetch:", error);
        setResults([]);
    }
};

  const toggleDarkMode = (enabled) => {
    setIsDarkMode(enabled);
    document.body.classList.toggle("dark-mode", enabled);
  };

  return (
    <div className={`App ${isDarkMode ? "dark" : ""}`}>
      <SettingsMenu 
          onIndexChange={setIndexType} 
          onResultsChange={setNumResults}
          onDarkModeToggle={toggleDarkMode} />

      <div className="logo-container">
        <img src={carLogo} alt="Car Logo" className="car-logo" />
      </div>

      <h1>Vehicle Wiki</h1>
      <SearchBar onSearch={handleSearch} />
      <ResultsList results={results} searched={searched} />

      <footer className={isDarkMode ? "dark-footer" : ""}>
        <p>&copy; 2025 Vehicle Wiki App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;



