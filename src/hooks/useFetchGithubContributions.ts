import { useState, useEffect } from "react";
import { parseISO, format } from "date-fns";

interface RawContribution {
  date: string;
  count: number;
}

export interface Contribution {
  date: Date;
  count: number;
}

const useFetchGithubContributions = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

  const fetchContributions = async (force = false) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const cachedData = localStorage.getItem("githubContributions");
    const cachedDate = localStorage.getItem("githubContributionsDate");

    if (!force && cachedData && cachedDate === today) {
      setContributions(JSON.parse(cachedData));
      setLoading(false);
      setLastFetchDate(cachedDate);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/github-contributions?t=${Date.now()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch GitHub contributions");
      }
      const data: RawContribution[] = await response.json();

      const processedContributions = data.map((contrib: RawContribution) => ({
        date: parseISO(contrib.date),
        count: contrib.count,
      }));

      setContributions(processedContributions);
      localStorage.setItem(
        "githubContributions",
        JSON.stringify(processedContributions)
      );
      localStorage.setItem("githubContributionsDate", today);
      setLastFetchDate(today);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [API_URL]);

  return {
    contributions,
    loading,
    error,
    lastFetchDate,
    refetch: () => fetchContributions(true),
  };
};

export default useFetchGithubContributions;
