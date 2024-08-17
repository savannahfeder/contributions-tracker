import React, { useState, useMemo } from "react";
import ContributionsGraph from "./components/ContributionsGraph/ContributionsGraph";
import DarkModeToggle from "./components/DarkModeToggle";
import useFetchGithubContributions from "./hooks/useFetchGithubContributions";
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
      startDate = subYears(endDate, 1); // Default to year view
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
    "year"
  );
  const [githubView, setGithubView] = useState<"week" | "month" | "year">(
    "year"
  );
  const {
    contributions: githubContributions,
    loading: githubLoading,
    error: githubError,
  } = useFetchGithubContributions();

  const generateSampleData = () => {
    const endDate = new Date();
    const startDate = subYears(endDate, 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    return dateRange.map((date) => {
      const rand = Math.random();
      let count;
      if (rand < 0.3) {
        count = 0;
      } else if (rand < 0.8) {
        count = Math.floor(Math.random() * 5) + 1;
      } else if (rand < 0.95) {
        count = Math.floor(Math.random() * 10) + 6;
      } else {
        count = Math.floor(Math.random() * 15) + 16;
      }
      return { date, count };
    });
  };

  const twitterSampleData = useMemo(() => generateSampleData(), []);

  const twitterContributionsCount = useMemo(
    () => getContributionsForPeriod(twitterView, twitterSampleData),
    [twitterView, twitterSampleData]
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
      const date =
        contribution.date instanceof Date
          ? contribution.date
          : parseISO(contribution.date as unknown as string);
      // Adjust for GitHub's day starting at midnight UTC
      const adjustedDate = addDays(date, 1);
      return {
        ...contribution,
        date: startOfDay(adjustedDate),
      };
    });
  };

  const processedTwitterData = useMemo(
    () => preprocessContributions(twitterSampleData),
    [twitterSampleData]
  );
  const processedGithubData = useMemo(
    () => preprocessContributions(githubContributions),
    [githubContributions]
  );

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="transition-colors duration-200 dark:bg-[#0c111b] min-h-screen pt-16">
        <div className="fixed top-4 right-4">
          <DarkModeToggle
            darkMode={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 space-y-8">
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
              <button
                onClick={() => toggleView(twitterView, setTwitterView)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
              >
                {twitterView.charAt(0).toUpperCase() + twitterView.slice(1)}
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
              <ContributionsGraph
                data={processedTwitterData}
                darkMode={darkMode}
                view={twitterView}
              />
            </div>
            <div className="mt-4 text-sm text-gray-500 font-light dark:text-gray-400">
              <p>
                Contributions from{" "}
                {format(subYears(new Date(), 1), "MMM d, yyyy")} to{" "}
                {format(new Date(), "MMM d, yyyy")}
              </p>
            </div>
          </div>

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
              <p>
                Contributions from{" "}
                {format(subYears(new Date(), 1), "MMM d, yyyy")} to{" "}
                {format(new Date(), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
