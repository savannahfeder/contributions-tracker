import React, { useState, useMemo } from "react";
import ContributionsGraph from "./ContributionsGraph/ContributionsGraph";
import useFetchGithubContributions from "../hooks/useFetchGithubContributions";
import {
  getContributionsForPeriod,
  getContributionsPeriod,
  preprocessContributions,
  toggleView,
} from "../utils/contributionsUtils";
import { format, parseISO } from "date-fns";
import { getStartDate } from "../utils/contributionsUtils";

interface GitHubContributionsProps {
  darkMode: boolean;
  contributions: Contribution[];
  loading: boolean;
  error: string | null;
  lastFetchDate: string | null;
  view: "week" | "month" | "year";
  setView: React.Dispatch<React.SetStateAction<"week" | "month" | "year">>;
}

interface Contribution {
  date: Date;
  count: number;
}

function GitHubContributions({
  darkMode,
  contributions,
  loading,
  error,
  lastFetchDate,
  view,
  setView,
}: GitHubContributionsProps) {
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            GitHub Contributions
          </h1>
          <p className="text-sm text-gray-500 font-light dark:text-gray-400">
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
