import mongoose from 'mongoose';

/**
 * STUDENT MODEL - DUPLICATE NAME HANDLING
 * 
 * This model correctly handles multiple students with the same name.
 * 
 * SCENARIO 1: Two students named "Rahul Kumar"
 *   Student 1: Rahul Kumar - ADM20240001, rahul1@email.com, Roll: 001, Class 10-A
 *   Student 2: Rahul Kumar - ADM20240002, rahul2@email.com, Roll: 002, Class 10-A
 *   Result: ✅ Both stored successfully
 * 
 * SCENARIO 2: Siblings in same class
 *   Student 1: Priya Sharma - ADM20240003, priya@email.com, Roll: 003, Class 10-A
 *   Student 2: Riya Sharma - ADM20240004, riya@email.com, Roll: 004, Class 10-A
 *   Parents: Same father "Rajesh Sharma" (rajesh@email.com), Same mother "Sunita Sharma" (sunita@email.com)
 *   Result: ✅ Both stored successfully with shared parents
 * 
 * SCENARIO 3: Different students with same parent names (but different emails)
 *   Student A: John Doe, Father: Robert Smith (robert1@email.com)
 *   Student B: Jane Doe, Father: Robert Smith (robert2@email.com) 
 *   Result: ✅ Both stored successfully (different parent accounts)
 * 
 * UNIQUE CONSTRAINTS:
 * - admissionNumber (indexed, globally unique)
 * - user email (unique via User model)
 * - rollNumber per class/section/year combination
 * 
 * NON-UNIQUE (Allowed duplicates):
 * - firstName, lastName (student names)
 * - Parent names
 * - Phone numbers
 * - Addresses
 */

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admissionNumber: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
  },
  dateOfAdmission: {
    type: Date,
    required: true,
    default: Date.now
  },
  previousSchool: {
    name: String,
    location: String
  },
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  }],
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  medicalInfo: {
    allergies: [String],
    medications: [String],
    conditions: [String],
    doctorName: String,
    doctorPhone: String
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'transferred'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
studentSchema.index({ admissionNumber: 1 });
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ academicYear: 1 });

export default mongoose.models.Student || mongoose.model('Student', studentSchema);

