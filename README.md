<div align="center">
  <br />
    <a href="https://github.com/AdamMechaeil/lms">
      <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge&logo=github" alt="Status Production Ready">
    </a>
  <br />
  
  # 🚀 LMS
  ### Enterprise-Grade Learning Management System
  
  <p class="text-center">
    A scalable, containerized platform for coaching institutes.
    <br />
    Features <b>Real-Time Analytics</b>, <b>Automated Attendance</b>, and <b>Role-Based Access Control (RBAC)</b>.
  </p>
</div>

<br />

## 🛠️ The Tech Stack (Engineered for Scale)

| **Component** | **Technology** |
| :--- | :--- |
| **Frontend** | `Next.js 14` `TypeScript` `TailwindCSS` `Framer Motion` |
| **Backend** | `Node.js` `Express` `Socket.io` `MongoDB (Aggregations)` |
| **Cloud & Storage** | `AWS S3` (Material Storage) `Docker` `Nginx` |
| **Security** | `JWT (HttpOnly)` `RBAC Middleware` |

<br />

## ⚡ Key Features (Production Ready)

### 1. 📊 Real-Time Analytics & Dashboard
- **Live Updates:** `Socket.io` pushes new leads, payments, and student activity instantly to the Admin Dashboard.
- **Data Pipeline:** Optimized **MongoDB Aggregation Pipelines** to calculate monthly revenue and student growth in milliseconds.
- **Visuals:** Dark-mode compatible charts using `Recharts`.

### 2. 🔐 Role-Based Access Control (RBAC)
- **Three-Tier Architecture:** Distinct portals for **Super Admin**, **Trainers**, and **Students**.
- **Secure Middleware:** Custom authenticators (`adminAuthenticator.ts`, `commonAuthenticator.ts`) ensure strict data isolation.

### 3. ☁️ Cloud-Native Asset Management
- **AWS S3 Integration:** Securely upload and stream course materials (PDFs, Videos) via signed URLs.
- **Dockerized:** Fully containerized setup (`docker-compose.yml`) for consistent local and production environments.

<br />

<br />

## 🚀 How to Run Locally

This project is fully containerized. You can spin up the entire stack (Frontend + Backend + DB) with one command.

### 1. Clone & Setup
```bash
git clone [https://github.com/AdamMechaeil/lms.git](https://github.com/AdamMechaeil/lms.git)
cd lms
```

### 2. Environment Variables
Create a `config.env` file in `/server/src/config`:
```env
PORT=8000
MONGO_URI=mongodb://mongo:27017/lms
JWT_SECRET=your_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_bucket
```
Create a `.env` file in `/client`:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=Your google client secret<img width="1912" height="968" alt="Screenshot 2026-02-10 055154" src="https://github.com/user-attachments/assets/bd08bf48-3d2f-475a-bc60-5df279184988" />
<img width="1912" height="968" alt="Screenshot 2026-02-10 055154" src="https://github.com/user-attachments/assets/34c0fa3c-6037-43ab-8d1f-b03e069f8056" />

```

### 3. Run with Docker 🐳
```bash
docker-compose up --build
```
- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:8000`

<br />

## 🔮 Roadmap (In Development)

- [ ] **CRM Module:** Lead tracking pipeline and conversion analytics.
- [ ] **Finance Engine:** Student EMI tracking and payment gateway integration.
- [ ] **Automated Emails:** Trigger-based notifications for attendance and due fees.

---
<div align="center">
  Created by <a href="https://github.com/AdamMechaeil">Adam Mechaeil</a>
</div>
