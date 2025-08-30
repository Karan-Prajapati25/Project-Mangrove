#!/bin/bash

echo "Starting Mangrove Guardian Development Environment..."
echo

echo "Starting Backend Server..."
cd server && npm run dev &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting Frontend Server..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo
echo "Development servers are starting..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers..."

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
