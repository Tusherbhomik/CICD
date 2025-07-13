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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'admins' | 'pending'>('overview');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([]);

  // Memoize loadAdmins to prevent unnecessary re-creation
  const loadAdmins = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/list?page=0&size=10&sortBy=createdAt&sortDir=desc`, {
        headers: { 'X-Admin-Id': adminData?.id.toString() || '' },
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch admins');
      setAdmins(data.admins as Admin[]);
    } catch (error) {
      console.error('Failed to load admins:', error);
    }
  }, [adminData?.id]); // Dependency: adminData?.id

  // Memoize loadPendingAdmins to prevent unnecessary re-creation
  const loadPendingAdmins = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/pending`, {
        method: 'GET',
        headers: {
          'X-Admin-Id': adminData?.id.toString() || '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data: AdminListResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pending admins');
      }

      // Map AdminSummary to Admin type
      const mappedAdmins: Admin[] = data.admins.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        adminLevel: admin.adminLevel as 'ROOT_ADMIN' | 'ADMIN' | 'SUPPORT_ADMIN',
        status: admin.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL',
        createdAt: new Date(admin.createdAt),
        createdBy: parseInt(admin.createdBy, 10) || undefined,
        // Default values for fields not included in AdminSummary
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
    }
  }, [adminData?.id]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('adminData') || 'null') as AdminData | null;
    if (!data) {
      setIsLoading(false);
      return;
    }
    setAdminData(data);
    if (data.canManageAdmins) {
      loadAdmins();
      loadPendingAdmins();
    }
    setIsLoading(false);
  }, [loadAdmins, loadPendingAdmins]); // Include loadAdmins and loadPendingAdmins in the dependency array

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminData');
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center gap-2">
                <svg className="h-8 w-8 text-medical-primary" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2ollo 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                  <path d="M13 7h-2v6h6v-2h-4z" fill="#0ea5e9"/>
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
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('admins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'admins'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Admins ({admins.length})
            </button>
            {adminData.canManageAdmins && (
              <button
                onClick={() => setSelectedTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'pending'
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
                      <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <div className="ml-5">
                        <dt className="text-sm font-medium text-gray-500">System Status</dt>
                        <dd className="text-lg font-medium text-green-900">Healthy</dd>
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
                        </tr>
                      ))}
                      {pendingAdmins.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            No pending admin approvals at this time.
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