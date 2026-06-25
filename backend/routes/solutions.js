const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Solution = require('../models/Solution');

// @route   GET api/solutions
// @desc    Get all solutions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const solutions = await Solution.find().sort({ createdAt: -1 });
    res.json(solutions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/solutions
// @desc    Add new solution
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newSolution = new Solution(req.body);
    const solution = await newSolution.save();
    res.json(solution);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/solutions/:id
// @desc    Update solution
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let solution = await Solution.findById(req.params.id);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    solution = await Solution.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(solution);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/solutions/:id
// @desc    Delete solution
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    await Solution.findByIdAndDelete(req.params.id);
    res.json({ message: 'Solution removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
