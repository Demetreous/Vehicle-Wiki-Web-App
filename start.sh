#!/bin/bash

# Navigate to backend directory and run uvicorn
cd backend || exit
uvicorn backend:app --host 0.0.0.0 --port 8000 --reload &

# Wait for the backend to start (you can adjust the sleep time if needed)
sleep 5

# Go back to the parent directory
cd ..

# Navigate to frontend and run npm dev
cd frontend || exit
npm run dev &

# Wait for the link to be output (you might need to adjust this based on when it's ready)
sleep 10

# Automatically open the link for Vite
open http://localhost:5173

