import React from "react";
import { Play, Pause } from "lucide-react";

interface MusicPlayerProps {
  darkMode: boolean;
  musicUrl: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ darkMode, musicUrl }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual music playback
  };

  return (
    <button
      onClick={togglePlayPause}
      className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
        darkMode
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-black"
      }`}
      style={{ width: "32px", height: "32px" }}
    >
      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
    </button>
  );
};

export default React.memo(MusicPlayer);
