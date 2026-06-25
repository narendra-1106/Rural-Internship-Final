const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Survey = require('../models/Survey');

// @route   GET api/surveys
// @desc    Get all surveys
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const surveys = await Survey.find().populate('villager_id', ['full_name', 'house_number']).sort({ createdAt: -1 });
    res.json(surveys);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/surveys
// @desc    Add new survey
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newSurvey = new Survey(req.body);
    const survey = await newSurvey.save();
    res.json(survey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/surveys/:id
// @desc    Update survey
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(survey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/surveys/:id
// @desc    Delete survey
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    await Survey.findByIdAndDelete(req.params.id);
    res.json({ message: 'Survey removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
