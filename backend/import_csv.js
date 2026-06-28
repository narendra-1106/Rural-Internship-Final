const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Villager = require('./models/Villager');
const Survey = require('./models/Survey');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for Import'))
  .catch(err => {
    console.error('MongoDB Connection Error: ', err);
    process.exit(1);
  });

const results = [];

fs.createReadStream('../frontend/Smart_Village_Survey_Data_74.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(`Parsed ${results.length} records. Starting import...`);
    let imported = 0;
    
    for (const row of results) {
      try {
        // Prepare Villager data
        const villagerData = {
          full_name: row['Full Name'] || 'Unknown',
          house_number: row['House Number'] || 'Unknown',
          mobile_number: row['Mobile Number'] || '0000000000',
          gender: row['Gender'] || 'Other',
          date_of_birth: new Date('1990-01-01'), // Default date since it's missing in CSV
          family_members_count: parseInt(row['Family Members Count']) || 1
        };

        // Create Villager
        const villager = new Villager(villagerData);
        await villager.save();

        // Prepare Survey data
        const mapProblem = (problem) => {
          if (!problem) return 'Other';
          const p = problem.toLowerCase();
          if (p.includes('water')) return 'Water Problem';
          if (p.includes('road')) return 'Road Problem';
          if (p.includes('electric')) return 'Electricity Problem';
          if (p.includes('garbage')) return 'Garbage Problem';
          if (p.includes('drain')) return 'Drainage Problem';
          return 'Other';
        };

        const surveyData = {
          villager_id: villager._id,
          water_available: row['Drinking Water Available'] === 'Yes',
          electricity_available: row['Electricity Available'] === 'Yes',
          toilet_available: row['Toilet Available'] === 'Yes',
          internet_available: false, // Default since not in CSV
          main_problem: mapProblem(row['Biggest Problem']),
          remarks: row['Suggested Solution'] || ''
        };

        // Create Survey
        const survey = new Survey(surveyData);
        await survey.save();
        
        imported++;
      } catch (err) {
        console.error('Error importing row:', row['Full Name'], err.message);
      }
    }
    
    console.log(`Successfully imported ${imported} records.`);
    process.exit(0);
  });
