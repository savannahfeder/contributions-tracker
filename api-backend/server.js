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
const serviceAccount = require("./ServiceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Firestore
const db = admin.firestore();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
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

    const contributions = contributionDays.map((day) => ({
      date: new Date(day.date),
      count: day.contributionCount,
    }));

    res.json(contributions);
  } catch (error) {
    console.error("An error occurred while fetching GitHub contributions:");
    if (error.response) {
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);
      console.error("Error headers:", error.response.headers);
      res.status(error.response.status).json({
        error: "An error occurred while fetching GitHub contributions",
        details: error.response.data,
      });
    } else if (error.request) {
      console.error("Error request:", error.request);
      res.status(500).json({
        error: "No response received from GitHub API",
        details: "The request was made but no response was received",
      });
    } else {
      console.error("Error message:", error.message);
      res.status(500).json({
        error: "An error occurred while setting up the request",
        details: error.message,
      });
    }
    console.error("Error config:", error.config);
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

    console.log("New tweet added to Firestore with ID: ", tweetRef.id);

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
