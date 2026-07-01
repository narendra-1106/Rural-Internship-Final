const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

// @route   GET /api/gallery
// @desc    Get all gallery photos
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const photos = await Gallery.find().sort({ upload_date: -1 });
    res.json(photos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/gallery
// @desc    Upload a new photo
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, image_data } = req.body;
    
    if (!title || !image_data) {
      return res.status(400).json({ msg: 'Title and image are required' });
    }

    const newPhoto = new Gallery({
      title,
      description,
      image_data
    });

    const photo = await newPhoto.save();
    res.json(photo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete a photo
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ msg: 'Photo not found' });
    }
    
    await photo.deleteOne();
    res.json({ msg: 'Photo removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Photo not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
