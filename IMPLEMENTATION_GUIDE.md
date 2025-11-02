# 🏫 DAV School Management System - Complete Implementation Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Features Implemented](#features-implemented)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [User Roles & Access](#user-roles--access)
10. [Database Schema](#database-schema)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

The DAV School Management System is a **full-stack web application** that provides:

### ✨ Core Features
- **Multi-Role Authentication System** (Admin, Staff, Parent, Student)
- **Attendance Management** with GPS & Photo verification
- **Fee Management** with Razorpay payment gateway integration
- **Learning Management System (LMS)** with content sharing
- **Grade Management** system
- **Salary Automation** based on attendance
- **Real-time Notifications**
- **Comprehensive Reports & Analytics**

### 👥 User Portals
1. **Admin Portal** - Complete system management
2. **Staff Portal** - Attendance, grades, LMS management
3. **Parent Portal** - Child tracking, fee payments
4. **Student Portal** - Attendance, grades, LMS access
5. **Public Website** - Information, admission, gallery

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js v16+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Payment Gateway:** Razorpay API
- **Security:** Helmet, CORS, bcryptjs
- **Email:** Nodemailer

### Frontend
- **Library:** React.js 18+
- **Routing:** React Router DOM v6
- **State Management:** Context API
- **HTTP Client:** Axios
- **UI Framework:** Tailwind CSS
- **Icons:** React Icons
- **Notifications:** React Hot Toast
- **Charts:** Chart.js & react-chartjs-2

---

## 📦 Features Implemented

### 🔐 Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password encryption with bcryptjs
- ✅ Protected routes on frontend
- ✅ Token refresh mechanism

### 👨‍💼 Admin Module
- ✅ Dashboard with statistics
- ✅ Student management (CRUD)
- ✅ Staff management (CRUD)
- ✅ Parent management (CRUD)
- ✅ Class & subject management
- ✅ Fee structure creation
- ✅ Salary management
- ✅ Reports generation

### 👨‍🏫 Staff Module
- ✅ Personal dashboard
- ✅ Self-attendance with GPS + Photo
- ✅ Student attendance marking
- ✅ Grade entry system
- ✅ LMS content upload
- ✅ Syllabus management
- ✅ Leave application
- ✅ Salary viewing

### 👨‍👩‍👧 Parent Module
- ✅ View children's attendance
- ✅ View grades & report cards
- ✅ Fee payment with Razorpay
- ✅ Download receipts
- ✅ View notifications
- ✅ Communication with teachers

### 👨‍🎓 Student Module
- ✅ View personal attendance
- ✅ View grades & results
- ✅ Access LMS materials
- ✅ Submit assignments
- ✅ View timetable
- ✅ View announcements

### 💰 Fee Management
- ✅ Fee structure by class
- ✅ Payment tracking
- ✅ Razorpay integration
- ✅ Receipt generation
- ✅ Late fee calculation
- ✅ Discount management

### 📊 Salary Management
- ✅ Automatic calculation
- ✅ Attendance-based deductions
- ✅ Allowances & deductions
- ✅ Monthly reports
- ✅ Payment tracking

### 📚 LMS Features
- ✅ Content upload (videos, PDFs, documents)
- ✅ Assignment creation & submission
- ✅ Assignment evaluation
- ✅ Access tracking
- ✅ Category management

### 📈 Reports & Analytics
- ✅ Attendance reports
- ✅ Fee collection reports
- ✅ Salary reports
- ✅ Grade reports
- ✅ Class-wise statistics

---

## 📁 Project Structure

```
School/
├── server/                      # Backend (Node.js + Express)
│   ├── models/                  # MongoDB Models (15+ models)
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Staff.js
│   │   ├── Parent.js
│   │   ├── Class.js
│   │   ├── Subject.js
│   │   ├── AttendanceStaff.js
│   │   ├── AttendanceStudent.js
│   │   ├── Grade.js
│   │   ├── Fee.js
│   │   ├── Salary.js
│   │   ├── LMSContent.js
│   │   ├── Notification.js
│   │   ├── Leave.js
│   │   └── Syllabus.js
│   │
│   ├── controllers/             # Request handlers
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── staffController.js
│   │   ├── parentController.js
│   │   ├── studentController.js
│   │   ├── feeController.js
│   │   ├── attendanceController.js
│   │   ├── gradeController.js
│   │   ├── lmsController.js
│   │   └── publicController.js
│   │
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── staff.js
│   │   ├── parent.js
│   │   ├── student.js
│   │   ├── fees.js
│   │   ├── attendance.js
│   │   ├── grades.js
│   │   ├── lms.js
│   │   └── public.js
│   │
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js             # Authentication & authorization
│   │   └── upload.js           # File upload (Multer)
│   │
│   ├── utils/                   # Helper functions
│   │   └── generateToken.js
│   │
│   └── server.js               # Entry point
│
├── client/                      # Frontend (React)
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── Layout.js
│   │   │   ├── DashboardLayout.js
│   │   │   └── ProtectedRoute.js
│   │   │
│   │   ├── context/             # React Context
│   │   │   └── AuthContext.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Public/          # Public website pages
│   │   │   │   ├── Home.js
│   │   │   │   ├── About.js
│   │   │   │   ├── Admission.js
│   │   │   │   ├── Gallery.js
│   │   │   │   └── Contact.js
│   │   │   │
│   │   │   ├── Auth/
│   │   │   │   └── Login.js
│   │   │   │
│   │   │   ├── Admin/           # Admin portal pages
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── ManageStudents.js
│   │   │   │   ├── ManageStaff.js
│   │   │   │   ├── ManageClasses.js
│   │   │   │   ├── ManageFees.js
│   │   │   │   └── Reports.js
│   │   │   │
│   │   │   ├── Staff/           # Staff portal pages
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── MarkAttendance.js
│   │   │   │   ├── ManageGrades.js
│   │   │   │   └── LMSManagement.js
│   │   │   │
│   │   │   ├── Parent/          # Parent portal pages
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── ChildAttendance.js
│   │   │   │   ├── ChildGrades.js
│   │   │   │   └── ChildFees.js
│   │   │   │
│   │   │   └── Student/         # Student portal pages
│   │   │       ├── Dashboard.js
│   │   │       ├── Attendance.js
│   │   │       ├── Grades.js
│   │   │       └── LMS.js
│   │   │
│   │   ├── App.js              # Main app with routing
│   │   ├── index.js            # Entry point
│   │   └── index.css           # Global styles
│   │
│   ├── package.json
│   └── tailwind.config.js
│
├── package.json                 # Root package.json
├── README.md                    # Project README
├── IMPLEMENTATION_GUIDE.md      # This file
└── .gitignore

```

---

## 🚀 Installation & Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - OR MongoDB Atlas account (cloud database)
- **npm** or **yarn** package manager
- **Git** (optional, for cloning)

### Step 1: Install Backend Dependencies

```bash
cd E:\Project\School
npm install
```

This will install all backend dependencies including:
- express, mongoose, bcryptjs, jsonwebtoken
- multer, cloudinary, nodemailer
- cors, helmet, morgan, compression
- razorpay, and more...

### Step 2: Install Frontend Dependencies

```bash
cd client
npm install
```

This will install:
- react, react-dom, react-router-dom
- axios, react-icons, react-hot-toast
- tailwindcss, chart.js
- And other frontend dependencies

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the root directory (E:\Project\School\):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/dav_school_db
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dav_school_db

# JWT Secret (Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_xyz123
JWT_EXPIRE=30d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Cloudinary (for image/file storage) - Optional
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# School Information
SCHOOL_NAME=DAV School
SCHOOL_PHONE=+91 7488770476
SCHOOL_EMAIL=info@davschool.edu.in
SCHOOL_ADDRESS=India

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### 2. MongoDB Setup

**Option A: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```
3. MongoDB will run on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 3. Razorpay Setup (Optional for Fee Payments)
1. Sign up at [Razorpay](https://razorpay.com/)
2. Get API keys from dashboard
3. Update `.env` with your keys

---

## 🏃‍♂️ Running the Application

### Development Mode

**Option 1: Run Backend and Frontend Separately**

Terminal 1 - Backend:
```bash
cd E:\Project\School
npm run dev
```
Backend will run on: http://localhost:5000

Terminal 2 - Frontend:
```bash
cd E:\Project\School\client
npm start
```
Frontend will run on: http://localhost:3000

**Option 2: Run Both Concurrently**
```bash
cd E:\Project\School
npm run dev:full
```

### Production Mode

```bash
# Build frontend
cd client
npm run build

# Start backend (which will serve frontend build)
cd ..
npm start
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health
- **School Info:** http://localhost:5000/api/school-info

---

## 🔑 Default Login Credentials

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@davschool.edu.in | admin123 |
| **Staff** | teacher@davschool.edu.in | teacher123 |
| **Parent** | parent@davschool.edu.in | parent123 |
| **Student** | student@davschool.edu.in | student123 |

⚠️ **IMPORTANT:** Change these passwords immediately after first login!

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@davschool.edu.in",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer {admin_token}
```

#### Student Management
```http
# Get all students
GET /api/admin/students

# Create student
POST /api/admin/students

# Update student
PUT /api/admin/students/:id

# Delete student
DELETE /api/admin/students/:id
```

### Staff Endpoints

#### Mark Self Attendance
```http
POST /api/staff/attendance/checkin
Authorization: Bearer {staff_token}
Content-Type: multipart/form-data

photo: <file>
latitude: 28.6139
longitude: 77.2090
address: "Delhi, India"
```

### Parent Endpoints

#### Get Child's Attendance
```http
GET /api/parent/children/:studentId/attendance?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {parent_token}
```

### Student Endpoints

#### Get My Grades
```http
GET /api/student/grades?academicYear=2024-2025
Authorization: Bearer {student_token}
```

### Fee Endpoints

#### Pay Fee (Razorpay)
```http
POST /api/fees/:feeId/payment
Authorization: Bearer {parent_token}

{
  "amount": 5000,
  "paymentMethod": "razorpay",
  "transactionId": "txn_123456"
}
```

---

## 👥 User Roles & Access

### Admin Access
- Full system control
- Manage all users (staff, students, parents)
- View all data & reports
- Configure system settings
- Approve/reject leave requests
- Generate reports

### Staff Access
- Mark own attendance with GPS + photo
- Mark student attendance
- Enter/update grades
- Upload LMS content
- View assigned classes
- Apply for leave
- View salary details

### Parent Access
- View children's data
- Track attendance
- View grades
- Pay fees online
- Download receipts
- Communicate with teachers

### Student Access
- View personal attendance
- Check grades
- Access LMS materials
- Submit assignments
- View timetable
- Read notifications

---

## 🗄️ Database Schema

### Key Collections

1. **users** - All user accounts
2. **students** - Student-specific data
3. **staff** - Staff-specific data
4. **parents** - Parent-specific data
5. **classes** - Class information
6. **subjects** - Subject details
7. **attendance_staff** - Staff attendance with GPS/photo
8. **attendance_students** - Student attendance
9. **grades** - Grade records
10. **fees** - Fee structure & payments
11. **salary** - Salary records
12. **lms_content** - Learning materials
13. **notifications** - System notifications
14. **leaves** - Leave applications
15. **syllabus** - Syllabus per class/subject

---

## 🚀 Deployment

### Backend Deployment (Heroku/Render/DigitalOcean)

1. **Set environment variables** in hosting platform
2. **Connect MongoDB Atlas**
3. **Deploy code**

Example for Render:
```bash
# Build command
npm install

# Start command
npm start
```

### Frontend Deployment (Vercel/Netlify)

```bash
cd client
npm run build
# Deploy the 'build' folder
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Solution: Ensure MongoDB is running
Windows: net start MongoDB
Linux: sudo systemctl start mongod
```

**2. Port Already in Use**
```
Solution: Change PORT in .env file
Or kill the process using the port
```

**3. Module Not Found**
```
Solution: Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. CORS Error**
```
Solution: Check CLIENT_URL in .env matches frontend URL
```

**5. Authentication Failed**
```
Solution: Check JWT_SECRET in .env
Clear localStorage in browser
```

---

## 📞 Support

**School Contact:**
- Phone: +91 7488770476
- Email: info@davschool.edu.in

**Technical Support:**
- Check logs in console
- Review API responses
- Check network tab in browser DevTools

---

## 📝 License

MIT License - This project is open-source and free to use.

---

## 🎉 Congratulations!

You now have a fully functional school management system with:
✅ Multi-role authentication
✅ Attendance tracking with GPS
✅ Fee management with payment gateway
✅ LMS system
✅ Salary automation
✅ And much more!

**Next Steps:**
1. Create seed data for testing
2. Customize as per your needs
3. Add more features
4. Deploy to production
5. Train staff on system usage

---

**Built with ❤️ for DAV School**

