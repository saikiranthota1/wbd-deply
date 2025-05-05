const mongoose = require('mongoose');

const reviewschema = mongoose.Schema({
  name: {
    type: String,
    index: true // Helpful if you need to search/filter by name
  },
  email: {
    type: String,
    unique: true, // Ensures no duplicate emails
    index: true // Speeds up login/lookup by email
  },
  password: {
    type: String
  },
  organization: {
    type: String,
    index: true // If you search reviewers by organization
  },
  about: String,
  
  // Reference fields – not indexed unless queried directly
  reviews: [{ id: String }],
  grantsreviews: [{ id: String }],
  scaleup: [{ id: String }]
});

// Optional: compound index example if needed
// reviewschema.index({ email: 1, organization: 1 });

const Review = mongoose.model('Reviewers', reviewschema);

module.exports = Review;
