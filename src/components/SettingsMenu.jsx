import { useState, useEffect, useRef } from "react";
import "./SettingsMenu.css";
import { FiSettings } from "react-icons/fi";

const SettingsMenu = ({ onIndexChange, onDarkModeToggle, onResultsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [indexType, setIndexType] = useState("bert");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [numResults, setNumResults] = useState(3);
  const menuRef = useRef(null); // Ref for the settings menu

  const handleIndexChange = (event) => {
    setIndexType(event.target.value);
    onIndexChange(event.target.value);
    console.log("Selected index:", event.target.value);
  };

  const handleDarkModeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    onDarkModeToggle(newMode);

    // Apply or remove dark-mode class from body
    if (newMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const handleSliderChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setNumResults(value);
    onResultsChange(value);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`settings-container ${isDarkMode ? "dark-mode" : ""}`} ref={menuRef}>
      <button className="settings-button" onClick={() => setIsOpen(!isOpen)}>
        <FiSettings size={24} />
      </button>

      {isOpen && (
        <div className="settings-dropdown">
          <h3>Settings</h3>
          <hr className="settings-divider" />

          <div className="settings-section">
            <h4>Index Type</h4>
            <label>
              <input
                type="radio"
                value="bert"
                checked={indexType === "bert"}
                onChange={handleIndexChange}
              />
              BERT Index
            </label>
            <label>
              <input
                type="radio"
                value="pylucene"
                checked={indexType === "pylucene"}
                onChange={handleIndexChange}
              />
              PyLucene
            </label>
          </div>

          <hr className="settings-divider" />

          <div className="settings-section">
            <h4>Number of Results: {numResults}</h4>
            <input
              type="range"
              min="1"
              max="10"
              value={numResults}
              onChange={handleSliderChange}
              className="slider-input"
            />
          </div>

          <hr className="settings-divider" />

          <div className="dark-mode-section">
            <h4>Dark Mode</h4>
            <div className="toggle-container">
              <label className="toggle-switch">
                <input type="checkbox" checked={isDarkMode} onChange={handleDarkModeToggle} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;

