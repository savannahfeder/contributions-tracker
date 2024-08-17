import { useState } from "react";

interface Tweet {
  id: string;
  text: string;
  created_at: string;
}

const useFetchTweets = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTweets = async (username: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching tweets for username: ${username}`);
      const response = await fetch(
        `http://localhost:3001/api/tweets/${username}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tweets: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`Tweets data:`, data);

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error(
          `Unexpected response format: 'data' property is missing or not an array`
        );
      }

      setTweets(data.data.slice(0, 10)); // Get the 10 most recent tweets
    } catch (err) {
      console.error(`Error in fetchTweets:`, err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { tweets, loading, error, fetchTweets };
};

export default useFetchTweets;
