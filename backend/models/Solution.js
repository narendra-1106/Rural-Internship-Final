const mongoose = require('mongoose');

const SolutionSchema = new mongoose.Schema({
  problem_name: {
    type: String,
    required: true
  },
  proposed_solution: {
    type: String,
    required: true
  },
  expected_impact: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Solution', SolutionSchema);
