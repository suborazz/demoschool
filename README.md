# 🏫 DAV School Management System

A comprehensive School Management System with Admin Panel, Staff Portal, Parent Portal, and Student Portal.

## 📞 Contact Information
- **School Name:** DAV School
- **Phone:** +91 7488770476
- **Location:** India

## ✨ Features

### 👨‍💼 Admin Panel
- Complete dashboard with analytics
- Staff management (add, edit, salary tracking)
- Student & parent management
- Attendance monitoring (staff & students)
- Fee management & payment tracking
- Salary automation with attendance-based deductions
- LMS content management
- Reports & analytics
- System settings & access control

### 👨‍🏫 Staff/Faculty Portal
- Mark student attendance with date/time/location
- Self-attendance with live photo & GPS capture
- Manage grades & assignments
- Upload syllabus & study materials
- View salary details & deductions
- Submit leave requests
- Communication with parents/students

### 👨‍👩‍👧 Parent Portal
- View child's attendance & grades
- Pay fees online (Razorpay integration)
- Download receipts
- View announcements
- Message teachers

### 👨‍🎓 Student Portal
- View attendance records
- Check grades & exam results
- Access LMS materials
- View syllabus & timetable
- Download assignments

### 🌐 Public Website
- Home page
- About school
- Admission information
- Photo gallery
- Contact us

## 🛠️ Technology Stack

- **Frontend:** React.js with React Router
- **Backend:** Node.js with Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **Payment Gateway:** Razorpay
- **GPS & Camera:** HTML5 Geolocation & MediaStream API

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd School
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Configure environment variables**
- Copy `.env.example` to `.env`
- Update all the configuration values in `.env`

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

6. **Run the application**

For development (runs both backend and frontend):
```bash
npm run dev:full
```

Or run separately:
```bash
# Backend only (on port 5000)
npm run dev

# Frontend only (on port 3000)
npm run client
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Default Login Credentials

After running the seed script, use these credentials:

### Admin
- Email: admin@davschool.edu.in
- Password: admin123

### Staff
- Email: teacher@davschool.edu.in
- Password: teacher123

### Parent
- Email: parent@davschool.edu.in
- Password: parent123

### Student
- Email: student@davschool.edu.in
- Password: student123

**⚠️ Change these passwords after first login!**

## 📁 Project Structure

```
School/
├── server/
│   ├── config/          # Database & app configuration
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & validation middleware
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── client/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       ├── context/     # React Context (Auth)
│       ├── utils/       # Helper functions
│       └── App.js       # Main app component
├── package.json
└── README.md
```

## 🚀 Deployment

### Backend (Node.js)
- Deploy to Heroku, DigitalOcean, AWS, or Render
- Set environment variables
- Ensure MongoDB connection string is configured

### Frontend (React)
- Build: `cd client && npm run build`
- Deploy to Vercel, Netlify, or serve from Express

## 📊 Database Schema

### Collections
- `users` - All users (admin, staff, parent, student)
- `students` - Student details
- `staff` - Staff details
- `attendance_staff` - Staff attendance with GPS & photo
- `attendance_students` - Student attendance
- `grades` - Student grades & exam results
- `fees` - Fee structure & payments
- `salary` - Staff salary records
- `classes` - Class information
- `subjects` - Subject details
- `syllabus` - Syllabus per class/subject
- `lms_content` - Learning materials
- `notifications` - System notifications
- `leaves` - Leave requests

## 🔧 API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/auth/me` - Get current user

### Admin Routes
- GET `/api/admin/dashboard` - Dashboard stats
- CRUD operations for staff, students, parents

### Staff Routes
- POST `/api/staff/attendance/mark` - Mark attendance (GPS + photo)
- GET `/api/staff/salary` - View salary details

### Parent Routes
- GET `/api/parent/child/attendance` - View child attendance
- POST `/api/parent/fees/pay` - Pay fees

### Student Routes
- GET `/api/student/grades` - View grades
- GET `/api/student/lms` - Access learning materials

## 🤝 Contributing

This is a school project. For modifications, contact the development team.

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For technical support or inquiries:
- Phone: +91 7488770476
- Email: info@davschool.edu.in

---

Built with ❤️ for DAV School

