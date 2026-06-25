const mongoose = require('mongoose');

const VillagerSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  house_number: {
    type: String,
    required: true
  },
  mobile_number: {
    type: String,
    required: true
  },
  alternate_mobile_number: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  family_members_count: {
    type: Number,
    required: true,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Villager', VillagerSchema);
