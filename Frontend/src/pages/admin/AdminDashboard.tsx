import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, Route, Routes, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { API_BASE_URL } from '../../url';
import OverviewTab from './OverviewTab';
import AdminsTab from './AdminsTab';
import PendingApprovalsTab from './PendingApprovalsTab';
import MedicinesTab from './MedicinesTab';
import AddMedicineForm from './AddMedicineForm';
import EditMedicineForm from './EditMedicineForm';

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

interface Admin {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  adminLevel: 'ROOT_ADMIN' | 'ADMIN' | 'SUPPORT_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';
  createdBy?: number;
  createdAt: Date;
  updatedAt?: Date | null;
  lastLogin?: Date | null;
  loginAttempts: number;
  accountLockedUntil?: Date | null;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'approve' | 'suspend' | 'activate';
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'approve'
  });

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

  const getAuthToken = useCallback(() => {
    return adminData?.token || localStorage.getItem('adminJwtToken');
  }, [adminData?.token]);

  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [getAuthToken]);

  const loadAdmins = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No JWT token available for loading admins');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/admin/list?page=0&size=50&sortBy=createdAt&sortDir=desc`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Please log in again');
          localStorage.removeItem('adminData');
          localStorage.removeItem('adminJwtToken');
          navigate('/admin/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setAdmins(data.admins as Admin[]);
    } catch (error) {
      console.error('Failed to load admins:', error);
      setAdmins([]);
    }
  }, [getAuthHeaders, getAuthToken, navigate]);

  const loadPendingAdmins = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No JWT token available for loading pending admins');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/admin/pending`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Please log in again');
          localStorage.removeItem('adminData');
          localStorage.removeItem('adminJwtToken');
          navigate('/admin/login');
          return;
        }
        if (response.status === 403) {
          console.error('Access denied: Only ROOT_ADMIN can view pending approvals');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const mappedAdmins: Admin[] = data.admins.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        adminLevel: admin.adminLevel as 'ROOT_ADMIN' | 'ADMIN' | 'SUPPORT_ADMIN',
        status: admin.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL',
        createdAt: new Date(admin.createdAt),
        createdBy: admin.createdBy ? parseInt(admin.createdBy, 10) : undefined,
        phone: undefined,
        password: '',
        updatedAt: null,
        lastLogin: null,
        loginAttempts: 0,
        accountLockedUntil: null,
      }));
      setPendingAdmins(mappedAdmins);
    } catch (error) {
      console.error('Failed to load pending admins:', error);
      setPendingAdmins([]);
    }
  }, [getAuthHeaders, getAuthToken, navigate]);

  const loadMedicines = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No JWT token available for loading medicines');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/medicines/search`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Please log in again');
          localStorage.removeItem('adminData');
          localStorage.removeItem('adminJwtToken');
          navigate('/admin/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setMedicines(data as Medicine[]);
    } catch (error) {
      console.error('Failed to load medicines:', error);
      setMedicines([]);
      showToast('Failed to load medicines', 'error');
    }
  }, [getAuthHeaders, getAuthToken, navigate]);

  const handleApproveAdmin = useCallback(async (adminId: number, adminName: string) => {
    const actionKey = `approve-${adminId}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${adminId}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve admin');
      }
      const result = await response.json();
      showToast(`${adminName} has been approved successfully!`);
      await Promise.all([loadAdmins(), loadPendingAdmins()]);
    } catch (error) {
      console.error('Failed to approve admin:', error);
      showToast(error instanceof Error ? error.message : 'Failed to approve admin', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [getAuthHeaders, loadAdmins, loadPendingAdmins]);

  const handleSuspendAdmin = useCallback(async (adminId: number, adminName: string) => {
    const actionKey = `suspend-${adminId}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${adminId}/suspend`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to suspend admin');
      }
      const result = await response.json();
      showToast(`${adminName} has been suspended successfully!`);
      await loadAdmins();
    } catch (error) {
      console.error('Failed to suspend admin:', error);
      showToast(error instanceof Error ? error.message : 'Failed to suspend admin', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [getAuthHeaders, loadAdmins]);

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'approve' | 'suspend' | 'activate'
  ) => {
    setShowConfirmDialog({
      show: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const handleLogout = async () => {
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_BASE_URL}/api/admin/logout`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminJwtToken');
      navigate('/admin/login');
    }
  };

  const getAdminLevelBadge = (level: Admin['adminLevel']) => {
    const badges: { [key in Admin['adminLevel']]: string } = {
      ROOT_ADMIN: 'bg-red-100 text-red-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      SUPPORT_ADMIN: 'bg-green-100 text-green-800',
    };
    return badges[level] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: Admin['status']) => {
    const badges: { [key in Admin['status']]: string } = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const canPerformAdminActions = (adminData?.adminLevel === 'ROOT_ADMIN')||((adminData?.adminLevel === 'ADMIN'));
  // const canPerformAdminActions = true;
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('adminData') || 'null') as AdminData | null;
    const token = localStorage.getItem('adminJwtToken');
    
    if (!data && !token) {
      setIsLoading(false);
      return;
    }

    if (token && !data) {
      console.warn('JWT token found but no admin data. Please log in again.');
      localStorage.removeItem('adminJwtToken');
      setIsLoading(false);
      return;
    }

    if (data && token && !data.token) {
      data.token = token;
      setAdminData(data);
      localStorage.setItem('adminData', JSON.stringify(data));
    } else {
      setAdminData(data);
    }

    if (data?.canManageAdmins) {
      loadAdmins();
      loadPendingAdmins();
      loadMedicines();
    }
    
    setIsLoading(false);
  }, [loadAdmins, loadPendingAdmins, loadMedicines]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7fbff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="min-h-screen bg-[#f7fbff] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You need to be logged in as an administrator to access this page.</p>
          <Link to="/admin/login">
            <Button className="bg-red-600 hover:bg-red-700 text-white">Go to Admin Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbff]">
      {showConfirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{showConfirmDialog.title}</h3>
            <p className="text-gray-600 mb-6">{showConfirmDialog.message}</p>
            <div className="flex space-x-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(prev => ({ ...prev, show: false }))}
              >
                Cancel
              </Button>
              <Button
                className={`${
                  showConfirmDialog.type === 'suspend' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                onClick={() => {
                  showConfirmDialog.onConfirm();
                  setShowConfirmDialog(prev => ({ ...prev, show: false }));
                }}
              >
                {showConfirmDialog.type === 'suspend' ? 'Suspend' : 
                 showConfirmDialog.type === 'approve' ? 'Approve' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center gap-2">
                <svg className="h-8 w-8 text-medical-primary" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" />
                  <path d="M13 7h-2v6h6v-2h-4z" fill="#0ea5e9" />
                </svg>
                <span className="text-2xl font-bold text-medical-primary">MedScribe</span>
              </Link>
              <span className="text-gray-500">|</span>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminData.name}</p>
                <p className="text-xs text-gray-500">{adminData.adminLevel.replace('_', ' ')}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/admin/"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${location.pathname === '/admin/' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Overview
            </Link>
            <Link
              to="/admin/admins"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${location.pathname === '/admin/admins' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              All Admins ({admins.length})
            </Link>
            {adminData.canManageAdmins && (
              <Link
                to="/admin/pending-approval"
                className={`py-4 px-1 border-b-2 font-medium text-sm ${location.pathname === '/admin/pending-approval' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Pending Approvals ({pendingAdmins.length})
                {pendingAdmins.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {pendingAdmins.length}
                  </span>
                )}
              </Link>
            )}
            {adminData.canManageAdmins && (
              <Link
                to="/admin/medicines"
                className={`py-4 px-1 border-b-2 font-medium text-sm ${location.pathname === '/admin/medicines' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Update Medicine DB ({medicines.length})
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Routes>
            <Route path="/" element={<OverviewTab adminData={adminData} admins={admins} pendingAdmins={pendingAdmins} formatDate={formatDate} getAdminLevelBadge={getAdminLevelBadge} getStatusBadge={getStatusBadge} />} />
            <Route path="/admins" element={<AdminsTab adminData={adminData} admins={admins} formatDate={formatDate} getAdminLevelBadge={getAdminLevelBadge} getStatusBadge={getStatusBadge} showConfirmation={showConfirmation} actionLoading={actionLoading} handleSuspendAdmin={handleSuspendAdmin} />} />
            <Route path="/pending-approval" element={<PendingApprovalsTab adminData={adminData} pendingAdmins={pendingAdmins} formatDate={formatDate} getAdminLevelBadge={getAdminLevelBadge} getStatusBadge={getStatusBadge} showConfirmation={showConfirmation} actionLoading={actionLoading} canPerformAdminActions={canPerformAdminActions} handleApproveAdmin={handleApproveAdmin} />} />
            <Route path="/medicines" element={<MedicinesTab adminData={adminData} medicines={medicines} formatDate={formatDate} showConfirmation={showConfirmation} canPerformAdminActions={canPerformAdminActions} />} />
            <Route path="/medicines/add" element={<AddMedicineForm />} />
            <Route path="/medicines/edit/:id" element={<EditMedicineForm />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;