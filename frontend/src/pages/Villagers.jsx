import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const Villagers = () => {
  const [villagers, setVillagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', house_number: '', mobile_number: '', alternate_mobile_number: '', gender: 'Male', date_of_birth: '', family_members_count: 1
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchVillagers();
  }, []);

  const fetchVillagers = async () => {
    try {
      const res = await api.get('/villagers');
      setVillagers(res.data);
    } catch (error) {
      console.error('Error fetching villagers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/villagers/${editId}`, formData);
      } else {
        await api.post('/villagers', formData);
      }
      setShowModal(false);
      setFormData({ full_name: '', house_number: '', mobile_number: '', alternate_mobile_number: '', gender: 'Male', date_of_birth: '', family_members_count: 1 });
      setEditId(null);
      fetchVillagers();
    } catch (error) {
      console.error('Error saving villager', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this villager?')) {
      try {
        await api.delete(`/villagers/${id}`);
        fetchVillagers();
      } catch (error) {
        console.error('Error deleting villager', error);
      }
    }
  };

  const handleEdit = (v) => {
    setEditId(v._id);
    setFormData({
      full_name: v.full_name,
      house_number: v.house_number,
      mobile_number: v.mobile_number,
      alternate_mobile_number: v.alternate_mobile_number || '',
      gender: v.gender,
      date_of_birth: v.date_of_birth.split('T')[0],
      family_members_count: v.family_members_count
    });
    setShowModal(true);
  };

  const filteredVillagers = villagers.filter(v => 
    v.full_name.toLowerCase().includes(search.toLowerCase()) || 
    v.house_number.toLowerCase().includes(search.toLowerCase()) ||
    v.mobile_number.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Villager Management</h1>
        <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" /> Add Villager
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
            placeholder="Search by name, house number, or mobile..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">House No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVillagers.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.house_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.mobile_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(v)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(v._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {filteredVillagers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No villagers found.</td>
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
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Villager' : 'Add New Villager'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" required className="input-field" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">House Number</label>
                  <input type="text" required className="input-field" value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <input type="text" required className="input-field" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alt Mobile Number</label>
                  <input type="text" className="input-field" value={formData.alternate_mobile_number} onChange={e => setFormData({...formData, alternate_mobile_number: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select required className="input-field" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input type="date" required className="input-field" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Family Members Count</label>
                  <input type="number" min="1" required className="input-field" value={formData.family_members_count} onChange={e => setFormData({...formData, family_members_count: e.target.value})} />
                </div>
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

export default Villagers;
