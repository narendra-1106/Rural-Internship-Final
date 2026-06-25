import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [villagers, setVillagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    villager_id: '', water_available: false, toilet_available: false, electricity_available: false, internet_available: false, main_problem: 'Water Problem', remarks: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [surveysRes, villagersRes] = await Promise.all([
        api.get('/surveys'),
        api.get('/villagers')
      ]);
      setSurveys(surveysRes.data);
      setVillagers(villagersRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/surveys/${editId}`, formData);
      } else {
        await api.post('/surveys', formData);
      }
      setShowModal(false);
      setFormData({ villager_id: '', water_available: false, toilet_available: false, electricity_available: false, internet_available: false, main_problem: 'Water Problem', remarks: '' });
      setEditId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving survey', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        await api.delete(`/surveys/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting survey', error);
      }
    }
  };

  const handleEdit = (s) => {
    setEditId(s._id);
    setFormData({
      villager_id: s.villager_id._id,
      water_available: s.water_available,
      toilet_available: s.toilet_available,
      electricity_available: s.electricity_available,
      internet_available: s.internet_available,
      main_problem: s.main_problem,
      remarks: s.remarks || ''
    });
    setShowModal(true);
  };

  const filteredSurveys = surveys.filter(s => 
    s.villager_id?.full_name.toLowerCase().includes(search.toLowerCase()) || 
    s.villager_id?.house_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Survey Management</h1>
        <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" /> Add Survey
        </button>
      </div>

      <div className="card">
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by villager name or house number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Villager</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">House No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Main Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSurveys.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.villager_id?.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.villager_id?.house_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {s.main_problem}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {filteredSurveys.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No surveys found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Survey' : 'Add New Survey'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Villager</label>
                <select required className="input-field" value={formData.villager_id} onChange={e => setFormData({...formData, villager_id: e.target.value})}>
                  <option value="">-- Select Villager --</option>
                  {villagers.map(v => (
                    <option key={v._id} value={v._id}>{v.full_name} (House: {v.house_number})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.water_available} onChange={e => setFormData({...formData, water_available: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm font-medium text-gray-700">Drinking Water Available</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.toilet_available} onChange={e => setFormData({...formData, toilet_available: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm font-medium text-gray-700">Toilet Available</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.electricity_available} onChange={e => setFormData({...formData, electricity_available: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm font-medium text-gray-700">Electricity Available</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.internet_available} onChange={e => setFormData({...formData, internet_available: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm font-medium text-gray-700">Internet Available</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Main Problem Faced</label>
                <select required className="input-field" value={formData.main_problem} onChange={e => setFormData({...formData, main_problem: e.target.value})}>
                  <option value="Water Problem">Water Problem</option>
                  <option value="Road Problem">Road Problem</option>
                  <option value="Electricity Problem">Electricity Problem</option>
                  <option value="Garbage Problem">Garbage Problem</option>
                  <option value="Drainage Problem">Drainage Problem</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea className="input-field" rows="3" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})}></textarea>
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

export default Surveys;
