# Nexus AI - Operational Command Center

A cyberpunk-themed, dynamic workload management and AI-powered operational dashboard. This dashboard includes real-time telemetry, user management, and AI-driven insights for complex system operations.

## Features
- **Admin Dashboard**: Comprehensive operator directory and global system process supervisor.
- **Role-Based Access Control**: Differentiates between Fleet Admirals (Admins) and standard operators.
- **Live Telemetry & Resource Node Status**: Real-time websocket-driven updates for server and GPU cluster statuses.
- **Dynamic Task Queues**: Live filtering of system tasks scoped down to specific Node Operator IDs.
- **Dockerized Architecture**: Fully separated Frontend (React/Vite/Nginx) and Backend (FastAPI/Python/Uvicorn) deployments.

---

## 🚀 How to Run (Using Docker)

The easiest and most reliable way to run the entire Nexus-AI platform is using Docker Compose. This automatically spins up both the NGINX frontend web server and the Python FastAPI backend simultaneously.

### 1. Prerequisites
- Install **Docker** & **Docker Desktop** (or Docker Engine on Linux).

### 2. Set Up Environment Variables
Create a file named `.env` in the root folder (or copy `.env.local` to `.env`) and add your Gemini API Key:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Run the Application
Open your terminal in this repository folder and run:
```bash
docker-compose up --build
```
*(To run it safely in the background, you can use `docker-compose up -d --build`)*

### 4. Access the Platform
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API (FastAPI Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

**Default Admin Login:**
- **Email:** `admin@nexus.ai`
- **Password:** `admin123` (or any password on your first sign up)

---

## 🛠 Manual Local Setup (Without Docker)

If you prefer to run the components natively on your machine:

### Backend Setup
1. Open a terminal and navigate to the root directory.
2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup
1. Open a separate terminal and navigate to the root directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).
