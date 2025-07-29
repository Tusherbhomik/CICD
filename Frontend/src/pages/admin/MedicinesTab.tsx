import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../url';

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

interface MedicinesTabProps {
  adminData: AdminData;
  medicines: Medicine[];
  formatDate: (dateString: string | Date | null) => string;
  showConfirmation: (title: string, message: string, onConfirm: () => void, type: 'approve' | 'suspend' | 'activate') => void;
  canPerformAdminActions: boolean;
}

const MedicinesTab = ({ adminData, medicines: initialMedicines, formatDate, showConfirmation, canPerformAdminActions }: MedicinesTabProps) => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMedicines(initialMedicines);
  }, [initialMedicines]);

  // Improved CSV parsing function that handles quotes and commas properly
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  // Function to normalize form values to match AddMedicineForm expectations
  const normalizeFormValue = (form: string): string => {
    const formMap: { [key: string]: string } = {
      'tablet': 'TABLET',
      'capsule': 'CAPSULE', 
      'syrup': 'SYRUP',
      'injection': 'INJECTION',
      'cream': 'CREAM',
      'drops': 'DROPS',
      'inhaler': 'INHALER',
      'patch': 'PATCH',
      'other': 'OTHER'
    };
    
    const normalized = form.toLowerCase().trim();
    return formMap[normalized] || form.toUpperCase();
  };

  const parseCSV = (csv: string): MedicineFormData[] => {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const medicines: MedicineFormData[] = [];
    
    // Skip header line (index 0), start from data rows (index 1)
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      // Expected CSV format: Name,Generic Name,Strength,Form,Price,Manufacturer,Category,Description
      if (values.length < 8) {
        console.warn(`Line ${i + 1} has insufficient columns, skipping:`, lines[i]);
        continue;
      }

      const medicine: MedicineFormData = {
        name: values[0]?.trim() || '',
        genericName: values[1]?.trim() || '',
        strength: values[2]?.trim() || '',
        form: normalizeFormValue(values[3] || 'TABLET'),
        price: parseFloat(values[4]) || 0,
        manufacturer: values[5]?.trim() || '',
        category: values[6]?.trim() || '',
        description: values[7]?.trim() || ''
      };

      // Validate required fields (same as form validation)
      if (medicine.name && medicine.genericName && medicine.strength && medicine.category) {
        medicines.push(medicine);
        console.log(`Parsed medicine: ${medicine.name} (Form: ${medicine.form})`);
      } else {
        console.warn(`Line ${i + 1} missing required fields, skipping:`, medicine);
      }
    }

    console.log(`Successfully parsed ${medicines.length} medicines from CSV`);
    return medicines;
  };

  // Function to add single medicine - exact copy of AddMedicineForm logic
  const addSingleMedicine = async (medicineData: MedicineFormData): Promise<boolean> => {
    try {
      const token = localStorage.getItem('adminJwtToken');
      if (!token) throw new Error('No authentication token found');
      
      const payload = {
        ...medicineData,
        price: medicineData.price || 0, // Ensure price is a number - same as AddMedicineForm
      };

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
        return true;
      } else {
        const errorText = await response.text();
        console.error('Server Response:', response.status, errorText);
        throw new Error(`Failed to add medicine: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      throw error;
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Reading file...');

    try {
      const text = await file.text();
      setUploadProgress('Parsing CSV...');
      
      const parsedMedicines = parseCSV(text);
      
      if (parsedMedicines.length === 0) {
        throw new Error('No valid medicine records found in CSV');
      }

      setUploadProgress(`Found ${parsedMedicines.length} medicines. Starting upload...`);

      // Upload medicines one by one using the exact same logic as AddMedicineForm
      let uploaded = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < parsedMedicines.length; i++) {
        const medicine = parsedMedicines[i];
        setUploadProgress(`Uploading ${i + 1}/${parsedMedicines.length}: ${medicine.name}`);
        
        try {
          await addSingleMedicine(medicine);
          uploaded++;
          console.log(`Successfully uploaded: ${medicine.name}`);
        } catch (error) {
          failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${medicine.name}: ${errorMessage}`);
          console.error(`Failed to upload ${medicine.name}:`, error);
        }
        
        // Small delay to avoid overwhelming the server
        if (i < parsedMedicines.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Show results and refresh if any were uploaded
      setUploadProgress('Upload completed!');
      
      if (uploaded > 0) {
        alert(`Upload completed!\nSuccessfully uploaded: ${uploaded} medicines\nFailed: ${failed} medicines\n\nPage will refresh to show new medicines.`);
        window.location.reload();
      } else {
        let message = `Upload failed!\nNo medicines were uploaded successfully.\nFailed: ${failed} medicines`;
        if (errors.length > 0) {
          message += `\n\nErrors:\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) {
            message += `\n... and ${errors.length - 5} more errors`;
          }
        }
        alert(message);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error uploading CSV: ${errorMessage}`);
      console.error('CSV Upload Error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadSampleCSV = () => {
    const sampleCSV = `Name,Generic Name,Strength,Form,Price,Manufacturer,Category,Description
Paracetamol 500mg,Acetaminophen,500mg,TABLET,10.50,Generic Pharma,Analgesic,Pain relief and fever reducer
Amoxicillin 250mg,Amoxicillin,250mg,CAPSULE,25.00,Antibiotic Labs,Antibiotic,Broad-spectrum antibiotic
Ibuprofen 400mg,Ibuprofen,400mg,TABLET,15.75,Pain Relief Inc,NSAID,Anti-inflammatory and pain relief
Cetirizine 10mg,Cetirizine,10mg,TABLET,12.00,AllergyCare Ltd,Antihistamine,Used for allergy relief
Metformin 500mg,Metformin,500mg,TABLET,18.25,Diabetex Pharma,Antidiabetic,Controls blood sugar in type 2 diabetes`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_medicines.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={downloadSampleCSV}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Download Sample CSV
            </Button>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button 
                variant="outline" 
                disabled={isUploading}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </Button>
            </div>
            <Link to="/admin/medicines/add">
              <Button className="bg-blue-600 hover:bg-blue-700">Add New Medicine</Button>
            </Link>
          </div>
        </div>
        
        {isUploading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">{uploadProgress}</span>
            </div>
          </div>
        )}

        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Upload Instructions:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• CSV format: Name,Generic Name,Strength,Form,Price,Manufacturer,Category,Description</li>
            <li>• All fields except Manufacturer and Description are required</li>
            <li>• Price should be numeric (e.g., 12, 18, 30)</li>
            <li>• Form can be: Tablet, Capsule, Syrup, Injection, Cream, Drops, Inhaler, Patch, Other (case insensitive)</li>
            <li>• Your CSV format is perfect! Just upload as-is</li>
          </ul>
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