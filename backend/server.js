const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth');
const villagerRoutes = require('./routes/villagers');
const surveyRoutes = require('./routes/surveys');
const complaintRoutes = require('./routes/complaints');
const announcementRoutes = require('./routes/announcements');
const solutionRoutes = require('./routes/solutions');
const dashboardRoutes = require('./routes/dashboard');
const galleryRoutes = require('./routes/gallery');

app.use('/api/auth', authRoutes);
app.use('/api/villagers', villagerRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/gallery', galleryRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error: ', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
