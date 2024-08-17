const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());

app.get("/api/tweets/:username", async (req, res) => {
  const { username } = req.params;
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  try {
    // Fetch user ID
    const userResponse = await axios.get(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    );

    const userId = userResponse.data.data.id;

    // Fetch tweets
    const tweetsResponse = await axios.get(
      `https://api.twitter.com/2/users/${userId}/tweets`,
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    );

    res.json(tweetsResponse.data);
  } catch (error) {
    console.error("An error occurred:");
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);
      console.error("Error headers:", error.response.headers);
      res.status(error.response.status).json({
        error: "An error occurred while fetching tweets",
        details: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request:", error.request);
      res.status(500).json({
        error: "No response received from Twitter API",
        details: "The request was made but no response was received",
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
      res.status(500).json({
        error: "An error occurred while setting up the request",
        details: error.message,
      });
    }
    console.error("Error config:", error.config);
  }
});

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Twitter Bearer Token: ${
      process.env.TWITTER_BEARER_TOKEN ? "Set" : "Not set"
    }`
  );
  console.log(`GitHub Token: ${process.env.GITHUB_TOKEN ? "Set" : "Not set"}`);
});
