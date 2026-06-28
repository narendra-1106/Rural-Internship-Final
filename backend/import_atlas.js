const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');

const Villager = require('./models/Villager');
const Survey = require('./models/Survey');

const uri = "mongodb://narendra1106:Narendra1106@ac-kwvf8pl-shard-00-00.oy5y6pj.mongodb.net:27017,ac-kwvf8pl-shard-00-01.oy5y6pj.mongodb.net:27017,ac-kwvf8pl-shard-00-02.oy5y6pj.mongodb.net:27017/retailpos?ssl=true&replicaSet=atlas-xrkycd-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log('MongoDB Atlas Connected for Import'))
  .catch(err => {
    console.error('MongoDB Atlas Connection Error: ', err);
    process.exit(1);
  });

const results = [];

fs.createReadStream('../frontend/Smart_Village_Survey_Data_74.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(`Parsed ${results.length} records. Starting import to Atlas...`);
    let imported = 0;
    
    // Clear existing data just in case they ran it multiple times
    await Villager.deleteMany({});
    await Survey.deleteMany({});
    console.log('Cleared existing Atlas data.');
    
    for (const row of results) {
      try {
        const villagerData = {
          full_name: row['Full Name'] || 'Unknown',
          house_number: row['House Number'] || 'Unknown',
          mobile_number: row['Mobile Number'] || '0000000000',
          gender: row['Gender'] || 'Other',
          date_of_birth: new Date('1990-01-01'),
          family_members_count: parseInt(row['Family Members Count']) || 1
        };

        const villager = new Villager(villagerData);
        await villager.save();

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
          internet_available: false,
          main_problem: mapProblem(row['Biggest Problem']),
          remarks: row['Suggested Solution'] || ''
        };

        const survey = new Survey(surveyData);
        await survey.save();
        
        imported++;
      } catch (err) {
        console.error('Error importing row:', row['Full Name'], err.message);
      }
    }
    
    console.log(`Successfully imported ${imported} records to MongoDB Atlas.`);
    process.exit(0);
  });
