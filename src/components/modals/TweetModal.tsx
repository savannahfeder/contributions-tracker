import React, { useState, useRef } from "react";
import { TwitterIcon, X, Image } from "lucide-react";

interface TweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, media: File | null) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TweetModal: React.FC<TweetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
}) => {
  const [tweetText, setTweetText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(tweetText, selectedFile);
      setTweetText("");
      setSelectedFile(null);
      onClose();
    } catch (err) {
      // Error is now handled by the parent component
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        <div className="flex items-center mb-4">
          <TwitterIcon size={24} className="text-blue-500 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Create a Tweet
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-32 p-3 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            placeholder="What's happening?"
            maxLength={280}
          />
          <div className="mt-3 flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*"
            />
            <button
              type="button"
              onClick={triggerFileInput}
              className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition duration-200"
            >
              <Image size={16} className="mr-1" />
              {selectedFile ? "Change Media" : "Add Media"}
            </button>
            {selectedFile && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                {selectedFile.name}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {280 - tweetText.length} characters remaining
            </span>
            <div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md mr-2 transition duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md disabled:opacity-50 transition duration-200"
                disabled={tweetText.length === 0 || isLoading}
              >
                {isLoading ? "Tweeting..." : "Tweet"}
              </button>
            </div>
          </div>
        </form>
        {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default TweetModal;
