import React, { useState, useEffect } from 'react';
import { ImagePlus, Trash2, X, Loader2 } from 'lucide-react';
import api from '../api';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_data: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/gallery');
      setPhotos(res.data);
    } catch (err) {
      console.error('Error fetching photos', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData({ ...formData, image_data: reader.result });
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image_data) {
      setError('Title and Image are required');
      return;
    }

    setUploading(true);
    try {
      const res = await api.post('/gallery', formData);
      setPhotos([res.data, ...photos]);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', image_data: '' });
      setPreviewUrl('');
    } catch (err) {
      setError('Failed to upload image. It might be too large.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await api.delete(`/gallery/${id}`);
        setPhotos(photos.filter(photo => photo._id !== id));
      } catch (err) {
        console.error('Failed to delete photo', err);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary-600" size={48} /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Village Gallery</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <ImagePlus size={20} className="mr-2" />
          Add Photo
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <ImagePlus size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No photos yet</h3>
          <p className="text-gray-500">Upload photos to showcase village development and events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
              <div 
                className="aspect-w-4 aspect-h-3 bg-gray-100 relative cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.image_data} 
                  alt={photo.title} 
                  className="w-full h-48 object-cover object-center"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(photo._id); }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform hover:scale-110 transition-transform"
                    title="Delete Photo"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-1">{photo.title}</h3>
                {photo.description && <p className="text-gray-600 text-sm mb-2">{photo.description}</p>}
                <p className="text-xs text-gray-400">
                  Uploaded on {new Date(photo.upload_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Upload New Photo</h2>
              <button onClick={() => { setIsModalOpen(false); setPreviewUrl(''); setFormData({title: '', description: '', image_data: ''}); setError(''); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-4">
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">{error}</div>}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., New Village Road"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows="2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Image * (Max 5MB)</label>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>

              {previewUrl && (
                <div className="mb-6 rounded-md overflow-hidden border border-gray-200">
                  <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !formData.image_data}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
                >
                  {uploading ? <><Loader2 size={16} className="animate-spin mr-2" /> Uploading...</> : 'Upload Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            onClick={() => setSelectedPhoto(null)} 
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
          >
            <X size={24} />
          </button>
          <div className="max-w-5xl w-full max-h-screen flex flex-col items-center justify-center">
            <img 
              src={selectedPhoto.image_data} 
              alt={selectedPhoto.title} 
              className="max-w-full max-h-[85vh] object-contain rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold">{selectedPhoto.title}</h3>
              {selectedPhoto.description && <p className="mt-2 text-gray-300">{selectedPhoto.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
