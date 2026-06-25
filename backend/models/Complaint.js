const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  villager_name: {
    type: String,
    required: true
  },
  mobile_number: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Water', 'Road', 'Electricity', 'Garbage', 'Drainage', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  complaint_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Resolved'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
