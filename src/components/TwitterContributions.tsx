import React, { useState, useMemo, useEffect } from "react";
import ContributionsGraph from "./ContributionsGraph/ContributionsGraph";
import { Twitter } from "lucide-react";
import {
  getContributionsForPeriod,
  getContributionsPeriod,
  preprocessContributions,
  toggleView,
} from "../utils/contributionsUtils";
import { useFetchTweets, Tweet } from "../hooks/useFetchTweets";
import { useCreateTweet } from "../hooks/useCreateTweet";
import { startOfDay, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import TweetModal from "./modals/TweetModal";

interface TwitterContributionsProps {
  darkMode: boolean;
}

function TwitterContributions({ darkMode }: TwitterContributionsProps) {
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

  const [view, setView] = useState<"week" | "month" | "year">(() => {
    return (
      (localStorage.getItem("twitterView") as "week" | "month" | "year") ||
      "week"
    );
  });

  useEffect(() => {
    localStorage.setItem("twitterView", view);
  }, [view]);

  const processedTwitterData = useMemo(() => {
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

  const twitterContributionsCount = useMemo(
    () => getContributionsForPeriod(view, processedTwitterData),
    [view, processedTwitterData]
  );

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
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Twitter Contributions
          </h1>
          <p className="text-sm text-gray-500 font-light dark:text-gray-400">
            {twitterContributionsCount} contributions in the last {view}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTweetModalOpen(true)}
            className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200 font-medium text-sm flex items-center space-x-1"
          >
            <Twitter size={16} />
            <span>Tweet</span>
          </button>
          <button
            onClick={() => toggleView(view, setView)}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        {tweetsLoading ? (
          <p>Loading Twitter data...</p>
        ) : tweetsError ? (
          <p>Error loading Twitter data: {tweetsError}</p>
        ) : (
          <ContributionsGraph
            data={processedTwitterData}
            darkMode={darkMode}
            view={view}
          />
        )}
      </div>
      <div className="mt-4 text-sm text-gray-500 font-light dark:text-gray-400">
        <p>Contributions from {getContributionsPeriod(view)}</p>
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

export default TwitterContributions;
