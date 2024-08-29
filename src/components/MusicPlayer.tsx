import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Music } from "lucide-react";
import SongSelectionModal from "./SongSelectionModal";

interface MusicPlayerProps {
  darkMode: boolean;
  reloadButton: React.ReactNode;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  darkMode,
  reloadButton,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);

  // Use useCallback to memoize these functions
  const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
    setIsPlaying(false);
  }, []);

  const onPlayerStateChange = useCallback((event: YT.OnStateChangeEvent) => {
    if (event.data === (window as any).YT.PlayerState.ENDED) {
      setIsPlaying(false);
    }
  }, []);

  const createPlayer = useCallback(
    (id: string) => {
      playerRef.current = new (window as any).YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    },
    [onPlayerReady, onPlayerStateChange]
  );

  useEffect(() => {
    const savedVideoId = localStorage.getItem("youtubeVideoId");
    const savedVideoUrl = localStorage.getItem("youtubeVideoUrl");
    if (savedVideoId) setVideoId(savedVideoId);
    if (savedVideoUrl) setVideoUrl(savedVideoUrl);

    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        setIsYouTubeApiReady(true);
      };
    } else {
      setIsYouTubeApiReady(true);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (isYouTubeApiReady && videoId) {
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        playerRef.current.pauseVideo(); // Ensure video is paused after loading
      } else {
        createPlayer(videoId);
      }
    }
  }, [isYouTubeApiReady, videoId, createPlayer]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const id = extractVideoId(videoUrl);
      if (id) {
        setVideoId(id);
        localStorage.setItem("youtubeVideoId", id);
        localStorage.setItem("youtubeVideoUrl", videoUrl);
        setIsModalOpen(false);
        setIsPlaying(false); // Ensure it's set to paused when changing the video
      }
    },
    [videoUrl]
  );

  const extractVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const togglePlayPause = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        {reloadButton}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`p-2 rounded-full transition-all duration-200 ${
              darkMode
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
            }`}
          >
            <Music size={16} />
          </button>
          <button
            onClick={togglePlayPause}
            className={`p-3 rounded-full bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 shadow-md ${
              darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>
      <div id="youtube-player" style={{ display: "none" }}></div>
      <SongSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        darkMode={darkMode}
      />
    </>
  );
};

export default React.memo(MusicPlayer);
