import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface Tweet {
  id: string;
  date: Date;
  text: string;
}

export const useFetchTweets = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const tweetsRef = collection(db, "tweets");
        const q = query(tweetsRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedTweets = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        })) as Tweet[];

        setTweets(fetchedTweets);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch tweets");
        setLoading(false);
      }
    };

    fetchTweets();
  }, []);

  return { tweets, loading, error };
};
