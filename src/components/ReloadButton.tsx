import React from "react";
import { RefreshCw } from "lucide-react";

interface ReloadButtonProps {
  onClick: () => void;
  darkMode: boolean;
}

const ReloadButton: React.FC<ReloadButtonProps> = ({ onClick, darkMode }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 mr-1.5 rounded-full transition-all duration-200 ${
        darkMode
          ? "text-gray-400 hover:text-white hover:bg-gray-800"
          : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
      }`}
    >
      <RefreshCw size={16} />
    </button>
  );
};

export default ReloadButton;
