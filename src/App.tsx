import React, { useState, useMemo, useEffect } from "react";
import DarkModeToggle from "./components/DarkModeToggle";
import TweetModal from "./components/modals/TweetModal";
import GitHubContributions from "./components/GitHubContributions";
import TwitterContributions from "./components/TwitterContributions";
import MusicPlayer from "./components/MusicPlayer";
import { useCreateTweet } from "./hooks/useCreateTweet";
import { useFetchTweets, Tweet } from "./hooks/useFetchTweets";
import { startOfDay, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import ReloadButton from "./components/ReloadButton";
import useFetchGithubContributions from "./hooks/useFetchGithubContributions";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);
  const {
    createTweet,
    isLoading: isTweetLoading,
    error: tweetError,
  } = useCreateTweet();
  const {
    tweets,
    loading: tweetsLoading,
    error: tweetsError,
  } = useFetchTweets();
  const {
    contributions: githubContributions,
    loading: githubLoading,
    error: githubError,
    lastFetchDate,
    refetch: refetchGithub,
  } = useFetchGithubContributions();

  const [githubView, setGithubView] = useState<"week" | "month" | "year">(
    () => {
      return (
        (localStorage.getItem("githubView") as "week" | "month" | "year") ||
        "week"
      );
    }
  );

  const [twitterView, setTwitterView] = useState<"week" | "month" | "year">(
    () => {
      return (
        (localStorage.getItem("twitterView") as "week" | "month" | "year") ||
        "week"
      );
    }
  );

  useEffect(() => {
    localStorage.setItem("githubView", githubView);
  }, [githubView]);

  useEffect(() => {
    localStorage.setItem("twitterView", twitterView);
  }, [twitterView]);

  const processedTweets = useMemo(() => {
    if (!tweets) return [];
    const contributionMap = new Map();
    tweets.forEach((tweet: Tweet) => {
      const originalDate = new Date(tweet.date);
      const pstDate = toZonedTime(originalDate, "America/Los_Angeles");
      const dateKey = format(startOfDay(pstDate), "yyyy-MM-dd");
      const count = contributionMap.get(dateKey) || 0;
      contributionMap.set(dateKey, count + 1);
    });
    return Array.from(contributionMap, ([date, count]) => ({
      date: new Date(date),
      count,
    }));
  }, [tweets]);

  const handleTweetSubmit = async (text: string, media: File | null) => {
    try {
      const result = await createTweet({ text, media: media || undefined });
      if (result) {
        console.log("Tweet created:", result);
        setIsTweetModalOpen(false);
      } else {
        throw new Error("Failed to create tweet. Please try again.");
      }
    } catch (error) {
      console.error("Error creating tweet:", error);
      throw error;
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
          <TwitterContributions
            darkMode={darkMode}
            twitterContributions={processedTweets}
            tweetsLoading={tweetsLoading}
            tweetsError={tweetsError}
            setIsTweetModalOpen={setIsTweetModalOpen}
            view={twitterView}
            setView={setTwitterView}
          />
          <GitHubContributions
            darkMode={darkMode}
            contributions={githubContributions}
            loading={githubLoading}
            error={githubError}
            lastFetchDate={lastFetchDate}
            view={githubView}
            setView={setGithubView}
          />
        </div>
        <MusicPlayer
          darkMode={darkMode}
          reloadButton={
            <ReloadButton onClick={refetchGithub} darkMode={darkMode} />
          }
        />
      </div>
      <TweetModal
        isOpen={isTweetModalOpen}
        onClose={() => setIsTweetModalOpen(false)}
        onSubmit={handleTweetSubmit}
        isLoading={isTweetLoading}
        error={tweetError}
      />
    </div>
  );
}

export default App;
