import React, { useState, useMemo } from "react";
import ContributionsGraph from "./ContributionsGraph/ContributionsGraph";
import useFetchGithubContributions from "../hooks/useFetchGithubContributions";
import {
  getContributionsForPeriod,
  getContributionsPeriod,
  preprocessContributions,
  toggleView,
} from "../utils/contributionsUtils";

interface GitHubContributionsProps {
  darkMode: boolean;
}

function GitHubContributions({ darkMode }: GitHubContributionsProps) {
  const [githubView, setGithubView] = useState<"year" | "week" | "month">(
    "year"
  );
  const {
    contributions: githubContributions,
    loading: githubLoading,
    error: githubError,
  } = useFetchGithubContributions();

  const processedGithubData = useMemo(
    () => preprocessContributions(githubContributions),
    [githubContributions]
  );

  const githubContributionsCount = useMemo(
    () => getContributionsForPeriod(githubView, githubContributions),
    [githubView, githubContributions]
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            GitHub Contributions
          </h1>
          <p className="text-sm text-gray-500 font-light dark:text-gray-400">
            {githubContributionsCount} contributions in the last {githubView}
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
  );
}

export default GitHubContributions;
