import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { API_BASE_URL } from '../../url';

interface MedicineFormData {
  id: number;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  price: string;
  manufacturer: string;
  category: string;
  description: string;
}

const EditMedicineForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MedicineFormData>({
    id: 0,
    name: '',
    genericName: '',
    strength: '',
    form: 'TABLET',
    price: '',
    manufacturer: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const token = localStorage.getItem('adminJwtToken');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_BASE_URL}/api/medicines/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            id: data.id,
            name: data.name,
            genericName: data.genericName,
            strength: data.strength,
            form: data.form,
            price: data.price,
            manufacturer: data.manufacturer || '',
            category: data.category || '',
            description: data.description || '',
          });
        } else {
          throw new Error('Failed to fetch medicine');
        }
      } catch (error) {
        console.error('Error fetching medicine:', error);
        alert('Error fetching medicine');
      }
    };
    if (id) fetchMedicine();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminJwtToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/api/medicines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Medicine updated successfully');
        navigate('/admin/medicines');
      } else {
        throw new Error('Failed to update medicine');
      }
    } catch (error) {
      console.error('Error updating medicine:', error);
      alert('Error updating medicine');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Edit Medicine</h2>
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
                Update Medicine
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMedicineForm;