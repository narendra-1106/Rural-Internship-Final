import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      console.error('Error fetching announcements', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/announcements/${editId}`, formData);
      } else {
        await api.post('/announcements', formData);
      }
      setShowModal(false);
      setFormData({ title: '', description: '' });
      setEditId(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement', error);
      }
    }
  };

  const handleEdit = (a) => {
    setEditId(a._id);
    setFormData({
      title: a.title,
      description: a.description
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Village Announcements</h1>
        <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" /> Add Announcement
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((a) => (
            <div key={a._id} className="card flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-gray-800 line-clamp-2">{a.title}</h3>
                <div className="flex space-x-2 ml-2">
                  <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(a._id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="flex-1 mb-4">
                <p className="text-gray-600 text-sm whitespace-pre-line">{a.description}</p>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-auto pt-4 border-t">
                <Calendar size={14} className="mr-1" />
                {new Date(a.date).toLocaleDateString()}
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="col-span-full card text-center py-12 text-gray-500">
              No announcements available.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Announcement' : 'Add New Announcement'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" required className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required className="input-field" rows="5" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
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

export default Announcements;
