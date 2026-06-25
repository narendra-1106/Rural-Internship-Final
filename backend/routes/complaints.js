const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Complaint = require('../models/Complaint');

// @route   GET api/complaints
// @desc    Get all complaints
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/complaints
// @desc    Add new complaint
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    const complaint = await newComplaint.save();
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/complaints/:id
// @desc    Update complaint
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/complaints/:id/status
// @desc    Update complaint status
// @access  Private
router.patch('/:id/status', auth, async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = req.body.status;
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/complaints/:id
// @desc    Delete complaint
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
