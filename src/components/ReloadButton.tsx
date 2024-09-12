import React from "react";
import { RotateCw } from "lucide-react";

interface ReloadButtonProps {
  onClick: () => void;
  darkMode: boolean;
}

const ReloadButton: React.FC<ReloadButtonProps> = ({ onClick, darkMode }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center ${
        darkMode
          ? "text-gray-400 hover:text-white hover:bg-gray-700"
          : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
      }`}
      style={{ width: "32px", height: "32px" }} // Ensure consistent button size
    >
      <RotateCw size={16} />
    </button>
  );
};

export default ReloadButton;
