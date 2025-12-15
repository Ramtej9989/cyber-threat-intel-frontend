# 🛡️ Cyber Threat Intelligence & SOC Analytics – Frontend

A modern, responsive SOC dashboard built using Next.js that visualizes security logs, alerts, threat intelligence, and entity risk scores in near real time.

This frontend connects to a FastAPI backend and simulates how real-world Security Operations Center (SOC) dashboards work.

---

## 🌐 Live Application

Frontend (Vercel):  
https://cyber-threat-intel-frontend.vercel.app

Backend API (Render):  
https://cyber-threat-intel-analytics.onrender.com

---

## 🎯 Project Goal

To design a professional SOC-style dashboard that:
- Visualizes cyber security data clearly
- Displays alerts, logs, and threats in real time
- Enables analysts to investigate incidents
- Demonstrates full-stack cybersecurity application development

---

## 🧠 Key Features

- Secure login using credentials (NextAuth)
- Interactive SOC dashboard with charts & tables
- Network & authentication log visualization
- Alert monitoring and status management
- Threat intelligence exploration
- Entity risk score tracking (Users, IPs, Hosts)
- Fully responsive UI (desktop & tablet)
- Clean, SOC-inspired design

---

## 🛠️ Tech Stack

Framework: Next.js (App Router)  
Language: TypeScript  
UI: Tailwind CSS  
Auth: NextAuth (Credentials Provider)  
Charts: Chart.js / Recharts  
Deployment: Vercel  

---

## 📂 Project Structure

cyber-threat-intel-frontend/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── alerts/
│   │   ├── entities/
│   │   ├── threat-intel/
│   │   └── logs/
│   ├── api/
│   │   └── auth/[...nextauth]/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── charts/
│   ├── alerts/
│   ├── entities/
│   └── layout/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
├── public/
├── package.json
└── README.md

---

## ⚙️ Environment Variables

Set the following environment variables in **Vercel**:

NEXT_PUBLIC_API_URL=https://cyber-threat-intel-analytics.onrender.com  
NEXTAUTH_URL=https://cyber-threat-intel-frontend.vercel.app 
NEXTAUTH_SECRET=your_nextauth_secret  
MONGODB_URI=your_mongodb_connection_string  

---

## 🔐 Authentication Flow

- Uses **NextAuth Credentials Provider**
- User credentials are validated against MongoDB
- JWT-based session management
- Role-based access support (admin / analyst)

---

## 📊 Dashboard Modules

### Dashboard
- Alerts overview
- Risk score charts
- Severity distribution
- Activity timeline

### Alerts
- View and update alert status
- Severity-based styling
- Pagination & filtering

### Logs
- Network logs
- Authentication logs
- Timeline-based inspection

### Entities
- Risk scoring for Users, IPs, Hosts
- Visual risk indicators
- Recalculation support

### Threat Intelligence
- Indicators of Compromise (IOCs)
- Source attribution
- Threat severity analysis

---

## ▶️ Run Locally

```bash
npm install
npm run dev
