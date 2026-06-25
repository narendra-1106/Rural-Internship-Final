import React, { useState } from 'react';
import api from '../api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import { FileDown, FileText } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [reportType, setReportType] = useState('villagers');

  // Fetch data to prepare CSV
  const prepareCSV = async (type) => {
    try {
      const res = await api.get(`/${type}`);
      let data = res.data;
      if (type === 'surveys') {
        data = data.map(s => ({
          'Villager Name': s.villager_id?.full_name,
          'House Number': s.villager_id?.house_number,
          'Drinking Water': s.water_available ? 'Yes' : 'No',
          'Toilet': s.toilet_available ? 'Yes' : 'No',
          'Electricity': s.electricity_available ? 'Yes' : 'No',
          'Internet': s.internet_available ? 'Yes' : 'No',
          'Main Problem': s.main_problem,
          'Remarks': s.remarks
        }));
      } else if (type === 'villagers') {
        data = data.map(v => ({
          'Full Name': v.full_name,
          'House Number': v.house_number,
          'Mobile Number': v.mobile_number,
          'Gender': v.gender,
          'Date of Birth': new Date(v.date_of_birth).toLocaleDateString(),
          'Family Members': v.family_members_count
        }));
      } else if (type === 'complaints') {
        data = data.map(c => ({
          'Villager Name': c.villager_name,
          'Mobile Number': c.mobile_number,
          'Category': c.category,
          'Description': c.description,
          'Date': new Date(c.complaint_date).toLocaleDateString(),
          'Status': c.status
        }));
      }
      setCsvData(data);
      setReportType(type);
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = async (type) => {
    setLoading(true);
    try {
      const res = await api.get(`/${type}`);
      const data = res.data;
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(`Smart Village Management System - ${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 14, 22);
      
      if (type === 'villagers') {
        doc.autoTable({
          startY: 30,
          head: [['Name', 'House No', 'Mobile', 'Gender', 'Family Size']],
          body: data.map(v => [v.full_name, v.house_number, v.mobile_number, v.gender, v.family_members_count]),
        });
      } else if (type === 'surveys') {
        doc.autoTable({
          startY: 30,
          head: [['Villager', 'House No', 'Main Problem', 'Water', 'Toilet', 'Elec', 'Net']],
          body: data.map(s => [
            s.villager_id?.full_name, 
            s.villager_id?.house_number, 
            s.main_problem,
            s.water_available ? 'Y' : 'N',
            s.toilet_available ? 'Y' : 'N',
            s.electricity_available ? 'Y' : 'N',
            s.internet_available ? 'Y' : 'N'
          ]),
        });
      } else if (type === 'complaints') {
        doc.autoTable({
          startY: 30,
          head: [['Villager', 'Mobile', 'Category', 'Status', 'Date']],
          body: data.map(c => [
            c.villager_name,
            c.mobile_number,
            c.category,
            c.status,
            new Date(c.complaint_date).toLocaleDateString()
          ]),
        });
      }

      doc.save(`SVMS_${type}_report.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ReportCard = ({ title, type, description }) => (
    <div className="card">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex space-x-3 mt-6">
        <button 
          onClick={() => generatePDF(type)}
          disabled={loading}
          className="flex-1 btn-primary flex items-center justify-center bg-red-600 hover:bg-red-700"
        >
          <FileDown size={18} className="mr-2" /> PDF Export
        </button>
        
        <div className="flex-1 flex" onClick={() => prepareCSV(type)}>
           <CSVLink 
             data={csvData.length > 0 && reportType === type ? csvData : []} 
             filename={`SVMS_${type}_report.csv`}
             className="w-full btn-primary flex items-center justify-center bg-green-600 hover:bg-green-700 text-center"
             onClick={(event) => {
               if(csvData.length === 0 || reportType !== type) {
                 prepareCSV(type);
                 event.preventDefault(); // Stop download until data is fetched
                 setTimeout(() => event.target.click(), 500); // Trigger again
               }
             }}
           >
             <FileDown size={18} className="mr-2" /> CSV Export
           </CSVLink>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Generate Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Villagers Report" 
          type="villagers" 
          description="Complete list of villagers including family details and contact info."
        />
        <ReportCard 
          title="Surveys Report" 
          type="surveys" 
          description="Results of household surveys, facility availability, and identified problems."
        />
        <ReportCard 
          title="Complaints Report" 
          type="complaints" 
          description="Records of registered complaints, their categories, and current status."
        />
      </div>
    </div>
  );
};

export default Reports;
