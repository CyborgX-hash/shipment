# Smart Supply - Real-Time Shipment Tracking System

A full-stack web application designed for real-time tracking, management, and simulation of shipments. The project consists of a React-based frontend and a Node.js/Express backend integrated with MongoDB and Socket.io for live updates.

## Architecture
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Google Maps API, Socket.io-client.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io.
- **Simulation Engine**: A custom logic engine running on the backend that simulates real-time shipment movements across defined waypoints, seamlessly updating clients via WebSockets.

## Features
- **Dashboard**: High-level overview of active shipments, delayed shipments, and system alerts.
- **Live Map**: Real-time visualization of shipment locations and routes using Google Maps.
- **Shipments Management**: View and filter all shipments by status (On-time, Delayed, High Risk, Delivered).
- **Analytics & Alerts**: Track performance metrics and receive risk alerts.
- **Simulation Engine**: Backend service updating shipment coordinates automatically at defined intervals, simulating real-world movement and delivery status changes.

## Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Running locally or via MongoDB Atlas)
- Google Maps API Key (For frontend map rendering)

## Getting Started

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file based on `.env.example` in the backend directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-supply
```

Start the backend development server:
```bash
npm run dev
```

### 2. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file based on `.env.example` in the frontend directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

## Project Structure

```text
shipment_track/
├── backend/
│   ├── models/          # Mongoose database schemas (Shipment.js)
│   ├── routes/          # Express API endpoints
│   ├── services/        # Core logic, including logicEngine.js for simulation
│   ├── server.js        # Entry point and WebSocket (Socket.io) setup
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # React components (Dashboard, LiveMap, etc.)
    │   ├── services/    # API calls and Socket connection handlers
    │   ├── hooks/       # Custom React hooks
    │   ├── App.tsx      # Main application component
    │   └── types.ts     # TypeScript definitions
    ├── vite.config.ts   # Vite bundler configuration
    └── package.json
```

## Usage
Once both the backend and frontend servers are running, access the application via your browser at `http://localhost:5173`. You can view active shipments and switch to the **Live Map** tab. The backend logic engine continuously calculates the progress of shipments along their routes and broadcasts their real-time coordinates, which the frontend renders dynamically.
