import { useState, useEffect } from "react";

interface Contribution {
  date: Date;
  count: number;
}

const useFetchGithubContributions = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/github-contributions"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch GitHub contributions");
        }
        const data = await response.json();
        setContributions(
          data.map((contrib: Contribution) => ({
            ...contrib,
            date: new Date(contrib.date),
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  return { contributions, loading, error };
};

export default useFetchGithubContributions;
