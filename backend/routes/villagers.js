const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Villager = require('../models/Villager');

// @route   GET api/villagers
// @desc    Get all villagers
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const villagers = await Villager.find().sort({ createdAt: -1 });
    res.json(villagers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/villagers/:id
// @desc    Get single villager
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const villager = await Villager.findById(req.params.id);
    if (!villager) return res.status(404).json({ message: 'Villager not found' });
    res.json(villager);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/villagers
// @desc    Add new villager
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newVillager = new Villager(req.body);
    const villager = await newVillager.save();
    res.json(villager);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/villagers/:id
// @desc    Update villager
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let villager = await Villager.findById(req.params.id);
    if (!villager) return res.status(404).json({ message: 'Villager not found' });

    villager = await Villager.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(villager);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/villagers/:id
// @desc    Delete villager
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const villager = await Villager.findById(req.params.id);
    if (!villager) return res.status(404).json({ message: 'Villager not found' });

    await Villager.findByIdAndDelete(req.params.id);
    res.json({ message: 'Villager removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
