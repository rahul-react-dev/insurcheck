#!/bin/bash

# Start backend server in the background
echo "🚀 Starting backend server..."
NODE_ENV=development tsx server/index.ts &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 3

# Start frontend client
echo "🌐 Starting frontend client..."
cd client-admin && npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID