const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EIRSchema = new Schema({
  startup_id: { 
    type: String,
    index: true // Single-field index for quick lookup
  },
  startup_name: { 
    type: String
  },
  entrepreneur: {
    name: { type: String},
    background: { type: String},
    email: { 
      type: String,
      index: true // Helpful if querying by entrepreneur email
    },
    previous_ventures: [{ type: String }],
    industry_experience: { type: String },
  },
  mentor: {
    mentor_name: { type: String },
    mentor_background: { type: String },
    mentor_experience: { type: String },
    mentor_industry_experience: { type: String },
    mentor_previous_ventures: [{ type: String }]
  },
  iiits_mentor: {
    mentor_name: { type: String },
    mentor_background: { type: String },
    mentor_experience: { type: String },
    mentor_industry_experience: { type: String },
    mentor_previous_ventures: [{ type: String }]
  },
  objectives: {
    mentorship_startups: [{ type: String }],
    personal_goals: { type: String },
  },
  status: {
    status: { 
      type: String, 
      enum: ['Submitted', 'Approved', 'Rejected', 'Short Listed', 'Under Review'], 
      default: 'Submitted',
      index: true // Frequently filtered field
    },
    decision_date: { 
      type: Date,
      index: true // Optional: useful if sorted or filtered by decision date
    }
  },
  reviews: [{
    reviewer_id: { type: String },
    reviewer_name: { type: String },
    reviewer_email: { type: String },
    status: { type: String },
    reviewer_organization: { type: String },
    review_date: { type: Date },
    rating: { type: Number },
    comments: [{ type: String }]
  }],
  created_at: { 
    type: Date, 
    default: Date.now,
    index: true // Often used in sorting by creation date
  }
});

// Optional: Compound index if you frequently filter by reviewer and status
// EIRSchema.index({ 'reviews.reviewer_email': 1, 'reviews.status': 1 });

module.exports = mongoose.model('EIR', EIRSchema);
