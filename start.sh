#!/bin/bash

# RFLCTN - Start All Services

echo "🚀 Starting RFLCTN Services..."
echo ""

# Start Backend API
echo "📡 Starting Backend API on http://localhost:8000"
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start Frontend
echo "🎨 Starting Frontend on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "Backend API: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
