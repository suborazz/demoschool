/**
 * Script to create an admin user in the database
 * Run this with: npm run create-admin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

// Also try .env
const envPath2 = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath2)) {
  const envContent = fs.readFileSync(envPath2, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length && !process.env[key.trim()]) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

// Get MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';

// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: String,
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: Object,
  isActive: Boolean,
  lastLogin: Date,
  personalEmail: String,
  profilePhoto: String,
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add comparePassword method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Create admin user
const createAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database:', MONGODB_URI.split('/').pop().split('?')[0]);
    console.log('');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@davschool.edu.in' });
    
    if (existingAdmin) {
      console.log('📌 Admin user already exists!');
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('  Existing Admin Account');
      console.log('═══════════════════════════════════════');
      console.log('  Email:    admin@davschool.edu.in');
      console.log('  User ID:  ' + existingAdmin._id);
      console.log('  Role:     ' + existingAdmin.role);
      console.log('  Active:   ' + existingAdmin.isActive);
      console.log('═══════════════════════════════════════');
      console.log('');
      
      // Update to ensure it's admin
      if (existingAdmin.role !== 'admin' || !existingAdmin.isActive) {
        existingAdmin.role = 'admin';
        existingAdmin.isActive = true;
        await existingAdmin.save({ validateBeforeSave: false });
        console.log('✅ Updated role to admin and activated account');
        console.log('');
      }
      
      console.log('💡 You can login with:');
      console.log('   Email: admin@davschool.edu.in');
      console.log('   Password: (your existing password)');
      console.log('');
      console.log('⚠️  If you forgot the password, delete this user from database and run script again.');
    } else {
      // Create new admin user
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@davschool.edu.in',
        password: 'admin123',
        role: 'admin',
        phone: '+91 9876543210',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: {
          street: 'School Address',
          city: 'City',
          state: 'State',
          pincode: '123456',
          country: 'India'
        },
        isActive: true,
        lastLogin: null
      });

      console.log('✅ New admin user created successfully!');
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('  NEW Admin Login Credentials');
      console.log('═══════════════════════════════════════');
      console.log('  Email:    admin@davschool.edu.in');
      console.log('  Password: admin123');
      console.log('  Role:     admin');
      console.log('  User ID:  ' + admin._id);
      console.log('═══════════════════════════════════════');
      console.log('');
      console.log('⚠️  IMPORTANT: Change the password after first login!');
      console.log('');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    console.log('');
    console.log('🎉 Done! You can now login at: http://localhost:3000/login');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('💡 Duplicate email found. Admin might already exist.');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
console.log('');
console.log('🏫 DAV School Management System');
console.log('📝 Admin User Creation Script');
console.log('');
createAdmin();
