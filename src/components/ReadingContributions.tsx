import React, { useState, useMemo, useEffect } from "react";
import ContributionsGraph from "./ContributionsGraph/ContributionsGraph";
import { Book } from "lucide-react";
import {
  getContributionsForPeriod,
  getContributionsPeriod,
  preprocessContributions,
  toggleView,
} from "../utils/contributionsUtils";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

interface ReadingContributionsProps {
  darkMode: boolean;
}

function ReadingContributions({ darkMode }: ReadingContributionsProps) {
  const [readingData, setReadingData] = useState<
    { date: Date; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<"week" | "month" | "year">(() => {
    return (
      (localStorage.getItem("readingView") as "week" | "month" | "year") ||
      "week"
    );
  });

  useEffect(() => {
    localStorage.setItem("readingView", view);
  }, [view]);

  useEffect(() => {
    const fetchReadingData = async () => {
      try {
        const readingCollection = collection(db, "reading");
        const snapshot = await getDocs(readingCollection);
        const data = snapshot.docs.map((doc) => {
          // Parse the date and adjust for local timezone
          const date = new Date(doc.data().date);
          const adjustedDate = new Date(
            date.getTime() + date.getTimezoneOffset() * 60000
          );
          return {
            date: adjustedDate,
            count: 1,
          };
        });
        setReadingData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reading data:", err);
        setError("Failed to fetch reading data");
        setLoading(false);
      }
    };

    fetchReadingData();
  }, []);

  const processedReadingData = useMemo(() => {
    return preprocessContributions(readingData);
  }, [readingData]);

  const readingContributionsCount = useMemo(
    () => getContributionsForPeriod(view, processedReadingData),
    [view, processedReadingData]
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <Book size={24} className="text-gray-600 dark:text-gray-300 mr-2" />
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Reading Days
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-light dark:text-gray-400 mt-2">
            {readingContributionsCount} days read in the last {view}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleView(view, setView)}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        {loading ? (
          <p>Loading reading data...</p>
        ) : error ? (
          <p>Error loading reading data: {error}</p>
        ) : (
          <ContributionsGraph
            data={processedReadingData}
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

export default ReadingContributions;
