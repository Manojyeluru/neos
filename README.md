# Technical Event Review Management System

A comprehensive, production-ready platform designed for managing technical hackathons and events. This system facilitates the entire lifecycle of an event, from team registration and problem statement selection to multi-round evaluations by reviewers and administrative oversight.

## 🚀 Key Features

### 👤 Role-Based Portals
- **Admin Dashboard**: 
  - Manage problem statements (Upload, Edit, Delete).
  - Configure evaluation rounds.
  - Assign and manage reviewers.
  - View a global overview of all participating teams and their progress.
- **Reviewer Dashboard**: 
  - Access assigned teams for evaluation.
  - Submit marks and qualitative feedback in real-time.
- **Team Leader Dashboard**: 
  - Automated team profile displays upon login.
  - View assigned problem statements and current evaluation status.

### 🛠 Technical Capabilities
- **Authentication**: Secure JWT-based authentication with role-specific access control.
- **Problem Management**: Support for uploading and managing complex problem statements.
- **Evaluation System**: Robust multi-round scoring system with feedback loops.
- **UI/UX**: Modern, premium glassmorphism design with a dark-themed aesthetic, utilizing Framer Motion for smooth transitions and Radix UI for accessible components.
- **Data Management**: Integration with MongoDB for persistent storage and specialized support for `.xlsx` file parsing for bulk data handling.

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Components**: Radix UI, Lucide React (Icons), Material UI (Icons)
- **Routing**: React Router 7

### Backend
- **Platform**: Node.js / Express
- **Database**: MongoDB (via Mongoose)
- **Security**: JWT (JSON Web Tokens), Bcrypt.js
- **File Handling**: Multer (Uploads), XLSX (Excel Parsing)

## 📁 Project Structure

```text
├── server/               # Node.js backend
│   ├── models/           # Mongoose schemas (User, Team, Problem, etc.)
│   ├── routes/           # API endpoints
│   ├── uploads/          # Local storage for uploaded files
│   └── index.js          # Entry point
├── src/                  # React frontend
│   ├── app/
│   │   ├── components/   # Modular UI components (Admin, Reviewer, Team Leader)
│   │   ├── routes.ts     # Frontend routing configuration
│   │   └── Root.tsx      # Main application layout
├── public/               # Static assets
└── tsconfig.json          # TypeScript configuration
```

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your MongoDB URI:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   ```
4. Start the server:
   ```bash
   node index.js
   ```

### 2. Frontend Setup
1. Navigate to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📈 Recent Updates
- ✅ Implemented Premium Glassmorphism UI.
- ✅ Integrated Reviewer and Team Leader dashboards with backend APIs.
- ✅ Added support for bulk problem statement uploads.
- ✅ Configured Firebase Hosting deployment settings.
- ✅ Fixed button functional issues across all major portals.

---
*Developed with ❤️ for high-performance event management.*