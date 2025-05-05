const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GrantSchemeSchema = new Schema({
  startup_id: {
    type: String,
    index: true // Frequently queried field
  },
  applicant: {
    name: { type: String },
    organization: { type: String },
    pan: String,
    aadhar_num: String,
    contact_details: {
      email: {
        type: String,
        index: true // Helps in email-based queries
      },
      phone: { type: String },
      address: { type: String }
    }
  },
  project_proposal: {
    project_title: { type: String },
    description: { type: String},
    objectives: [{ type: String }],
    budget: {
      total_funding_required: { type: Number },
      funding_breakdown: [{
        item: { type: String },
        amount: { type: Number }
      }]
    }
  },
  grant_status: {
    status: {
      type: String,
      enum: ['Submitted', 'Approved', 'Rejected', 'Short Listed', 'Under Review'],
      default: 'Submitted',
      index: true // Often filtered in admin panels
    },
    decision_date: {
      type: Date,
      index: true // Useful for time-based filters
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
    index: true // Sort or filter by submission date
  }
});

// Optional: Compound index if needed
// GrantSchemeSchema.index({ "reviews.reviewer_email": 1, "reviews.status": 1 });

module.exports = mongoose.model('GrantScheme', GrantSchemeSchema);
