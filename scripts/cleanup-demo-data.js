/**
 * Cleanup Demo/Dummy Data Script
 * 
 * This script removes all demo/test data from the database while keeping:
 * - Main admin account (admin@davschool.edu.in)
 * - Database structure (collections, indexes)
 * 
 * Usage:
 *   node scripts/cleanup-demo-data.js
 * 
 * ⚠️  WARNING: This will delete data! Make sure you have a backup.
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

// Import models
const User = require('../models/User').default || require('../models/User');
const Staff = require('../models/Staff').default || require('../models/Staff');
const Student = require('../models/Student').default || require('../models/Student');
const Parent = require('../models/Parent').default || require('../models/Parent');
const Class = require('../models/Class').default || require('../models/Class');
const Subject = require('../models/Subject').default || require('../models/Subject');
const AttendanceStaff = require('../models/AttendanceStaff').default || require('../models/AttendanceStaff');
const AttendanceStudent = require('../models/AttendanceStudent').default || require('../models/AttendanceStudent');
const Fee = require('../models/Fee').default || require('../models/Fee');
const Grade = require('../models/Grade').default || require('../models/Grade');
const Leave = require('../models/Leave').default || require('../models/Leave');
const Salary = require('../models/Salary').default || require('../models/Salary');
const Notification = require('../models/Notification').default || require('../models/Notification');
const LMSContent = require('../models/LMSContent').default || require('../models/LMSContent');
const Syllabus = require('../models/Syllabus').default || require('../models/Syllabus');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function cleanupDemoData() {
  try {
    console.log('\n🧹 DEMO DATA CLEANUP SCRIPT\n');
    console.log('⚠️  WARNING: This will delete ALL data except the main admin account!\n');
    console.log('📋 What will be deleted:');
    console.log('   ❌ All staff members');
    console.log('   ❌ All students');
    console.log('   ❌ All parents');
    console.log('   ❌ All classes');
    console.log('   ❌ All subjects');
    console.log('   ❌ All attendance records');
    console.log('   ❌ All fees');
    console.log('   ❌ All grades');
    console.log('   ❌ All leaves');
    console.log('   ❌ All salary records');
    console.log('   ❌ All notifications');
    console.log('   ❌ All LMS content');
    console.log('   ❌ All syllabus');
    console.log('\n✅ What will be kept:');
    console.log('   ✓ Admin account (admin@davschool.edu.in)');
    console.log('   ✓ Database structure\n');

    const answer = await question('❓ Are you sure you want to continue? (type "YES" to confirm): ');

    if (answer !== 'YES') {
      console.log('\n❌ Cleanup cancelled.');
      process.exit(0);
    }

    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Starting cleanup...\n');

    // Find the main admin account (to preserve it)
    const adminUser = await User.findOne({ 
      email: 'admin@davschool.edu.in',
      role: 'admin' 
    });

    if (!adminUser) {
      console.log('⚠️  Warning: Main admin account not found!');
      const createAdmin = await question('Would you like to create it? (yes/no): ');
      
      if (createAdmin.toLowerCase() === 'yes') {
        const newAdmin = await User.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@davschool.edu.in',
          password: 'admin123',
          phone: '+91 1234567890',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          role: 'admin',
          isActive: true
        });
        console.log('✅ Admin account created');
        console.log('   Email: admin@davschool.edu.in');
        console.log('   Password: admin123\n');
      }
    } else {
      console.log(`✅ Found admin account: ${adminUser.email}\n`);
    }

    // Delete in proper order (respecting foreign key relationships)
    
    // 1. Delete attendance records
    const attendanceStaffCount = await AttendanceStaff.countDocuments();
    const attendanceStudentCount = await AttendanceStudent.countDocuments();
    await AttendanceStaff.deleteMany({});
    await AttendanceStudent.deleteMany({});
    console.log(`✅ Deleted ${attendanceStaffCount} staff attendance records`);
    console.log(`✅ Deleted ${attendanceStudentCount} student attendance records`);

    // 2. Delete grades
    const gradesCount = await Grade.countDocuments();
    await Grade.deleteMany({});
    console.log(`✅ Deleted ${gradesCount} grade records`);

    // 3. Delete fees
    const feesCount = await Fee.countDocuments();
    await Fee.deleteMany({});
    console.log(`✅ Deleted ${feesCount} fee records`);

    // 4. Delete leaves
    const leavesCount = await Leave.countDocuments();
    await Leave.deleteMany({});
    console.log(`✅ Deleted ${leavesCount} leave records`);

    // 5. Delete salaries
    const salariesCount = await Salary.countDocuments();
    await Salary.deleteMany({});
    console.log(`✅ Deleted ${salariesCount} salary records`);

    // 6. Delete notifications
    const notificationsCount = await Notification.countDocuments();
    await Notification.deleteMany({});
    console.log(`✅ Deleted ${notificationsCount} notifications`);

    // 7. Delete LMS content
    const lmsCount = await LMSContent.countDocuments();
    await LMSContent.deleteMany({});
    console.log(`✅ Deleted ${lmsCount} LMS content items`);

    // 8. Delete syllabus
    const syllabusCount = await Syllabus.countDocuments();
    await Syllabus.deleteMany({});
    console.log(`✅ Deleted ${syllabusCount} syllabus items`);

    // 9. Delete staff profiles
    const staffCount = await Staff.countDocuments();
    const allStaff = await Staff.find();
    await Staff.deleteMany({});
    console.log(`✅ Deleted ${staffCount} staff profiles`);

    // 10. Delete student profiles
    const studentCount = await Student.countDocuments();
    await Student.deleteMany({});
    console.log(`✅ Deleted ${studentCount} student profiles`);

    // 11. Delete parent profiles
    const parentCount = await Parent.countDocuments();
    await Parent.deleteMany({});
    console.log(`✅ Deleted ${parentCount} parent profiles`);

    // 12. Delete classes
    const classCount = await Class.countDocuments();
    await Class.deleteMany({});
    console.log(`✅ Deleted ${classCount} classes`);

    // 13. Delete subjects
    const subjectCount = await Subject.countDocuments();
    await Subject.deleteMany({});
    console.log(`✅ Deleted ${subjectCount} subjects`);

    // 14. Delete user accounts (except admin)
    const usersToDelete = await User.find({ 
      _id: { $ne: adminUser?._id }
    });
    const userCount = usersToDelete.length;
    await User.deleteMany({ 
      _id: { $ne: adminUser?._id }
    });
    console.log(`✅ Deleted ${userCount} user accounts (kept admin)`);

    console.log('\n✨ CLEANUP COMPLETE!\n');
    console.log('📊 SUMMARY:');
    console.log(`   ✓ ${attendanceStaffCount + attendanceStudentCount} attendance records deleted`);
    console.log(`   ✓ ${gradesCount} grades deleted`);
    console.log(`   ✓ ${feesCount} fees deleted`);
    console.log(`   ✓ ${leavesCount} leaves deleted`);
    console.log(`   ✓ ${salariesCount} salaries deleted`);
    console.log(`   ✓ ${notificationsCount} notifications deleted`);
    console.log(`   ✓ ${lmsCount} LMS items deleted`);
    console.log(`   ✓ ${syllabusCount} syllabus items deleted`);
    console.log(`   ✓ ${staffCount} staff profiles deleted`);
    console.log(`   ✓ ${studentCount} student profiles deleted`);
    console.log(`   ✓ ${parentCount} parent profiles deleted`);
    console.log(`   ✓ ${classCount} classes deleted`);
    console.log(`   ✓ ${subjectCount} subjects deleted`);
    console.log(`   ✓ ${userCount} user accounts deleted\n`);

    console.log('🎉 Your database is now clean!\n');
    console.log('🔐 Admin Login Credentials:');
    console.log('   Email: admin@davschool.edu.in');
    console.log('   Password: admin123\n');
    console.log('⚠️  Remember to change the admin password after login!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
cleanupDemoData();

