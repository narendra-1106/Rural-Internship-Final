import React, { useState, useEffect } from 'react';
import api from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Users, Home, ClipboardList, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts')
      ]);
      setStats(statsRes.data);
      setCharts(chartsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="card flex items-center p-4">
      <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [charts?.gender?.Male || 0, charts?.gender?.Female || 0],
      backgroundColor: ['#3b82f6', '#ec4899'],
    }]
  };

  const ageData = {
    labels: ['0-18', '19-35', '36-60', '60+'],
    datasets: [{
      label: 'Age Groups',
      data: [charts?.ageGroups['0-18'], charts?.ageGroups['19-35'], charts?.ageGroups['36-60'], charts?.ageGroups['60+']],
      backgroundColor: '#22c55e',
    }]
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Villagers" value={stats?.totalVillagers} icon={<Users size={24} className="text-blue-600" />} colorClass="bg-blue-100" />
        <StatCard title="Total Families" value={stats?.totalFamilies} icon={<Home size={24} className="text-purple-600" />} colorClass="bg-purple-100" />
        <StatCard title="Total Surveys" value={stats?.totalSurveys} icon={<ClipboardList size={24} className="text-indigo-600" />} colorClass="bg-indigo-100" />
        <StatCard title="Total Complaints" value={stats?.totalComplaints} icon={<AlertTriangle size={24} className="text-orange-600" />} colorClass="bg-orange-100" />
        <StatCard title="Pending" value={stats?.pendingComplaints} icon={<Clock size={24} className="text-yellow-600" />} colorClass="bg-yellow-100" />
        <StatCard title="Resolved" value={stats?.resolvedComplaints} icon={<CheckCircle size={24} className="text-green-600" />} colorClass="bg-green-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Gender Distribution</h3>
          <div className="h-64 flex justify-center">
            <Pie data={genderData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Age Group Distribution</h3>
          <div className="h-64">
            <Bar data={ageData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
