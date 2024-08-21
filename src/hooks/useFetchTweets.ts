import { useState, useEffect } from "react";
import { parseISO, addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface RawTweet {
  date: string;
  count: number;
}

export interface Tweet {
  date: Date;
  count: number;
}

export const useFetchTweets = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tweets?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tweets");
        }
        const data: RawTweet[] = await response.json();

        const processedTweets = data.map((tweet: RawTweet) => {
          const utcDate = parseISO(tweet.date);
          const adjustedDate = addDays(utcDate, 1);
          const pstDate = toZonedTime(adjustedDate, "America/Los_Angeles");
          return {
            date: pstDate,
            count: tweet.count,
          };
        });

        setTweets(processedTweets);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, [API_URL]);

  return { tweets, loading, error };
};
