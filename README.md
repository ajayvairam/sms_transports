# 🚚 SMS Transports – Transportation Management System

SMS Transports is a web-based transportation management system designed to streamline truck operations, trip tracking, and financial transparency between Admin, Owner, and Drivers.

The system uses a React frontend and a Django backend with role-based authentication and controlled access.

---

## ✨ Key Features

### 🔐 Role-Based Access
Admin
- Creates and manages Owners and Drivers
- Assigns trucks and transportation orders
- Uploads and manages documents (RC, insurance, pollution, axle details)
- Full system control

Owner
- Read-only dashboard
- View trips, expenses, money flow, and uploaded bills
- Cannot modify data

Driver
- Simple interface
- View assigned money
- Update trip expenses
- Upload bills during trips

---

### 💰 Financial Transparency
- Track money sent, spent, and remaining
- Bills linked to trips
- Chat-like transaction timeline

---

## 🛠️ Tech Stack

Frontend
- React.js
- JavaScript
- HTML
- CSS
- Axios

Backend
- Python
- Django
- Django REST Framework
- JWT Authentication

Database
- SQLite (Development)
- MySQL (Production-ready)

---

## 📁 Project Structure

sms_transports/
- backend/
  - manage.py
  - apps/
  - media/
- frontend/
  - src/
  - public/
  - package.json
  - README.md
- .gitignore
- README.md

---

## 🚀 Getting Started

Clone the repository
git clone https://github.com/ajayvairam/sms_transports.git
cd sms_transports

Frontend setup
cd frontend
npm install
npm start

Frontend runs at
http://localhost:3000

Backend setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Backend runs at
http://localhost:8000

---

## 🔒 Authentication
- No public signup
- Admin assigns login credentials
- Role-based access control

---

## 📌 Future Enhancements
- Live GPS tracking
- Driver attendance system
- Invoice generation
- Notifications and alerts
- Mobile app support

---

## 👨‍💻 Author

Ajay Vairam  
Madurai, Tamil Nadu  
B.Tech – Computer Science & Engineering  

GitHub: https://github.com/ajayvairam  
LinkedIn: https://linkedin.com/in/ajayvairamt  

---

## ⭐ Support
If you like this project, give it a star on GitHub.
