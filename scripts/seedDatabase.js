// Seed Script to Create Demo Users in MongoDB Atlas
// Run this script ONCE to populate your database with demo data

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection String - Update this with your MongoDB Atlas URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sstm476:sstm476@school.4wrzsop.mongodb.net/schooldb?appName=school';

// Schema Definitions
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'staff', 'parent', 'student'], required: true },
  phone: { type: String, required: true, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  profilePhoto: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  grade: { type: Number, required: true, min: 1, max: 12 },
  sections: [{ type: String, trim: true }],
  capacity: { type: Number, default: 40 },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  academicYear: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  description: { type: String, trim: true },
  category: { type: String, enum: ['Core', 'Elective', 'Language', 'Science', 'Arts', 'Sports', 'Co-curricular'], default: 'Core' },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  totalMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 33 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admissionNumber: { type: String, required: true },
  rollNumber: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  section: { type: String, required: true, trim: true },
  academicYear: { type: String, required: true },
  dateOfAdmission: { type: Date, required: true, default: Date.now },
  previousSchool: { name: String, location: String },
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }],
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  emergencyContact: { name: String, relation: String, phone: String },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'transferred'], default: 'active' }
}, { timestamps: true });

const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  department: { type: String, required: true, enum: ['Teaching', 'Administrative', 'Support', 'Management'] },
  designation: { type: String, required: true },
  dateOfJoining: { type: Date, required: true, default: Date.now },
  qualification: { degree: String, specialization: String, university: String, year: Number },
  experience: { years: Number },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  classes: [{
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    section: String,
    isClassTeacher: { type: Boolean, default: false }
  }],
  salary: { basicSalary: { type: Number, required: true } },
  status: { type: String, enum: ['active', 'inactive', 'on_leave', 'resigned', 'retired'], default: 'active' }
}, { timestamps: true });

const parentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relationship: { type: String, enum: ['father', 'mother', 'guardian'], required: true },
  occupation: { type: String, trim: true },
  workDetails: { company: String, designation: String },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  alternateContact: { name: String, relation: String, phone: String }
}, { timestamps: true });

// Models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Class = mongoose.models.Class || mongoose.model('Class', classSchema);
const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
const Parent = mongoose.models.Parent || mongoose.model('Parent', parentSchema);

// Hash password function
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Main Seed Function
async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing demo data...');
    await User.deleteMany({ email: { $in: ['admin@davschool.edu.in', 'teacher@davschool.edu.in', 'parent@davschool.edu.in', 'student@davschool.edu.in'] } });
    await Class.deleteMany({ name: 'Class 10' });
    await Subject.deleteMany({ code: { $in: ['MATH10', 'SCI10', 'ENG10'] } });
    console.log('✅ Cleared existing data\n');

    // 1. Create Subjects
    console.log('📚 Creating subjects...');
    const mathSubject = await Subject.create({
      name: 'Mathematics',
      code: 'MATH10',
      description: 'Advanced Mathematics for Class 10',
      category: 'Core',
      totalMarks: 100,
      passingMarks: 33
    });

    const scienceSubject = await Subject.create({
      name: 'Science',
      code: 'SCI10',
      description: 'Physics, Chemistry, Biology',
      category: 'Science',
      totalMarks: 100,
      passingMarks: 33
    });

    const englishSubject = await Subject.create({
      name: 'English',
      code: 'ENG10',
      description: 'English Language and Literature',
      category: 'Language',
      totalMarks: 100,
      passingMarks: 33
    });
    console.log('✅ Created 3 subjects\n');

    // 2. Create Class
    console.log('🏫 Creating class...');
    const class10 = await Class.create({
      name: 'Class 10',
      grade: 10,
      sections: ['A', 'B', 'C'],
      capacity: 40,
      academicYear: '2024-2025',
      subjects: [mathSubject._id, scienceSubject._id, englishSubject._id],
      isActive: true
    });
    console.log('✅ Created Class 10\n');

    // 3. Create Admin User
    console.log('👨‍💼 Creating Admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@davschool.edu.in',
      password: await hashPassword('admin123'),
      role: 'admin',
      phone: '+91 9876543210',
      address: {
        street: '123 School Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      dateOfBirth: new Date('1985-01-15'),
      gender: 'male',
      isActive: true
    });
    console.log('✅ Admin created: admin@davschool.edu.in / admin123\n');

    // 4. Create Staff User
    console.log('👨‍🏫 Creating Staff user...');
    const teacherUser = await User.create({
      firstName: 'Teacher',
      lastName: 'Kumar',
      email: 'teacher@davschool.edu.in',
      password: await hashPassword('teacher123'),
      role: 'staff',
      phone: '+91 9876543211',
      address: {
        street: '456 Teacher Colony',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        country: 'India'
      },
      dateOfBirth: new Date('1990-05-20'),
      gender: 'male',
      isActive: true
    });

    const staffProfile = await Staff.create({
      user: teacherUser._id,
      employeeId: 'EMP001',
      department: 'Teaching',
      designation: 'Senior Teacher',
      dateOfJoining: new Date('2015-06-01'),
      qualification: {
        degree: 'M.Sc',
        specialization: 'Mathematics',
        university: 'Mumbai University',
        year: 2014
      },
      experience: {
        years: 9
      },
      subjects: [mathSubject._id, scienceSubject._id],
      classes: [{
        class: class10._id,
        section: 'A',
        isClassTeacher: true
      }],
      salary: {
        basicSalary: 50000
      },
      status: 'active'
    });
    console.log('✅ Staff created: teacher@davschool.edu.in / teacher123\n');

    // 5. Create Parent User
    console.log('👨‍👩‍👧 Creating Parent user...');
    const parentUser = await User.create({
      firstName: 'Parent',
      lastName: 'Sharma',
      email: 'parent@davschool.edu.in',
      password: await hashPassword('parent123'),
      role: 'parent',
      phone: '+91 9876543212',
      address: {
        street: '789 Parent Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400003',
        country: 'India'
      },
      dateOfBirth: new Date('1982-08-25'),
      gender: 'male',
      isActive: true
    });
    console.log('✅ Parent created: parent@davschool.edu.in / parent123\n');

    // 6. Create Student User
    console.log('👨‍🎓 Creating Student user...');
    const studentUser = await User.create({
      firstName: 'Student',
      lastName: 'Sharma',
      email: 'student@davschool.edu.in',
      password: await hashPassword('student123'),
      role: 'student',
      phone: '+91 9876543213',
      address: {
        street: '789 Parent Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400003',
        country: 'India'
      },
      dateOfBirth: new Date('2009-03-10'),
      gender: 'male',
      isActive: true
    });

    const studentProfile = await Student.create({
      user: studentUser._id,
      admissionNumber: 'ADM2024001',
      rollNumber: '10A01',
      class: class10._id,
      section: 'A',
      academicYear: '2024-2025',
      dateOfAdmission: new Date('2024-04-01'),
      bloodGroup: 'O+',
      emergencyContact: {
        name: 'Parent Sharma',
        relation: 'Father',
        phone: '+91 9876543212'
      },
      status: 'active'
    });
    console.log('✅ Student created: student@davschool.edu.in / student123\n');

    // 7. Create Parent Profile and Link Student
    const parentProfile = await Parent.create({
      user: parentUser._id,
      relationship: 'father',
      occupation: 'Business',
      workDetails: {
        company: 'ABC Corporation',
        designation: 'Manager'
      },
      children: [studentProfile._id],
      alternateContact: {
        name: 'Mrs. Sharma',
        relation: 'Mother',
        phone: '+91 9876543214'
      }
    });

    // Update student's parent reference
    await Student.findByIdAndUpdate(studentProfile._id, {
      parents: [parentProfile._id]
    });
    console.log('✅ Parent profile created and linked to student\n');

    // Update class teacher reference
    await Class.findByIdAndUpdate(class10._id, {
      classTeacher: staffProfile._id
    });
    console.log('✅ Class teacher assigned\n');

    // Final Summary
    console.log('========================================');
    console.log('🎉 DATABASE SEEDING COMPLETED!');
    console.log('========================================\n');
    console.log('Demo Login Credentials:\n');
    console.log('👨‍💼 ADMIN:');
    console.log('   Email: admin@davschool.edu.in');
    console.log('   Password: admin123\n');
    console.log('👨‍🏫 STAFF:');
    console.log('   Email: teacher@davschool.edu.in');
    console.log('   Password: teacher123\n');
    console.log('👨‍👩‍👧 PARENT:');
    console.log('   Email: parent@davschool.edu.in');
    console.log('   Password: parent123\n');
    console.log('👨‍🎓 STUDENT:');
    console.log('   Email: student@davschool.edu.in');
    console.log('   Password: student123\n');
    console.log('========================================');
    console.log('Database: schooldb');
    console.log('Collections: users, classes, subjects, students, staff, parents');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
