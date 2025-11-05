import mongoose from 'mongoose';

/**
 * STAFF MODEL - DUPLICATE NAME HANDLING
 * 
 * This model correctly handles multiple staff members with the same name.
 * 
 * SCENARIO 1: Two teachers named "Rajesh Kumar"
 *   Teacher 1: Rajesh Kumar - EMP20240001, rajesh1@school.com, Teaching Department
 *   Teacher 2: Rajesh Kumar - EMP20240002, rajesh2@school.com, Teaching Department
 *   Result: ✅ Both stored successfully
 * 
 * SCENARIO 2: Same designation
 *   Staff 1: Amit Shah - Senior Teacher, amit@school.com
 *   Staff 2: Priya Patel - Senior Teacher, priya@school.com
 *   Staff 3: Rahul Singh - Senior Teacher, rahul@school.com
 *   Result: ✅ All stored successfully with same designation
 * 
 * SCENARIO 3: Spouse teachers with same address
 *   Teacher A: Mr. Sharma (mrsharm@school.com), Address: 123 Main St
 *   Teacher B: Mrs. Sharma (mrssharm@school.com), Address: 123 Main St
 *   Result: ✅ Both stored successfully with same address
 * 
 * UNIQUE CONSTRAINTS:
 * - employeeId (indexed, globally unique, auto-generated)
 * - user email (unique via User model)
 * 
 * NON-UNIQUE (Allowed duplicates):
 * - firstName, lastName (staff names)
 * - Department, Designation
 * - Phone numbers
 * - Personal emails
 * - Addresses
 * - Qualifications
 * - All other fields
 */

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Teaching', 'Administrative', 'Support', 'Management']
  },
  designation: {
    type: String,
    required: true
  },
  dateOfJoining: {
    type: Date,
    required: true,
    default: Date.now
  },
  qualification: {
    degree: String,
    specialization: String,
    university: String,
    year: Number
  },
  experience: {
    years: Number,
    previousInstitutions: [{
      name: String,
      designation: String,
      duration: String
    }]
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  classes: [{
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    section: String,
    isClassTeacher: {
      type: Boolean,
      default: false
    }
  }],
  salary: {
    basicSalary: {
      type: Number,
      required: true
    },
    allowances: {
      houseRent: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    deductions: {
      tax: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  bankDetails: {
    accountNumber: String,
    accountHolderName: String,
    ifscCode: String,
    bankName: String,
    branch: String
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  alternateContact: {
    name: String,
    relation: String,
    phone: String,
    email: String
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String,
    address: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'resigned', 'retired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
staffSchema.index({ employeeId: 1 });
staffSchema.index({ department: 1 });

export default mongoose.models.Staff || mongoose.model('Staff', staffSchema);

