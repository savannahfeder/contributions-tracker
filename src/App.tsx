import React, { useState } from "react";
import DarkModeToggle from "./components/DarkModeToggle";
import GitHubContributions from "./components/GitHubContributions";
import TwitterContributions from "./components/TwitterContributions";
import MusicPlayer from "./components/MusicPlayer";
import ReloadButton from "./components/ReloadButton";
import { getRefetchGithub } from "./utils/githubRefetch";

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const handleReload = () => {
    const refetchGithub = getRefetchGithub();
    if (refetchGithub) {
      refetchGithub();
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="transition-colors duration-200 dark:bg-[#0c111b] min-h-screen pt-8">
        <div className="fixed top-4 right-4">
          <DarkModeToggle
            darkMode={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {/* <TwitterContributions darkMode={darkMode} /> */}
          <GitHubContributions darkMode={darkMode} />
        </div>
        <MusicPlayer
          darkMode={darkMode}
          reloadButton={
            <ReloadButton onClick={handleReload} darkMode={darkMode} />
          }
        />
      </div>
    </div>
  );
}

export default App;
