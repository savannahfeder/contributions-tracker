import React from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  musicUrl: string;
  setMusicUrl: (url: string) => void;
  showGithub: boolean;
  setShowGithub: (show: boolean) => void;
  showReading: boolean;
  setShowReading: (show: boolean) => void;
  showTwitter: boolean;
  setShowTwitter: (show: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  musicUrl,
  setMusicUrl,
  showGithub,
  setShowGithub,
  showReading,
  setShowReading,
  showTwitter,
  setShowTwitter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } p-8 rounded-2xl w-[32rem] shadow-xl transform transition-all duration-300 ease-in-out`}
      >
        <h2 className="text-3xl font-bold mb-6 border-b border-gray-600 pb-2">
          Settings
        </h2>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="musicUrl"
              className="block mb-2 font-medium text-lg"
            >
              Music URL
            </label>
            <input
              type="text"
              id="musicUrl"
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              className={`w-full p-3 rounded-lg ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
              } border ${
                darkMode ? "border-gray-600" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-green-500`}
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-lg mb-2">Visible Components</h3>
            <ToggleSwitch
              label="GitHub Contributions"
              checked={showGithub}
              onChange={setShowGithub}
              darkMode={darkMode}
            />
            <ToggleSwitch
              label="Reading Contributions"
              checked={showReading}
              onChange={setShowReading}
              darkMode={darkMode}
            />
            <ToggleSwitch
              label="Twitter Contributions"
              checked={showTwitter}
              onChange={setShowTwitter}
              darkMode={darkMode}
            />
          </div>
        </div>
        <button
          onClick={onClose}
          className={`mt-8 px-6 py-3 rounded-lg w-full ${
            darkMode
              ? "bg-green-700 hover:bg-green-600"
              : "bg-green-500 hover:bg-green-400"
          } text-white text-lg font-medium transition-colors duration-200`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  darkMode: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  darkMode,
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-14 h-8 rounded-full shadow-inner ${
            checked
              ? darkMode
                ? "bg-green-700"
                : "bg-green-500"
              : darkMode
              ? "bg-gray-700"
              : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out transform ${
            checked ? "translate-x-6" : "translate-x-0"
          } ${checked ? "shadow-lg" : "shadow"}`}
        ></div>
      </div>
      <div className="ml-3 text-lg font-medium">{label}</div>
    </label>
  );
};

export default SettingsModal;
