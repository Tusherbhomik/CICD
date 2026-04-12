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

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
}

interface HospitalFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
}

interface HospitalsTabProps {
  adminData: AdminData;
  hospitals: Hospital[];
  formatDate: (dateString: string | Date | null) => string;
  showConfirmation: (title: string, message: string, onConfirm: () => void, type: 'approve' | 'suspend' | 'activate') => void;
  canPerformAdminActions: boolean;
}

const HospitalsTab = ({ adminData, hospitals: initialHospitals, formatDate, showConfirmation, canPerformAdminActions }: HospitalsTabProps) => {
  const [hospitals, setHospitals] = useState<Hospital[]>(initialHospitals);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHospitals(initialHospitals);
  }, [initialHospitals]);

  // Improved CSV parsing function that handles quotes and commas properly
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (nextChar === '"') {
          current += '"';
          i++; // Skip the next quote
        } else {
          inQuotes = false;
        }
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

  const parseCSV = (text: string): HospitalFormData[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Skip header row
    const dataLines = lines.slice(1);
    
    return dataLines.map(line => {
      const values = parseCSVLine(line);
      
      // Normalize values and remove quotes
      const cleanValues = values.map(val => 
        val.replace(/^"(.*)"$/, '$1').replace(/""/g, '"').trim()
      );

      return {
        name: cleanValues[0] || '',
        address: cleanValues[1] || '',
        city: cleanValues[2] || '',
        state: cleanValues[3] || '',
        zipCode: cleanValues[4] || '',
        phone: cleanValues[5] || '',
        email: cleanValues[6] || '',
        website: cleanValues[7] || '',
      };
    }).filter(hospital => hospital.name); // Filter out entries without names
  };

  const addSingleHospital = async (hospitalData: HospitalFormData): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('adminJwtToken');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await fetch(`${API_BASE_URL}/api/hospitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(hospitalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true, message: 'Hospital added successfully' };
    } catch (error) {
      console.error('Error adding hospital:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showToast('Please select a valid CSV file', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Reading file...');

    try {
      const text = await file.text();
      const hospitalsData = parseCSV(text);

      if (hospitalsData.length === 0) {
        showToast('No valid hospital data found in the CSV file', 'error');
        setIsUploading(false);
        return;
      }

      setUploadProgress(`Processing ${hospitalsData.length} hospitals...`);

      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < hospitalsData.length; i++) {
        const hospital = hospitalsData[i];
        setUploadProgress(`Processing hospital ${i + 1} of ${hospitalsData.length}: ${hospital.name}`);

        const result = await addSingleHospital(hospital);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
          errors.push(`${hospital.name}: ${result.message}`);
        }

        // Add a small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setUploadProgress('');
      
      if (successful > 0) {
        showToast(`Successfully added ${successful} hospitals`, 'success');
        // Refresh the page to show updated data
        window.location.reload();
      }
      
      if (failed > 0) {
        console.error('Failed hospitals:', errors);
        showToast(`${failed} hospitals failed to upload. Check console for details.`, 'error');
      }

    } catch (error) {
      console.error('Error processing CSV:', error);
      showToast('Error processing CSV file', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['name', 'address', 'city', 'state', 'zipCode', 'phone', 'email', 'website'],
      ['Square Hospital Ltd', '18/F Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath', 'Dhaka', 'Dhaka Division', '1205', '+88028159457', 'info@squarehospital.com', 'http://www.squarehospital.com'],
      ['Evercare Hospital Dhaka', 'Plot 81, Block E, Bashundhara R/A', 'Dhaka', 'Dhaka Division', '1229', '+880255037242', '', 'https://www.evercarebd.com'],
      ['United Hospital Limited', 'Plot 15, Road 71, Gulshan 2', 'Dhaka', 'Dhaka Division', '1212', '+8809666710678', 'info@uhlbd.com', 'https://www.uhlbd.com'],
    ];

    const csvContent = sampleData.map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_hospitals.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  if (!canPerformAdminActions) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You don't have permission to manage hospitals.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hospital Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage hospital records in the system. You can add hospitals individually or upload in bulk via CSV.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={downloadSampleCSV}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Download Sample CSV
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              ref={fileInputRef}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </div>
          <Link to="/admin/hospitals/add">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Add New Hospital
            </Button>
          </Link>
        </div>
      </div>

      {isUploading && uploadProgress && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800">{uploadProgress}</span>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              All Hospitals ({hospitals.length})
            </h3>
          </div>
          
          {hospitals.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hospitals</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new hospital.</p>
              <div className="mt-6">
                <Link to="/admin/hospitals/add">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Add New Hospital
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hospitals.map((hospital) => (
                    <tr key={hospital.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              <Link 
                                to={`/admin/hospitals/${hospital.id}`}
                                className="hover:text-red-600 hover:underline"
                              >
                                {hospital.name}
                              </Link>
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {hospital.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{hospital.city}, {hospital.state}</div>
                        <div className="text-sm text-gray-500">{hospital.zipCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{hospital.phone}</div>
                        <div className="text-sm text-gray-500">{hospital.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/hospitals/${hospital.id}`}
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/admin/hospitals/edit/${hospital.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalsTab;
