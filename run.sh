#!/bin/bash

# Finance App Run Script
# Starts both backend and frontend servers

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starting Finance App ===${NC}\n"

# Global variables for process IDs
BACKEND_PID=""
FRONTEND_PID=""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    
    # Kill frontend (including all child processes)
    if [ ! -z "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping frontend...${NC}"
        pkill -P $FRONTEND_PID 2>/dev/null || true
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}Frontend stopped${NC}"
    fi
    
    # Kill backend
    if [ ! -z "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping backend...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}Backend stopped${NC}"
    fi
    
    exit 0
}

# Trap Ctrl+C and errors
trap cleanup SIGINT SIGTERM EXIT

# Function to kill existing processes
kill_existing_processes() {
    echo -e "${YELLOW}Checking for existing processes...${NC}"
    
    # Kill existing backend processes (Java processes running the financeapp JAR)
    EXISTING_BACKEND=$(ps aux | grep "[j]ava.*financeapp.*jar" | awk '{print $2}')
    if [ ! -z "$EXISTING_BACKEND" ]; then
        echo -e "${YELLOW}Stopping existing backend processes...${NC}"
        echo "$EXISTING_BACKEND" | xargs kill -9 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}Existing backend processes stopped${NC}"
    fi
    
    # Kill existing frontend processes (React dev server on port 3000)
    EXISTING_FRONTEND=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$EXISTING_FRONTEND" ]; then
        echo -e "${YELLOW}Stopping existing frontend processes...${NC}"
        echo "$EXISTING_FRONTEND" | xargs kill -9 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}Existing frontend processes stopped${NC}"
    fi
    
    # Also kill any node processes related to react-scripts
    EXISTING_NODE=$(ps aux | grep "[n]ode.*react-scripts" | awk '{print $2}')
    if [ ! -z "$EXISTING_NODE" ]; then
        echo -e "${YELLOW}Stopping existing React processes...${NC}"
        echo "$EXISTING_NODE" | xargs kill -9 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}Existing React processes stopped${NC}"
    fi
    
    echo ""
}

# Kill any existing processes before starting
kill_existing_processes

# Check if Maven wrapper exists
if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    MVN_CMD="./mvnw"
elif command -v mvn >/dev/null 2>&1; then
    MVN_CMD="mvn"
else
    echo -e "${RED}Error: Maven not found. Please install Maven or ensure ./mvnw exists.${NC}"
    exit 1
fi

# Check if Java is available
if ! command -v java >/dev/null 2>&1; then
    echo -e "${RED}Error: Java not found. Please install Java 17 or higher.${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}Error: Node.js not found. Please install Node.js.${NC}"
    exit 1
fi

# Check if npm is available
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}Error: npm not found. Please install npm.${NC}"
    exit 1
fi

# Configure Gemini API Key (optional - for enhanced recommendations)
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}Note: GEMINI_API_KEY not set. Recommendations will use simple keyword matching.${NC}"
    echo -e "${YELLOW}To enable Gemini AI recommendations, set GEMINI_API_KEY environment variable.${NC}"
    echo -e "${YELLOW}Get your API key from: https://makersuite.google.com/app/apikey${NC}\n"
else
    export GEMINI_API_KEY
    echo -e "${GREEN}Gemini API Key configured for enhanced recommendations${NC}\n"
fi

# Check if JAR exists, if not build it
if [ ! -f "target/financeapp-0.0.1-SNAPSHOT.jar" ]; then
    echo -e "${YELLOW}Building backend...${NC}"
    if ! $MVN_CMD clean package -DskipTests; then
        echo -e "${RED}Error: Backend build failed.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Backend build complete${NC}\n"
fi

# Start backend in background (with environment variables)
echo -e "${GREEN}Starting backend on port 8080...${NC}"
GEMINI_API_KEY="$GEMINI_API_KEY" java -jar target/financeapp-0.0.1-SNAPSHOT.jar > backend.log 2>&1 &
BACKEND_PID=$!

# Wait a bit and check if backend started successfully
sleep 5
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Error: Backend failed to start. Check backend.log for details.${NC}"
    exit 1
fi

echo -e "${GREEN}Backend started (PID: $BACKEND_PID)${NC}\n"

# Start frontend
echo -e "${GREEN}Starting frontend on port 3000...${NC}"
cd frontend || {
    echo -e "${RED}Error: frontend directory not found.${NC}"
    exit 1
}

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    if ! npm install; then
        echo -e "${RED}Error: Frontend dependencies installation failed.${NC}"
        cd ..
        exit 1
    fi
fi

# Start frontend (BROWSER=none prevents auto-opening browser)
BROWSER=none npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a bit and check if frontend started successfully
sleep 3
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}Error: Frontend failed to start. Check frontend.log for details.${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}\n"

echo -e "${GREEN}✓ Both servers are running!${NC}"
echo -e "${YELLOW}Backend: http://localhost:8080${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}\n"

# Wait for both processes (or until one exits)
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true

