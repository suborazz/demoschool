import mongoose from 'mongoose';

/**
 * PARENT MODEL - DUPLICATE NAME HANDLING
 * 
 * Multiple parents can have the same name (e.g., two different "Rajesh Kumar" fathers).
 * 
 * SCENARIO: Two unrelated students both have fathers named "Rajesh Kumar"
 *   Father 1: Rajesh Kumar (rajesh1@email.com) - Parent of Student A
 *   Father 2: Rajesh Kumar (rajesh2@email.com) - Parent of Student B
 *   Result: ✅ Both stored as separate parent accounts
 * 
 * UNIQUE CONSTRAINTS:
 * - user email (via User model reference)
 * 
 * NON-UNIQUE (Allowed duplicates):
 * - Parent names (via User model)
 * - Phone numbers
 * - Occupation details
 * - All other fields
 * 
 * Each parent account is linked to their User account and children (students).
 */

const parentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationship: {
    type: String,
    enum: ['father', 'mother', 'guardian'],
    required: true
  },
  occupation: {
    type: String,
    trim: true
  },
  workDetails: {
    company: String,
    designation: String,
    officeAddress: String,
    officePhone: String
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  alternateContact: {
    name: String,
    relation: String,
    phone: String
  },
  annualIncome: {
    type: Number
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }]
}, {
  timestamps: true
});

// Index for faster queries
parentSchema.index({ user: 1 });

export default mongoose.models.Parent || mongoose.model('Parent', parentSchema);

