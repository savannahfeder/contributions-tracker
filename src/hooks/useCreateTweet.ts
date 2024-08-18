import { useState } from "react";

interface CreateTweetParams {
  text: string;
  media?: File;
}

interface CreateTweetResult {
  id: string;
  text: string;
}

export const useCreateTweet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTweet = async ({
    text,
    media,
  }: CreateTweetParams): Promise<CreateTweetResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("text", text);
      if (media) {
        formData.append("media", media);
      }

      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

      const response = await fetch(API_URL + "/api/create-tweet", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the tweet"
      );
      return null;
    }
  };

  return { createTweet, isLoading, error };
};
