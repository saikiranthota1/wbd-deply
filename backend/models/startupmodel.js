const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// KYC Schema for Startups
const StartupKYCSchema = new Schema({
  company_name: { type: String, index: true },
  address: { type: String },
  contact_person: {
    name: { type: String },
    email: { type: String, index: true },
    phone: { type: String }
  },
  company_details: {
    incorporation_date: { type: Date },
    industry: { type: String, index: true },
    website: { type: String },
    pan_number: { type: String, index: true },
    about: { type: String }
  },
  created_at: { type: Date, default: Date.now },
  profile_picture: String
});

// Progress Tracking Schema
const ProgressSchema = new Schema({
  month: { type: String, index: true },
  milestones: String,
  issues_faced: String,
  financials: {
    revenue: { type: Number },
    expenses: { type: Number }
  },
});

// Report Collection Schema (monthly)
const ReportSchema = new Schema({
  report_date: { type: Date, default: Date.now, index: true },
  summary: String,
  detailed_report: String,
});

// Messaging/Notification Schema
const MessageSchema = new Schema({
  message: String,
  date_sent: { type: Date, default: Date.now, index: true },
  recipient: { type: String, index: true }
});

// EIR & Grant Scheme Management Schema
const GrantSchema = new Schema({
  eir_application: {
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
      default: 'Applied',
      index: true
    },
    interview_date: { type: Date, index: true }
  },
  grant_application: {
    amount_requested: { type: Number },
    amount_approved: { type: Number },
    status: {
      type: String,
      enum: ['Applied', 'Approved', 'Rejected'],
      default: 'Applied',
      index: true
    },
    disbursal_date: { type: Date, index: true }
  },
  created_at: { type: Date, default: Date.now }
});

// Main Startup Schema
const StartupSchema = new Schema({
  kyc: StartupKYCSchema,
  progress: [ProgressSchema],
  reports: [ReportSchema],
  messages: [MessageSchema],
  grants: [GrantSchema]
}, { timestamps: true });

// Optional top-level index on nested fields if used for searching
// StartupSchema.index({ 'kyc.contact_person.email': 1 });
// StartupSchema.index({ 'grants.grant_application.status': 1 });

module.exports = mongoose.model('Startup', StartupSchema);
