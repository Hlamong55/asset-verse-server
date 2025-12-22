# AssetVerse 🧩  
A modern Corporate Asset Management System for HR Managers and Employees

## 📌 Project Purpose
AssetVerse is a B2B (Business-to-Business) full-stack web application designed to help organizations manage company assets efficiently.  
HR managers can track, assign, approve, and analyze assets, while employees can request, manage, and return assigned assets — all from a centralized dashboard.

---

## 🌐 Live Website
🔗 **Live URL:** https://asset-verse-5bd83.web.app/  
🔗 **Server URL:** https://asset-verse-server-lilac-sigma.vercel.app  

---

## 👤 User Roles
### 🔹 HR Manager
- Manage company assets
- Approve or reject employee asset requests
- Assign assets automatically on approval
- Track employees and company affiliations
- Upgrade subscription packages
- View analytics & payment history

### 🔹 Employee
- Request assets from affiliated companies
- View assigned assets
- Return returnable assets
- View team members
- Manage personal profile

---

## ✨ Key Features

### 🧑‍💼 HR Dashboard
- Asset List with **search, pagination, edit & delete**
- Request approval system with **package employee limit validation**
- Employee list with asset count
- Dynamic charts:
  - 📊 Pie chart (Returnable vs Non-returnable)
  - 📈 Bar chart (Top requested assets)
- Package upgrade with **Stripe payment**
- Payment history tracking

### 👨‍💻 Employee Dashboard
- View assigned assets (from all companies)
- Search & filter assets by type
- Return assets (if returnable)
- Print asset list
- My Team page with:
  - Company-based colleagues
  - Upcoming birthdays
- Profile management with photo upload

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based route protection
- Secure API calls with Axios interceptors

---

## 🧱 Tech Stack

### Frontend
- **React**
- **React Router**
- **Tailwind CSS**
- **DaisyUI**
- **React Hook Form**
- **TanStack React Query**
- **Framer Motion**
- **SweetAlert2**
- **Axios**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT Authentication**
- **Stripe API**

---

## 📦 NPM Packages Used

### Frontend
```bash
react
react-router-dom
@tanstack/react-query
react-hook-form
axios
sweetalert2
framer-motion
react-icons

### Backend
express
cors
dotenv
mongodb
jsonwebtoken
stripe

---

### 🚀 How to Run Locally

## Frontend
npm install
npm run dev

## Backend
npm install
nodemon index.js

## Environment Variables
DB_USER=your_db_user
DB_PASS=your_db_password
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
CLIENT_URL=http://localhost:5173

