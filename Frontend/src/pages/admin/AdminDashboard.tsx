import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
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

interface AdminSummary {
  id: number;
  name: string;
  email: string;
  adminLevel: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

interface AdminListResponse {
  message: string;
  admins: AdminSummary[];
  totalCount: number;
  hasMoreData: boolean;
}

// New interface for Medicine data based on MedicineSearchDto
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
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Modified selectedTab to include new 'medicines' option
  const [selectedTab, setSelectedTab] = useState<'overview' | 'admins' | 'pending' | 'medicines'>('overview');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([]);
  // New state for medicines
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

  // Helper function to show toast notifications
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

  // Helper function to get JWT token
  const getAuthToken = useCallback(() => {
    const token = adminData?.token || localStorage.getItem('adminJwtToken');
    return token;
  }, [adminData?.token]);

  // Helper function to create auth headers
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

  // New function to load medicines
  const loadMedicines = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No JWT token available for loading medicines');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/medicines/search`, {
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

  // Handle admin approval
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
  }, [getAuthHeaders]);

  // Handle admin suspension
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
  }, [getAuthHeaders]);

  // Show confirmation dialog
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

  // Updated loadAdmins with JWT authentication
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

  // Updated loadPendingAdmins with JWT authentication
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

      const data: AdminListResponse = await response.json();

      if (!data.admins) {
        console.warn('No admins array in response');
        setPendingAdmins([]);
        return;
      }

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
      // Load medicines when admin has permission
      loadMedicines();
    }
    
    setIsLoading(false);
  }, [loadAdmins, loadPendingAdmins, loadMedicines]);

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

  // Check if current user can perform admin actions
  const canPerformAdminActions = adminData?.adminLevel === 'ROOT_ADMIN';

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
      {/* Confirmation Dialog */}
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
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${selectedTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('admins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${selectedTab === 'admins'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              All Admins ({admins.length})
            </button>
            {adminData.canManageAdmins && (
              <button
                onClick={() => setSelectedTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${selectedTab === 'pending'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Pending Approvals ({pendingAdmins.length})
                {pendingAdmins.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {pendingAdmins.length}
                  </span>
                )}
              </button>
            )}
            {/* New Update Medicine DB tab */}
            {adminData.canManageAdmins && (
              <button
                onClick={() => setSelectedTab('medicines')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${selectedTab === 'medicines'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Update Medicine DB ({medicines.length})
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Welcome back, {adminData.name}!</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    You're logged in as a {adminData.adminLevel.replace('_', ' ')}. Last login: {formatDate(adminData.lastLogin)}
                  </p>
                  <div className="mt-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAdminLevelBadge(adminData.adminLevel)}`}>
                      {adminData.adminLevel.replace('_', ' ')}
                    </span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(adminData.status)}`}>
                      {adminData.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <div className="ml-5">
                        <dt className="text-sm font-medium text-gray-500">Total Admins</dt>
                        <dd className="text-lg font-medium text-gray-900">{admins.length}</dd>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="ml-5">
                        <dt className="text-sm font-medium text-gray-500">Active Admins</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {admins.filter(admin => admin.status === 'ACTIVE').length}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
                {adminData.canManageAdmins && (
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-5">
                          <dt className="text-sm font-medium text-gray-500">Pending Approvals</dt>
                          <dd className="text-lg font-medium text-gray-900">{pendingAdmins.length}</dd>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      <div className="ml-5">
                        <dt className="text-sm font-medium text-gray-500">Suspended Admins</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {admins.filter(admin => admin.status === 'SUSPENDED').length}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {adminData.canManageAdmins && (
                      <Link to="/admin/signup">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Create New Admin</Button>
                      </Link>
                    )}
                    <Link to="/admin/profile">
                      <Button variant="outline" className="w-full">Edit Profile</Button>
                    </Link>
                    <Link to="/admin/settings">
                      <Button variant="outline" className="w-full">System Settings</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'admins' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">All Administrators</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        {canPerformAdminActions && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {admins.map(admin => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAdminLevelBadge(admin.adminLevel)}`}>
                              {admin.adminLevel.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(admin.status)}`}>
                              {admin.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(admin.lastLogin)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(admin.createdAt)}</td>
                          {canPerformAdminActions && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              {admin.adminLevel !== 'ROOT_ADMIN' && admin.id !== adminData.id && (
                                <>
                                  {admin.status === 'ACTIVE' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() => showConfirmation(
                                        'Suspend Admin',
                                        `Are you sure you want to suspend ${admin.name}? They will lose access to the admin panel.`,
                                        () => handleSuspendAdmin(admin.id, admin.name),
                                        'suspend'
                                      )}
                                      disabled={actionLoading[`suspend-${admin.id}`]}
                                    >
                                      {actionLoading[`suspend-${admin.id}`] ? 'Suspending...' : 'Suspend'}
                                    </Button>
                                  )}
                                  {admin.status === 'SUSPENDED' && (
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => showConfirmation(
                                        'Activate Admin',
                                        `Are you sure you want to reactivate ${admin.name}? They will regain access to the admin panel.`,
                                        () => {
                                          console.log('Activate functionality to be implemented');
                                        },
                                        'activate'
                                      )}
                                    >
                                      Activate
                                    </Button>
                                  )}
                                </>
                              )}
                              {admin.adminLevel === 'ROOT_ADMIN' && (
                                <span className="text-xs text-gray-500">Protected</span>
                              )}
                              {admin.id === adminData.id && (
                                <span className="text-xs text-gray-500">You</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'pending' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Admin Approvals</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested At</th>
                        {canPerformAdminActions && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingAdmins.map(admin => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAdminLevelBadge(admin.adminLevel)}`}>
                              {admin.adminLevel.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(admin.status)}`}>
                              {admin.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(admin.createdAt)}</td>
                          {canPerformAdminActions && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => showConfirmation(
                                  'Approve Admin',
                                  `Are you sure you want to approve ${admin.name}? They will gain access to the admin panel.`,
                                  () => handleApproveAdmin(admin.id, admin.name),
                                  'approve'
                                )}
                                disabled={actionLoading[`approve-${admin.id}`]}
                              >
                                {actionLoading[`approve-${admin.id}`] ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => showConfirmation(
                                  'Reject Admin',
                                  `Are you sure you want to reject ${admin.name}'s application? This action cannot be undone.`,
                                  () => {
                                    console.log('Reject functionality to be implemented');
                                  },
                                  'suspend'
                                )}
                              >
                                Reject
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {pendingAdmins.length === 0 && (
                        <tr>
                          <td colSpan={canPerformAdminActions ? 5 : 4} className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm">No pending admin approvals at this time.</p>
                              <p className="text-xs text-gray-400 mt-1">New admin requests will appear here for approval.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* New Update Medicine DB section */}
          {selectedTab === 'medicines' && (
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
                                onClick={() => showConfirmation(
                                  'Delete Medicine',
                                  `Are you sure you want to delete ${medicine.name}? This action cannot be undone.`,
                                  () => {
                                    console.log('Delete medicine functionality to be implemented');
                                  },
                                  'suspend'
                                )}
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
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;