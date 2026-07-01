const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image_data: {
    type: String,
    required: true, // This will store the Base64 string of the image
  },
  upload_date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Gallery', gallerySchema);
