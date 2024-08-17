import React, { useState, useMemo } from "react";
import ContributionsGraph from "./components/ContributionsGraph/ContributionsGraph";
import DarkModeToggle from "./components/DarkModeToggle";
import TweetModal from "./components/modals/TweetModal";
import useFetchGithubContributions from "./hooks/useFetchGithubContributions";
import { useCreateTweet } from "./hooks/useCreateTweet";
import { useFetchTweets } from "./hooks/useFetchTweets";
import {
  subYears,
  subMonths,
  subWeeks,
  eachDayOfInterval,
  format,
  startOfDay,
  parseISO,
  addDays,
} from "date-fns";
import { Twitter } from "lucide-react";

const getContributionsForPeriod = (
  period: "week" | "month" | "year",
  data: { date: Date; count: number }[]
) => {
  const endDate = new Date();
  let startDate: Date;

  switch (period) {
    case "week":
      startDate = subWeeks(endDate, 1);
      break;
    case "month":
      startDate = subMonths(endDate, 1);
      break;
    case "year":
      startDate = subYears(endDate, 1);
      break;
    default:
      startDate = subYears(endDate, 1);
  }

  return data
    .filter(({ date }) => {
      const contributionDate = startOfDay(new Date(date));
      return contributionDate >= startDate && contributionDate <= endDate;
    })
    .reduce((sum, day) => sum + day.count, 0);
};

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [twitterView, setTwitterView] = useState<"week" | "month" | "year">(
    "week"
  );
  const [githubView, setGithubView] = useState<"week" | "month" | "year">(
    "year"
  );
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);
  const {
    contributions: githubContributions,
    loading: githubLoading,
    error: githubError,
  } = useFetchGithubContributions();
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

  const twitterContributions = useMemo(() => {
    if (!tweets) return [];
    const contributionMap = new Map();
    tweets.forEach((tweet) => {
      const date = startOfDay(new Date(tweet.date));
      const dateKey = date.toISOString().split("T")[0];
      const count = contributionMap.get(dateKey) || 0;
      contributionMap.set(dateKey, count + 1);
    });
    return Array.from(contributionMap, ([dateKey, count]) => ({
      date: new Date(dateKey),
      count,
    }));
  }, [tweets]);

  const twitterContributionsCount = useMemo(
    () => getContributionsForPeriod(twitterView, twitterContributions),
    [twitterView, twitterContributions]
  );

  const githubContributionsCount = useMemo(
    () => getContributionsForPeriod(githubView, githubContributions),
    [githubView, githubContributions]
  );

  const toggleView = (
    currentView: "week" | "month" | "year",
    setViewFunction: React.Dispatch<
      React.SetStateAction<"week" | "month" | "year">
    >
  ) => {
    const views: ("week" | "month" | "year")[] = ["week", "month", "year"];
    const currentIndex = views.indexOf(currentView);
    const nextIndex = (currentIndex + 1) % views.length;
    setViewFunction(views[nextIndex]);
  };

  const preprocessContributions = (
    contributions: { date: Date; count: number }[]
  ) => {
    return contributions.map((contribution) => {
      let date = contribution.date;
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      return {
        ...contribution,
        date: startOfDay(date),
      };
    });
  };

  const processedTwitterData = useMemo(
    () => preprocessContributions(twitterContributions),
    [twitterContributions]
  );
  const processedGithubData = useMemo(
    () => preprocessContributions(githubContributions),
    [githubContributions]
  );

  const handleTweetSubmit = async (text: string, media: File | null) => {
    try {
      const result = await createTweet({ text, media: media || undefined });
      if (result) {
        console.log("Tweet created:", result);
        // You might want to update your Twitter contributions data here
        // For example, you could refetch the Twitter data or update the state manually
        setIsTweetModalOpen(false);
      } else {
        throw new Error("Failed to create tweet. Please try again.");
      }
    } catch (error) {
      console.error("Error creating tweet:", error);
      throw error;
    }
  };

  const getContributionsPeriod = (view: "week" | "month" | "year") => {
    const endDate = new Date();
    let startDate: Date;

    switch (view) {
      case "week":
        startDate = subWeeks(endDate, 1);
        break;
      case "month":
        startDate = subMonths(endDate, 1);
        break;
      case "year":
        startDate = subYears(endDate, 1);
        break;
    }

    return `${format(startDate, "MMM d, yyyy")} to ${format(
      endDate,
      "MMM d, yyyy"
    )}`;
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
          {/* GitHub Contributions Container */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                  GitHub Contributions
                </h1>
                <p className="text-sm text-gray-500 font-light dark:text-gray-400">
                  {githubContributionsCount} contributions in the last{" "}
                  {githubView}
                </p>
              </div>
              <button
                onClick={() => toggleView(githubView, setGithubView)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
              >
                {githubView.charAt(0).toUpperCase() + githubView.slice(1)}
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
              {githubLoading ? (
                <p>Loading GitHub data...</p>
              ) : githubError ? (
                <p>Error loading GitHub data: {githubError}</p>
              ) : (
                <ContributionsGraph
                  data={processedGithubData}
                  darkMode={darkMode}
                  view={githubView}
                />
              )}
            </div>
            <div className="mt-4 text-sm text-gray-500 font-light dark:text-gray-400">
              <p>Contributions from {getContributionsPeriod(githubView)}</p>
            </div>
          </div>
          {/* Twitter Contributions Container */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                  Twitter Contributions
                </h1>
                <p className="text-sm text-gray-500 font-light dark:text-gray-400">
                  {twitterContributionsCount} contributions in the last{" "}
                  {twitterView}
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
        </div>
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
