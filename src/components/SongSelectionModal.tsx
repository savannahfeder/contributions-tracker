import React from "react";
import { Music, X } from "lucide-react";

interface SongSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  darkMode: boolean;
}

const SongSelectionModal: React.FC<SongSelectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  videoUrl,
  setVideoUrl,
  darkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-lg p-6 w-full max-w-md relative`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        <div className="flex items-center mb-4">
          <Music size={24} className="text-blue-500 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Change Music
          </h2>
        </div>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md mr-2 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md disabled:opacity-50 transition duration-200"
              disabled={!videoUrl}
            >
              Play
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongSelectionModal;
