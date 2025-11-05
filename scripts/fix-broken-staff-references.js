/**
 * Fix Broken Staff User References
 * 
 * This script identifies and fixes staff members with missing user references.
 * Run this when you see: "Staff user reference is broken"
 * 
 * Usage:
 *   node scripts/fix-broken-staff-references.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const Staff = require('../models/Staff').default || require('../models/Staff');
const User = require('../models/User').default || require('../models/User');

async function fixBrokenReferences() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all staff members
    console.log('🔍 Checking all staff members...\n');
    const allStaff = await Staff.find().populate('user');

    let brokenCount = 0;
    let fixedCount = 0;
    let errorCount = 0;

    for (const staff of allStaff) {
      if (!staff.user) {
        brokenCount++;
        console.log(`❌ BROKEN: Staff ID ${staff._id} (${staff.employeeId})`);
        console.log(`   Department: ${staff.department}`);
        console.log(`   Designation: ${staff.designation}`);
        console.log(`   User reference is NULL\n`);

        // Option 1: Delete the broken staff record
        console.log(`   ⚠️  This staff record cannot be fixed automatically.`);
        console.log(`   📝 Action needed: Delete this staff record and recreate it.\n`);
        
        errorCount++;
      } else {
        console.log(`✅ OK: ${staff.user.firstName} ${staff.user.lastName} (${staff.employeeId})`);
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`   Total staff: ${allStaff.length}`);
    console.log(`   Working: ${allStaff.length - brokenCount}`);
    console.log(`   Broken: ${brokenCount}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Need manual fix: ${errorCount}`);

    if (brokenCount > 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   Broken staff records found! Here\'s what to do:');
      console.log('   1. Go to your admin dashboard');
      console.log('   2. Delete the broken staff records');
      console.log('   3. Recreate them with proper information');
      console.log('   \n   OR use MongoDB Compass/Shell to manually fix the user references\n');
    } else {
      console.log('\n✅ All staff records are healthy!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
fixBrokenReferences();

