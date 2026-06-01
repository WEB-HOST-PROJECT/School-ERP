# SchoolERP - Production Deployment Guide

This guide provides step-by-step instructions to deploy the SchoolERP full-stack application to production.

## Tech Stack
- **Frontend**: React 19 + Vite (Hosted on Vercel)
- **Backend**: Node.js + Express (Hosted on Render)
- **Database**: SQLite3 (Render Persistent Disk)

---

## 1. Backend Deployment (Render)

### Step 1: Create a New Web Service
1. Connect your GitHub repository to [Render](https://render.com/).
2. Select the repository for SchoolERP.

### Step 2: Configure Settings
- **Name**: `school-erp-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 3: Add Environment Variables
Add the following in the **Environment** tab:
- `NODE_ENV`: `production`
- `PORT`: `5000`
- `FRONTEND_URL`: `https://your-frontend.vercel.app` (Update after frontend deployment)

### Step 4: Configure Persistent Disk (Crucial for SQLite)
1. Go to the **Disks** tab in your Render service settings.
2. Click **Add Disk**.
3. **Name**: `sqlite-data`
4. **Mount Path**: `/var/data`
5. **Size**: `1 GB` (or as needed)
6. **Note**: This ensures your `StudentDatabase.db` survives redeploys.

---

## 2. Frontend Deployment (Vercel)

### Step 1: Create a New Project
1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. Select the repository for SchoolERP.

### Step 2: Configure Settings
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Add Environment Variables
Add the following in the **Environment Variables** tab:
- `VITE_API_URL`: `https://your-backend.onrender.com` (Use your actual Render URL)

---

## 3. Security & Best Practices
- **CORS**: Only the specified `FRONTEND_URL` is allowed to access the backend API.
- **Security Headers**: Integrated via `Helmet`.
- **Rate Limiting**: Limits requests to 100 per 15 minutes per IP.
- **Error Handling**: Stack traces are hidden in production (`NODE_ENV=production`).
- **Database**: The SQLite database is stored on a persistent volume.

## 4. Local Development
To run the project locally:

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Maintenance
- To check server health: `GET https://your-backend.onrender.com/health`
- To update the database schema: Modifications in `backend/src/database/models.js` will automatically apply (if using `CREATE TABLE IF NOT EXISTS`).
