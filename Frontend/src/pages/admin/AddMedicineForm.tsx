import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { API_BASE_URL } from '../../url';

interface MedicineFormData {
  name: string;
  genericName: string;
  strength: string;
  form: string;
  price: number;
  manufacturer: string;
  category: string;
  description: string;
}

const AddMedicineForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MedicineFormData>({
    name: '',
    genericName: '',
    strength: '',
    form: 'TABLET',
    price: 0,
    manufacturer: '',
    category: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminJwtToken');
      if (!token) throw new Error('No authentication token found');
      const payload = {
        ...formData,
        price: formData.price || 0, // Ensure price is a number
      };
      console.log('Form Data being sent:', JSON.stringify(payload, null, 2)); // Pretty print the data

      const response = await fetch(`${API_BASE_URL}/api/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Medicine added successfully');
        navigate('/admin/medicines');
      } else {
        const errorText = await response.text(); // Get detailed error message
        console.error('Server Response:', response.status, errorText);
        throw new Error(`Failed to add medicine: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Error adding medicine');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Add New Medicine</h2>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
              onClick={() => navigate('/admin/medicines')}
            >
              Back to List
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name *</label>
                <input
                  type="text"
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strength *</label>
                <input
                  type="text"
                  name="strength"
                  value={formData.strength}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form *</label>
                <select
                  name="form"
                  value={formData.form}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                >
                  <option value="TABLET">Tablet</option>
                  <option value="CAPSULE">Capsule</option>
                  <option value="SYRUP">Syrup</option>
                  <option value="INJECTION">Injection</option>
                  <option value="CREAM">Cream</option>
                  <option value="DROPS">Drops</option>
                  <option value="INHALER">Inhaler</option>
                  <option value="PATCH">Patch</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 h-24 resize-y"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
              >
                Add Medicine
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineForm;