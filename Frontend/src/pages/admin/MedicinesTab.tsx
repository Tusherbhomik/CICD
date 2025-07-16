import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../url'; // Ensure this is defined in your project

interface AdminData {
  id: number;
  name: string;
  email: string;
  adminLevel: 'ROOT_ADMIN' | 'ADMIN' | 'SUPPORT_ADMIN';
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'INACTIVE';
  canManageAdmins: boolean;
  lastLogin: string | null;
  loginTime: string;
  token?: string;
}

interface Medicine {
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

interface MedicinesTabProps {
  adminData: AdminData;
  medicines: Medicine[];
  formatDate: (dateString: string | Date | null) => string;
  showConfirmation: (title: string, message: string, onConfirm: () => void, type: 'approve' | 'suspend' | 'activate') => void;
  canPerformAdminActions: boolean;
}

const MedicinesTab = ({ adminData, medicines: initialMedicines, formatDate, showConfirmation, canPerformAdminActions }: MedicinesTabProps) => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);

  useEffect(() => {
    setMedicines(initialMedicines);
  }, [initialMedicines]);

  const handleDelete = async (id: number, name: string) => {
    const token = adminData.token || localStorage.getItem('adminJwtToken');
    if (!token) {
      alert('No authentication token found');
      return;
    }

    showConfirmation(
      'Delete Medicine',
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/medicines/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            alert('Medicine deleted successfully');
            // Update the local state to remove the deleted medicine
            setMedicines(medicines.filter(medicine => medicine.id !== id));
          } else {
            const errorText = await response.text();
            alert(`Failed to delete medicine: ${errorText}`);
          }
        } catch (error) {
          console.error('Error deleting medicine:', error);
          alert('An error occurred while deleting the medicine');
        }
      },
      'suspend'
    );
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Medicine Database</h3>
          <Link to="/admin/medicines/add">
            <Button className="bg-blue-600 hover:bg-blue-700">Add New Medicine</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generic Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strength</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Form</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                {canPerformAdminActions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.map(medicine => (
                <tr key={medicine.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.genericName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.strength}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.form}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.manufacturer || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.category}</td>
                  {canPerformAdminActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link to={`/admin/medicines/edit/${medicine.id}`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(medicine.id, medicine.name)}
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {medicines.length === 0 && (
                <tr>
                  <td colSpan={canPerformAdminActions ? 8 : 7} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">No medicines found in the database.</p>
                      <p className="text-xs text-gray-400 mt-1">Add new medicines to populate the database.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicinesTab;