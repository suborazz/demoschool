const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');
const Staff = require('./models/Staff');
const Parent = require('./models/Parent');
const Class = require('./models/Class');
const Subject = require('./models/Subject');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dav_school_db')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Staff.deleteMany({});
    await Parent.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Admin User
    console.log('👤 Creating Admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@davschool.edu.in',
      password: 'admin123',
      role: 'admin',
      phone: '+91 7488770476',
      address: {
        street: 'DAV School Campus',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      },
      dateOfBirth: new Date('1980-01-01'),
      gender: 'male',
      isActive: true
    });
    console.log('✅ Admin created:', adminUser.email);

    // Create Classes
    console.log('\n📚 Creating Classes...');
    const class10 = await Class.create({
      name: 'Class 10',
      grade: 10,
      sections: ['A', 'B', 'C'],
      capacity: 40,
      academicYear: '2024-2025',
      isActive: true
    });
    console.log('✅ Class created:', class10.name);

    // Create Subjects
    console.log('\n📖 Creating Subjects...');
    const mathSubject = await Subject.create({
      name: 'Mathematics',
      code: 'MATH10',
      description: 'Advanced Mathematics for Class 10',
      category: 'Core',
      classes: [class10._id],
      totalMarks: 100,
      passingMarks: 33,
      isActive: true
    });

    const scienceSubject = await Subject.create({
      name: 'Science',
      code: 'SCI10',
      description: 'General Science for Class 10',
      category: 'Core',
      classes: [class10._id],
      totalMarks: 100,
      passingMarks: 33,
      isActive: true
    });

    console.log('✅ Subjects created: Math, Science');

    // Create Staff User
    console.log('\n👨‍🏫 Creating Staff user...');
    const staffUser = await User.create({
      firstName: 'John',
      lastName: 'Teacher',
      email: 'teacher@davschool.edu.in',
      password: 'teacher123',
      role: 'staff',
      phone: '+91 9876543210',
      address: {
        street: '123 Teacher Colony',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110002',
        country: 'India'
      },
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      isActive: true
    });

    const staffRecord = await Staff.create({
      user: staffUser._id,
      employeeId: 'EMP001',
      department: 'Teaching',
      designation: 'Senior Teacher',
      dateOfJoining: new Date('2020-06-01'),
      qualification: {
        degree: 'B.Ed, M.Sc',
        specialization: 'Mathematics',
        university: 'Delhi University',
        year: 2008
      },
      subjects: [mathSubject._id, scienceSubject._id],
      classes: [{
        class: class10._id,
        section: 'A',
        isClassTeacher: true
      }],
      salary: {
        basicSalary: 50000,
        allowances: {
          houseRent: 10000,
          transport: 3000,
          medical: 2000,
          other: 0
        }
      },
      status: 'active'
    });
    console.log('✅ Staff created:', staffUser.email);

    // Create Parent User
    console.log('\n👨‍👩‍👧 Creating Parent user...');
    const parentUser = await User.create({
      firstName: 'Michael',
      lastName: 'Parent',
      email: 'parent@davschool.edu.in',
      password: 'parent123',
      role: 'parent',
      phone: '+91 9876543211',
      address: {
        street: '456 Parent Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110003',
        country: 'India'
      },
      dateOfBirth: new Date('1982-08-20'),
      gender: 'male',
      isActive: true
    });

    // Create Student User
    console.log('\n👨‍🎓 Creating Student user...');
    const studentUser = await User.create({
      firstName: 'Sarah',
      lastName: 'Student',
      email: 'student@davschool.edu.in',
      password: 'student123',
      role: 'student',
      phone: '+91 9876543212',
      address: {
        street: '456 Parent Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110003',
        country: 'India'
      },
      dateOfBirth: new Date('2009-03-10'),
      gender: 'female',
      isActive: true
    });

    const studentRecord = await Student.create({
      user: studentUser._id,
      admissionNumber: 'ADM2024001',
      rollNumber: '001',
      class: class10._id,
      section: 'A',
      academicYear: '2024-2025',
      dateOfAdmission: new Date('2024-04-01'),
      bloodGroup: 'O+',
      emergencyContact: {
        name: 'Michael Parent',
        relation: 'Father',
        phone: '+91 9876543211'
      },
      status: 'active'
    });
    console.log('✅ Student created:', studentUser.email);

    // Create Parent Record and link to student
    const parentRecord = await Parent.create({
      user: parentUser._id,
      relation: 'father',
      occupation: 'Software Engineer',
      organization: 'Tech Corp',
      annualIncome: 1200000,
      children: [studentRecord._id],
      isPrimaryContact: true
    });
    console.log('✅ Parent created:', parentUser.email);

    // Update student with parent
    studentRecord.parents.push(parentRecord._id);
    await studentRecord.save();

    // Update class with subjects
    class10.subjects = [mathSubject._id, scienceSubject._id];
    class10.classTeacher = staffRecord._id;
    await class10.save();

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 Demo Login Credentials:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n👨‍💼 Admin:');
    console.log('   Email: admin@davschool.edu.in');
    console.log('   Password: admin123');
    console.log('\n👨‍🏫 Staff:');
    console.log('   Email: teacher@davschool.edu.in');
    console.log('   Password: teacher123');
    console.log('\n👨‍👩‍👧 Parent:');
    console.log('   Email: parent@davschool.edu.in');
    console.log('   Password: parent123');
    console.log('\n👨‍🎓 Student:');
    console.log('   Email: student@davschool.edu.in');
    console.log('   Password: student123');
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🚀 You can now login at: http://localhost:3000/login');
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

