const express = require("express");
const cors = require("cors");
const axios = require("axios");
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");
require("dotenv").config();

// Add Firebase Admin SDK
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Firestore
const db = admin.firestore();

const app = express();

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());

// Set up multer for handling file uploads
const upload = multer({ dest: "uploads/" });

const oauth = OAuth({
  consumer: {
    key: process.env.TWITTER_API_KEY,
    secret: process.env.TWITTER_API_SECRET,
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

const token = {
  key: process.env.TWITTER_ACCESS_TOKEN,
  secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
};

app.get("/api/github-contributions", async (req, res) => {
  const githubToken = process.env.GITHUB_TOKEN;

  const query = `
    query {
      viewer {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      { query },
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const contributionDays =
      response.data.data.viewer.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) => week.contributionDays
      );

    res.json(
      contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
      }))
    );
  } catch (error) {
    console.error("Error fetching GitHub contributions:", error);
    res.status(500).json({ error: "Failed to fetch GitHub contributions" });
  }
});

async function uploadMedia(file) {
  const mediaType = file.mimetype;
  const mediaData = fs.readFileSync(file.path);

  const uploadUrl = "https://upload.twitter.com/1.1/media/upload.json";

  const form = new FormData();
  form.append("media", mediaData, {
    filename: file.originalname,
    contentType: mediaType,
  });
  form.append("media_category", "tweet_image");

  const authHeader = oauth.toHeader(
    oauth.authorize(
      {
        url: uploadUrl,
        method: "POST",
      },
      token
    )
  );

  try {
    const response = await axios.post(uploadUrl, form, {
      headers: {
        ...authHeader,
        ...form.getHeaders(),
      },
    });

    // Clean up the uploaded file
    fs.unlinkSync(file.path);

    return response.data.media_id_string;
  } catch (error) {
    console.error(
      "Error uploading media:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

app.post("/api/create-tweet", upload.single("media"), async (req, res) => {
  const { text } = req.body;
  let mediaId;

  try {
    if (req.file) {
      mediaId = await uploadMedia(req.file);
    }

    const createTweetUrl = "https://api.twitter.com/2/tweets";
    const tweetData = { text };
    if (mediaId) {
      tweetData.media = { media_ids: [mediaId] };
    }

    const oauthHeader = oauth.toHeader(
      oauth.authorize(
        {
          url: createTweetUrl,
          method: "POST",
        },
        token
      )
    );

    const createTweetResponse = await axios.post(createTweetUrl, tweetData, {
      headers: {
        ...oauthHeader,
        "Content-Type": "application/json",
      },
    });

    // Add the new tweet to Firestore
    const tweetRef = await db.collection("tweets").add({
      date: admin.firestore.FieldValue.serverTimestamp(),
      text: text,
    });

    res.json({
      ...createTweetResponse.data,
      isDraft: false,
      firestoreId: tweetRef.id,
      text: text,
    });
  } catch (error) {
    console.error("Error adding tweet to Firestore:", error.message);
    res.status(500).json({
      error: "An error occurred while adding the tweet to Firestore",
      details: error.message,
    });
  }
});

app.get("/api/tweets", async (req, res) => {
  try {
    const tweetsSnapshot = await db.collection("tweets").get();
    const tweets = tweetsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        date: data.date.toDate().toISOString().split("T")[0],
        count: 1,
      };
    });

    const groupedTweets = tweets.reduce((acc, tweet) => {
      if (acc[tweet.date]) {
        acc[tweet.date].count += tweet.count;
      } else {
        acc[tweet.date] = tweet;
      }
      return acc;
    }, {});

    const sortedTweets = Object.values(groupedTweets).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    res.json(sortedTweets);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch tweets", details: error.message });
  }
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${server.address().port}`);
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.log("Address in use, retrying...");
    setTimeout(() => {
      server.close();
      server.listen(0); // This will choose a random available port
    }, 1000);
  }
});
