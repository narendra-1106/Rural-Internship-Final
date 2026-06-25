const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Villager = require('../models/Villager');
const Survey = require('../models/Survey');
const Complaint = require('../models/Complaint');

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const totalVillagers = await Villager.countDocuments();
    
    // Total families could be approximated by distinct house numbers or just use total families count if structured that way.
    // Let's count distinct house numbers for total families.
    const families = await Villager.distinct('house_number');
    const totalFamilies = families.length;

    const totalSurveys = await Survey.countDocuments();
    
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });

    res.json({
      totalVillagers,
      totalFamilies,
      totalSurveys,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/dashboard/charts
// @desc    Get data for charts
// @access  Private
router.get('/charts', auth, async (req, res) => {
  try {
    // 1. Gender Distribution
    const maleCount = await Villager.countDocuments({ gender: 'Male' });
    const femaleCount = await Villager.countDocuments({ gender: 'Female' });

    // 2. Age Group Distribution
    const today = new Date();
    const villagers = await Villager.find({}, 'date_of_birth');
    
    let ageGroups = { '0-18': 0, '19-35': 0, '36-60': 0, '60+': 0 };
    
    villagers.forEach(v => {
      const birthDate = new Date(v.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 60) ageGroups['36-60']++;
      else ageGroups['60+']++;
    });

    // 3. Complaint Analysis
    const complaintStats = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const complaintsChart = {};
    complaintStats.forEach(stat => {
      complaintsChart[stat._id] = stat.count;
    });

    // 4. Village Problem Analysis
    const problemStats = await Survey.aggregate([
      { $group: { _id: "$main_problem", count: { $sum: 1 } } }
    ]);
    const problemsChart = {};
    problemStats.forEach(stat => {
      problemsChart[stat._id] = stat.count;
    });

    res.json({
      gender: { Male: maleCount, Female: femaleCount },
      ageGroups,
      complaintsChart,
      problemsChart
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
