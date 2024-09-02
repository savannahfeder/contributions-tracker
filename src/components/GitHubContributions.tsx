import React, { useState, useMemo, useEffect } from "react";
import ContributionsGraph from "./ContributionsGraph/ContributionsGraph";
import useFetchGithubContributions from "../hooks/useFetchGithubContributions";
import {
  getContributionsForPeriod,
  getContributionsPeriod,
  preprocessContributions,
  toggleView,
} from "../utils/contributionsUtils";
import { getStartDate } from "../utils/contributionsUtils";
import { setRefetchGithub } from "../utils/githubRefetch";
import { Github } from "lucide-react"; // Add this import

interface GitHubContributionsProps {
  darkMode: boolean;
}

function GitHubContributions({ darkMode }: GitHubContributionsProps) {
  const { contributions, loading, error, refetch } =
    useFetchGithubContributions();

  useEffect(() => {
    setRefetchGithub(refetch);
  }, [refetch]);

  const [view, setView] = useState<"week" | "month" | "year">(() => {
    return (
      (localStorage.getItem("githubView") as "week" | "month" | "year") ||
      "week"
    );
  });

  useEffect(() => {
    localStorage.setItem("githubView", view);
  }, [view]);

  const processedGithubData = useMemo(() => {
    const startDate = getStartDate(view);
    return preprocessContributions(contributions).filter(
      (contrib) => contrib.date >= startDate
    );
  }, [contributions, view]);

  const githubContributionsCount = useMemo(() => {
    return getContributionsForPeriod(view, contributions);
  }, [view, contributions]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <Github
              size={24}
              className="text-gray-700 dark:text-gray-300 mr-2"
            />
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              GitHub Contributions
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-light dark:text-gray-400 mt-2">
            {githubContributionsCount} contributions in the last {view}
          </p>
        </div>
        <button
          onClick={() => toggleView(view, setView)}
          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
        >
          {view.charAt(0).toUpperCase() + view.slice(1)}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        {loading ? (
          <p>Loading GitHub data...</p>
        ) : error ? (
          <p>Error loading GitHub data: {error}</p>
        ) : (
          <ContributionsGraph
            data={processedGithubData}
            darkMode={darkMode}
            view={view}
          />
        )}
      </div>
      <div className="mt-4 text-sm text-gray-500 font-light dark:text-gray-400">
        <p>Contributions from {getContributionsPeriod(view)}</p>
      </div>
    </div>
  );
}

export default GitHubContributions;
