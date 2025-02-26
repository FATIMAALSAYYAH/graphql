#!/bin/bash

# Step 1: Create a new React project
echo "Creating a new React project..."
npx create-react-app graphql-profile-project

# Step 2: Navigate into the project directory
cd graphql-profile-project || { echo "Failed to create project directory!"; exit 1; }

# Step 3: Install required dependencies
echo "Installing required dependencies..."
npm install @headlessui/react tailwindcss postcss autoprefixer
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import

# Step 4: Initialize TailwindCSS
echo "Initializing TailwindCSS..."
npx tailwindcss init -p

# Step 5: Update TailwindCSS configuration
echo "Configuring TailwindCSS..."
cat > tailwind.config.js <<EOL
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
EOL

# Step 6: Update CSS to use Tailwind
echo "Updating CSS to use Tailwind..."
cat > src/index.css <<EOL
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

# Step 7: Create the main App component with the project code
echo "Creating the main App component..."
cat > src/App.js <<'EOL'
import React, { useState, useEffect } from "react";

const GRAPHQL_ENDPOINT = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";
const LOGIN_ENDPOINT = "https://learn.reboot01.com/api/auth/signin";

function App() {
  const [token, setToken] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [xpHistory, setXpHistory] = useState([]);
  const [projectGrades, setProjectGrades] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    setLoading(true);
    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
        setLoginError("");
      } else {
        setLoginError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setLoginError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        try {
          const response = await fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              query: `{
                user {
                  id
                  login
                }
                transaction(where: {type: {_eq: "xp"}}) {
                  amount
                  createdAt
                }
                progress(where: {grade: {_eq: 1}}) {
                  objectId
                  grade
                }
              }`,
            }),
          });
          const { data } = await response.json();

          setProfileData(data.user[0]);
          setXpHistory(data.transaction);
          setProjectGrades(data.progress);
        } catch (err) {
          console.error("Error fetching profile data:", err);
        }
      };
      fetchProfile();
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    setProfileData(null);
    setXpHistory([]);
    setProjectGrades([]);
  };

  const renderXpGraph = () => {
    const maxXp = Math.max(...xpHistory.map((xp) => xp.amount));
    return (
      <svg viewBox="0 0 300 200" className="w-full h-48">
        {xpHistory.map((xp, index) => (
          <rect
            key={index}
            x={index * 30 + 10}
            y={200 - (xp.amount / maxXp) * 200}
            width="20"
            height={(xp.amount / maxXp) * 200}
            fill="blue"
          />
        ))}
        {xpHistory.map((xp, index) => (
          <text
            key={`label-${index}`}
            x={index * 30 + 20}
            y="190"
            fontSize="10"
            textAnchor="middle"
          >
            {new Date(xp.createdAt).getDate()}
          </text>
        ))}
      </svg>
    );
  };

  const renderProjectGradeGraph = () => {
    const passed = projectGrades.filter((p) => p.grade === 1).length;
    const failed = projectGrades.length - passed;

    const total = passed + failed;
    const passedPercentage = (passed / total) * 100;
    const failedPercentage = (failed / total) * 100;

    return (
      <svg viewBox="0 0 300 200" className="w-full h-48">
        <circle cx="150" cy="100" r="80" fill="#ddd" />
        <circle
          cx="150"
          cy="100"
          r="80"
          fill="blue"
          stroke="none"
          strokeWidth="10"
          strokeDasharray={`${passedPercentage} ${100 - passedPercentage}`}
          transform="rotate(-90 150 100)"
        />
        <text x="150" y="100" textAnchor="middle" fontSize="18" fill="black">
          {passedPercentage.toFixed(1)}% Passed
        </text>
      </svg>
    );
  };

  return (
    <div className="p-4">
      {!token ? (
        <div className="max-w-md mx-auto p-4 border rounded shadow">
          <h1 className="text-lg font-bold mb-4">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username or Email"
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border p-2 rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          {loginError && <p className="text-red-500 mt-2">{loginError}</p>}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto p-4 border rounded shadow">
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded mb-4"
          >
            Logout
          </button>
          <h1 className="text-xl font-bold mb-4">Profile</h1>
          {profileData && (
            <div className="mb-4">
              <p>
                <strong>Username:</strong> {profileData.login}
              </p>
              <p>
                <strong>ID:</strong> {profileData.id}
              </p>
            </div>
          )}
          <h2 className="text-lg font-bold mb-2">XP History</h2>
          {renderXpGraph()}
          <h2 className="text-lg font-bold mb-2">Project Grades</h2>
          {renderProjectGradeGraph()}
        </div>
      )}
    </div>
  );
}

export default App;
EOL

# Step 8: Start the development server
echo "Starting the development server..."
npm start