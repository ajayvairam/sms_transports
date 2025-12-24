🚚 SMS Transports – Transportation Management System

SMS Transports is a web-based transportation management system designed to streamline truck operations, trip tracking, and financial transparency between Admin, Owner, and Drivers.

The system is built with a React frontend and Django backend, following a role-based access model with secure login and clear responsibility separation.

✨ Key Features
🔐 Role-Based Access

Admin

Creates and manages Owners & Drivers

Assigns trucks and transportation orders

Uploads and manages documents (RC, insurance, pollution, axle details)

Full control over system data

Owner

Read-only dashboard

View trips, expenses, money flow, and uploaded bills

Cannot modify data

Driver

Simple interface

View assigned money

Update trip expenses

Upload bills during trips

💰 Financial Transparency

Track money sent, spent, and remaining

Bill uploads linked to trips

Chat-like transaction timeline for clarity

🛠️ Tech Stack
Frontend

React.js

JavaScript

HTML, CSS

Axios (API communication)

Backend

Python

Django

Django REST Framework

JWT Authentication

Database

SQLite (Development)

MySQL (Production-ready)

📁 Project Structure
sms_transports/
├── backend/          # Django backend
│   ├── manage.py
│   ├── apps/
│   └── media/
├── frontend/         # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/ajayvairam/sms_transports.git
cd sms_transports

2️⃣ Frontend Setup
cd frontend
npm install
npm start


Frontend will run on:

http://localhost:3000

3️⃣ Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


Backend will run on:

http://localhost:8000

🔒 Authentication

No public signup

Admin assigns ID & Password for Owners and Drivers

Secure role-based login

📌 Future Enhancements

Live GPS tracking

Driver attendance system

Automated invoice generation

Notification & alerts

Mobile app version

👨‍💻 Author

Ajay Vairam
📍 Madurai, Tamil Nadu
🎓 B.Tech – Computer Science & Engineering
🔗 GitHub: https://github.com/ajayvairam

🔗 LinkedIn: https://linkedin.com/in/ajayvairamt

⭐ Support

If you find this project useful, please ⭐ star the repository.
It helps a lot!
