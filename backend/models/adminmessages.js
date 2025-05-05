const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  startup_id: {
    type: String,
    index: true // Single field index
  },
  messsages: [{
    message: String,
    sender: String,
    created_at: {
      type: Date,
      default: Date.now,
      index: true // Optional: if you sort or query by message time
    }
  }]
});

// Compound index (optional): if you commonly query by startup_id + sender
// messageSchema.index({ "startup_id": 1, "messsages.sender": 1 });

// Create the model
const messageModel = mongoose.model("admin_messages", messageSchema);
module.exports = messageModel;
