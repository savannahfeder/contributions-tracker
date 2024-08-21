import React, { useState, useMemo } from "react";
import ContributionsGraph from "./ContributionsGraph/ContributionsGraph";
import { Twitter } from "lucide-react";
import {
  getContributionsForPeriod,
  getContributionsPeriod,
  preprocessContributions,
  toggleView,
} from "../utils/contributionsUtils";
import { Tweet } from "../hooks/useFetchTweets";
import { format } from "date-fns";

interface TwitterContributionsProps {
  darkMode: boolean;
  twitterContributions: Tweet[];
  tweetsLoading: boolean;
  tweetsError: string | null;
  setIsTweetModalOpen: (open: boolean) => void;
}

function TwitterContributions({
  darkMode,
  twitterContributions,
  tweetsLoading,
  tweetsError,
  setIsTweetModalOpen,
}: TwitterContributionsProps) {
  const [twitterView, setTwitterView] = useState<"week" | "month" | "year">(
    "week"
  );

  const processedTwitterData = useMemo(() => {
    return preprocessContributions(twitterContributions);
  }, [twitterContributions]);

  const twitterContributionsCount = useMemo(
    () => getContributionsForPeriod(twitterView, twitterContributions),
    [twitterView, twitterContributions]
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Twitter Contributions
          </h1>
          <p className="text-sm text-gray-500 font-light dark:text-gray-400">
            {twitterContributionsCount} contributions in the last {twitterView}
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
            onClick={() => toggleView(twitterView, setTwitterView)}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
          >
            {twitterView.charAt(0).toUpperCase() + twitterView.slice(1)}
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
            view={twitterView}
          />
        )}
      </div>
      <div className="mt-4 text-sm text-gray-500 font-light dark:text-gray-400">
        <p>Contributions from {getContributionsPeriod(twitterView)}</p>
      </div>
    </div>
  );
}

export default TwitterContributions;
