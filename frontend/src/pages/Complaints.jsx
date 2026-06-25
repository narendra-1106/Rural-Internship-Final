import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Plus, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    villager_name: '', mobile_number: '', category: 'Water', description: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (error) {
      console.error('Error fetching complaints', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/complaints/${editId}`, formData);
      } else {
        await api.post('/complaints', formData);
      }
      setShowModal(false);
      setFormData({ villager_name: '', mobile_number: '', category: 'Water', description: '' });
      setEditId(null);
      fetchComplaints();
    } catch (error) {
      console.error('Error saving complaint', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.delete(`/complaints/${id}`);
        fetchComplaints();
      } catch (error) {
        console.error('Error deleting complaint', error);
      }
    }
  };

  const handleEdit = (c) => {
    setEditId(c._id);
    setFormData({
      villager_name: c.villager_name,
      mobile_number: c.mobile_number,
      category: c.category,
      description: c.description
    });
    setShowModal(true);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Resolved' : 'Pending';
    try {
      await api.patch(`/complaints/${id}/status`, { status: newStatus });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.villager_name.toLowerCase().includes(search.toLowerCase()) || 
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Complaint Management</h1>
        <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" /> Add Complaint
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
            placeholder="Search by name or category..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {c.villager_name}
                      <div className="text-xs text-gray-500">{c.mobile_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{c.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(c.complaint_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleStatusToggle(c._id, c.status)}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                          c.status === 'Resolved' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
                        }`}
                      >
                        {c.status === 'Resolved' ? <CheckCircle size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                        {c.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No complaints found.</td>
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
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Complaint' : 'Add New Complaint'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Villager Name</label>
                <input type="text" required className="input-field" value={formData.villager_name} onChange={e => setFormData({...formData, villager_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input type="text" required className="input-field" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select required className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Water">Water</option>
                  <option value="Road">Road</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required className="input-field" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
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

export default Complaints;
