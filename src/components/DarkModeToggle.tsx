import React from "react";
import { Sun, Moon } from "lucide-react";

interface DarkModeToggleProps {
  darkMode: boolean;
  onChange: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  darkMode,
  onChange,
}) => {
  return (
    <button
      onClick={onChange}
      className="w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1 duration-300 ease-in-out relative focus:outline-none"
      aria-label="Toggle dark mode"
    >
      <div
        className={`w-5 h-5 bg-white dark:bg-gray-800 rounded-full shadow-md transform duration-300 ease-in-out flex items-center justify-center ${
          darkMode ? "translate-x-7" : ""
        }`}
      >
        {darkMode ? (
          <Moon size={12} className="text-gray-400" />
        ) : (
          <Sun size={12} className="text-gray-600" />
        )}
      </div>
      <Sun
        size={14}
        className={`absolute left-1.5 top-1.5 transition-opacity duration-300 ${
          darkMode ? "opacity-25 text-gray-400" : "opacity-0"
        }`}
      />
      <Moon
        size={14}
        className={`absolute right-1.5 top-1.5 transition-opacity duration-300 ${
          darkMode ? "opacity-0" : "opacity-25 text-gray-500"
        }`}
      />
    </button>
  );
};

export default DarkModeToggle;
