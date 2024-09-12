import React, { useState, useEffect } from "react";
import DarkModeToggle from "./components/DarkModeToggle";
import GitHubContributions from "./components/GitHubContributions";
import ReadingContributions from "./components/ReadingContributions";
import TwitterContributions from "./components/TwitterContributions";
import MusicPlayer from "./components/MusicPlayer";
import ReloadButton from "./components/ReloadButton";
import SettingsButton from "./components/SettingsButton";
import SettingsModal from "./components/SettingsModal";
import { getRefetchGithub } from "./utils/githubRefetch";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const [showGithub, setShowGithub] = useState(true);
  const [showReading, setShowReading] = useState(true);
  const [showTwitter, setShowTwitter] = useState(false);

  useEffect(() => {
    const savedMusicUrl = localStorage.getItem("musicUrl");
    if (savedMusicUrl) {
      setMusicUrl(savedMusicUrl);
    }
  }, []);

  const handleSetMusicUrl = (url: string) => {
    setMusicUrl(url);
    localStorage.setItem("musicUrl", url);
  };

  const handleReload = () => {
    const refetchGithub = getRefetchGithub();
    if (refetchGithub) {
      refetchGithub();
    }
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="transition-colors duration-200 dark:bg-[#0c111b] min-h-screen pt-8 pb-4">
        <div className="fixed top-4 right-4">
          <DarkModeToggle
            darkMode={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {showGithub && <GitHubContributions darkMode={darkMode} />}
          {showReading && <ReadingContributions darkMode={darkMode} />}
          {showTwitter && <TwitterContributions darkMode={darkMode} />}
        </div>
        <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
          <ReloadButton onClick={handleReload} darkMode={darkMode} />
          <div className="flex items-center space-x-2">
            <SettingsButton onClick={toggleSettings} darkMode={darkMode} />
            <MusicPlayer darkMode={darkMode} musicUrl={musicUrl} />
          </div>
        </div>
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={toggleSettings}
          darkMode={darkMode}
          musicUrl={musicUrl}
          setMusicUrl={handleSetMusicUrl}
          showGithub={showGithub}
          setShowGithub={setShowGithub}
          showReading={showReading}
          setShowReading={setShowReading}
          showTwitter={showTwitter}
          setShowTwitter={setShowTwitter}
        />
      </div>
    </div>
  );
}

export default App;
