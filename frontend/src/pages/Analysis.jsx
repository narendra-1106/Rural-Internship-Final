import React, { useState, useEffect } from 'react';
import api from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Plus, Edit, Trash2 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const Analysis = () => {
  const [charts, setCharts] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    problem_name: '', proposed_solution: '', expected_impact: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chartsRes, solutionsRes] = await Promise.all([
        api.get('/dashboard/charts'),
        api.get('/solutions')
      ]);
      setCharts(chartsRes.data);
      setSolutions(solutionsRes.data);
    } catch (error) {
      console.error('Error fetching analysis data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSolutionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/solutions/${editId}`, formData);
      } else {
        await api.post('/solutions', formData);
      }
      setShowModal(false);
      setFormData({ problem_name: '', proposed_solution: '', expected_impact: '' });
      setEditId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving solution', error);
    }
  };

  const handleSolutionDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this solution?')) {
      try {
        await api.delete(`/solutions/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting solution', error);
      }
    }
  };

  const handleSolutionEdit = (s) => {
    setEditId(s._id);
    setFormData({
      problem_name: s.problem_name,
      proposed_solution: s.proposed_solution,
      expected_impact: s.expected_impact
    });
    setShowModal(true);
  };

  const problemsData = {
    labels: charts?.problemsChart ? Object.keys(charts.problemsChart) : [],
    datasets: [{
      data: charts?.problemsChart ? Object.values(charts.problemsChart) : [],
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'],
    }]
  };

  // Calculate most reported problem
  let mostReported = 'None';
  let maxCount = 0;
  if (charts?.problemsChart) {
    for (const [prob, count] of Object.entries(charts.problemsChart)) {
      if (count > maxCount) {
        maxCount = count;
        mostReported = prob;
      }
    }
  }

  // Calculate total problems to show percentage
  const totalProblems = charts?.problemsChart ? Object.values(charts.problemsChart).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Problem Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Problem Distribution Chart</h3>
          {totalProblems > 0 ? (
            <div className="h-64 flex justify-center">
              <Pie data={problemsData} options={{ maintainAspectRatio: false }} />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">No problem data available</div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Percentage Analysis</h3>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm">
            <h4 className="font-semibold text-red-800">Most Reported Problem in the Village</h4>
            <p className="text-red-700 text-lg">{mostReported} <span className="text-sm">({maxCount} reports)</span></p>
          </div>
          
          <div className="space-y-4">
            {charts?.problemsChart && Object.entries(charts.problemsChart).map(([prob, count]) => {
              const percentage = totalProblems > 0 ? ((count / totalProblems) * 100).toFixed(1) : 0;
              return (
                <div key={prob}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{prob}</span>
                    <span className="text-gray-500">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Solution Planning Section</h2>
          <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary flex items-center text-sm py-1.5">
            <Plus size={16} className="mr-1" /> Add Proposed Solution
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {solutions.map(solution => (
            <div key={solution._id} className="card bg-primary-50 border-primary-100 flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-primary-900">{solution.problem_name}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => handleSolutionEdit(solution)} className="text-blue-600 hover:text-blue-800"><Edit size={16}/></button>
                  <button onClick={() => handleSolutionDelete(solution._id)} className="text-red-600 hover:text-red-800"><Trash2 size={16}/></button>
                </div>
              </div>
              <div className="mb-4 flex-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Proposed Solution</span>
                <p className="text-gray-800 text-sm mt-1">{solution.proposed_solution}</p>
              </div>
              <div className="bg-white p-3 rounded border border-primary-100">
                <span className="text-xs font-semibold text-gray-500 uppercase">Expected Impact</span>
                <p className="text-green-700 text-sm mt-1 font-medium">{solution.expected_impact}</p>
              </div>
            </div>
          ))}
          {solutions.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 card">
              No solutions proposed yet. Click 'Add Proposed Solution' to plan.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Solution' : 'Add Proposed Solution'}</h2>
            <form onSubmit={handleSolutionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Problem Name</label>
                <input type="text" required className="input-field" value={formData.problem_name} onChange={e => setFormData({...formData, problem_name: e.target.value})} placeholder="e.g., Water Shortage" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Proposed Solution</label>
                <textarea required className="input-field" rows="3" value={formData.proposed_solution} onChange={e => setFormData({...formData, proposed_solution: e.target.value})} placeholder="e.g., Construction of Borewell"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Impact</label>
                <textarea required className="input-field" rows="2" value={formData.expected_impact} onChange={e => setFormData({...formData, expected_impact: e.target.value})} placeholder="e.g., Improved water availability for villagers"></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
