const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GrantSchemeSchema = new Schema({
  startup_id: {
    type: String,
    index: true // Querying grants by startup
  },
  applicant: {
    name: { type: String },
    organization: { type: String },
    org_pan: String,
    contact_details: {
      email: {
        type: String,
        index: true // Useful for querying by email
      },
      phone: { type: String },
      address: { type: String }
    }
  },
  project_proposal: {
    project_title: { type: String},
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
      index: true // Used for filtering application progress
    },
    decision_date: {
      type: Date,
      index: true // Useful for sorting/filtering by decision timeline
    }
  },
  reviews: [{
    reviewer_id: { type: String },
    reviewer_name: { type: String },
    reviewer_name_type: { type: String },
    review_date: { type: Date },
    rating: { type: Number },
    comments: [{ type: String }]
  }],
  created_at: {
    type: Date,
    default: Date.now,
    index: true // Enables sorting by submission date
  }
});

// Optional: compound index for combined queries
// GrantSchemeSchema.index({ "applicant.contact_details.email": 1, "grant_status.status": 1 });

module.exports = mongoose.model('GrantScheme', GrantSchemeSchema);
