const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
  villager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Villager',
    required: true
  },
  water_available: {
    type: Boolean,
    required: true
  },
  toilet_available: {
    type: Boolean,
    required: true
  },
  electricity_available: {
    type: Boolean,
    required: true
  },
  internet_available: {
    type: Boolean,
    required: true
  },
  main_problem: {
    type: String,
    required: true,
    enum: ['Water Problem', 'Road Problem', 'Electricity Problem', 'Garbage Problem', 'Drainage Problem', 'Other']
  },
  remarks: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Survey', SurveySchema);
