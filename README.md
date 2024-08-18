# GitHub and Twitter Contribution Tracker

This contribution tracker motivates you to be more consistent with GitHub commits and Twitter posts.

![image](https://github.com/user-attachments/assets/640bc95d-58cc-47f0-b6b5-033065ebf9bd)


## Features

- GitHub & Twitter contribution visualization
- Tweet publishing functionality
- Firestore integration for data persistence

## Tech Stack

- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: Firebase Firestore

## Prerequisites

Before you begin, ensure you have the following:
- Node.js and npm installed
- A GitHub account and personal access token
- A Twitter Developer account with API keys and tokens
- A Firebase project set up with Firestore

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies for both frontend and backend

## Configuration

Create a .env file in the root directory and another in the frontend directory. Add the following variables to the respective files:

Root .env (for backend):

- TWITTER_BEARER_TOKEN
- GITHUB_TOKEN
- TWITTER_API_KEY
- TWITTER_API_SECRET
- TWITTER_ACCESS_TOKEN
- FRONTEND_URL
- PORT (default is 3001)
- FIREBASE_SERVICE_ACCOUNT_KEY

Frontend .env:

- REACT_APP_GITHUB_TOKEN
- REACT_APP_GITHUB_USERNAME
- REACT_APP_FIREBASE_API_KEY
- REACT_APP_FIREBASE_AUTH_DOMAIN
- REACT_APP_FIREBASE_PROJECT_ID
- REACT_APP_FIREBASE_STORAGE_BUCKET
- REACT_APP_FIREBASE_MESSAGING_SENDER_ID
- REACT_APP_FIREBASE_APP_ID
- REACT_APP_API_URL (use 'http://localhost:3001' for local development)

## Usage

1. Start the backend server
2. In a separate terminal, start the frontend development server
3. Open your browser and navigate to the local address shown in your terminal (typically http://localhost:3000)

## Features and How to Use

1. GitHub Contributions: The app will automatically fetch and display your GitHub contribution graph using the provided GitHub token and username.

2. Tweet Publishing: Use the interface to compose and publish tweets. This feature helps track your Twitter activity since the API doesn't allow direct fetching of tweets.

3. Activity Dashboard: View your combined GitHub and Twitter activity in a single dashboard.

## Contributing

Contributions are more than welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your fork
5. Submit a pull request

## Troubleshooting

- Ensure all environment variables are correctly set
- Check your API keys and tokens if you encounter authentication issues
- For local development, make sure both frontend and backend servers are running

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository or message @savannahfeder on Twitter.
