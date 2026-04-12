import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, Route, Routes, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../url';
import OverviewTab from './OverviewTab';
import AdminsTab from './AdminsTab';
import PendingApprovalsTab from './PendingApprovalsTab';
import MedicinesTab from './MedicinesTab';
import AddMedicineForm from './AddMedicineForm';
import EditMedicineForm from './EditMedicineForm';
import HospitalsTab from './HospitalsTab';
import AddHospitalForm from './AddHospitalForm';
import EditHospitalForm from './EditHospitalForm';
import HospitalDetails from './HospitalDetails';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'approve' | 'suspend' | 'activate';
  }>({ show: false, title: '', message: '', onConfirm: () => {}, type: 'approve' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium text-white flex items-center gap-2 ${
      type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
    }`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { if (document.body.contains(toast)) document.body.removeChild(toast); }, 3000);
  };

  const getAuthToken = useCallback(() => adminData?.token || localStorage.getItem('adminJwtToken'), [adminData?.token]);

  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [getAuthToken]);

  const loadAdmins = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/admin/list?page=0&size=50&sortBy=createdAt&sortDir=desc`, {
        method: 'GET', headers: getAuthHeaders(), credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('adminData'); localStorage.removeItem('adminJwtToken'); navigate('/admin/login'); return; }
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setAdmins(data.admins as Admin[]);
    } catch { setAdmins([]); }
  }, [getAuthHeaders, getAuthToken, navigate]);

  const loadPendingAdmins = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/admin/pending`, {
        method: 'GET', headers: getAuthHeaders(), credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('adminData'); localStorage.removeItem('adminJwtToken'); navigate('/admin/login'); return; }
        if (response.status === 403) return;
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const mapped: Admin[] = data.admins.map((a) => ({
        id: a.id, name: a.name, email: a.email,
        adminLevel: a.adminLevel as Admin['adminLevel'],
        status: a.status as Admin['status'],
        createdAt: new Date(a.createdAt),
        createdBy: a.createdBy ? parseInt(a.createdBy, 10) : undefined,
        phone: undefined, password: '', updatedAt: null, lastLogin: null, loginAttempts: 0, accountLockedUntil: null,
      }));
      setPendingAdmins(mapped);
    } catch { setPendingAdmins([]); }
  }, [getAuthHeaders, getAuthToken, navigate]);

  const loadMedicines = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/medicines/search`, {
        method: 'GET', headers: getAuthHeaders(), credentials: 'include',
      });
      if (!response.ok) { if (response.status === 401) { navigate('/admin/login'); return; } throw new Error(`HTTP ${response.status}`); }
      const data = await response.json();
      setMedicines(data as Medicine[]);
    } catch { setMedicines([]); }
  }, [getAuthHeaders, getAuthToken, navigate]);

  const loadHospitals = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/hospitals`, {
        method: 'GET', headers: getAuthHeaders(), credentials: 'include',
      });
      if (!response.ok) { if (response.status === 401) { navigate('/admin/login'); return; } throw new Error(`HTTP ${response.status}`); }
      const data = await response.json();
      setHospitals(data as Hospital[]);
    } catch { setHospitals([]); }
  }, [getAuthHeaders, getAuthToken, navigate]);

  const handleApproveAdmin = useCallback(async (adminId: number, adminName: string) => {
    const key = `approve-${adminId}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${adminId}/approve`, {
        method: 'PUT', headers: getAuthHeaders(), credentials: 'include',
      });
      if (!response.ok) { const e = await response.json(); throw new Error(e.message || 'Failed'); }
      showToast(`${adminName} approved successfully!`);
      await Promise.all([loadAdmins(), loadPendingAdmins()]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to approve admin', 'error');
    } finally { setActionLoading(prev => ({ ...prev, [key]: false })); }
  }, [getAuthHeaders, loadAdmins, loadPendingAdmins]);

  const handleSuspendAdmin = useCallback(async (adminId: number, adminName: string) => {
    const key = `suspend-${adminId}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${adminId}/suspend`, {
        method: 'PUT', headers: getAuthHeaders(), credentials: 'include',
      });
      if (!response.ok) { const e = await response.json(); throw new Error(e.message || 'Failed'); }
      showToast(`${adminName} suspended successfully!`);
      await loadAdmins();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to suspend admin', 'error');
    } finally { setActionLoading(prev => ({ ...prev, [key]: false })); }
  }, [getAuthHeaders, loadAdmins]);

  const showConfirmation = (title: string, message: string, onConfirm: () => void, type: 'approve' | 'suspend' | 'activate') => {
    setShowConfirmDialog({ show: true, title, message, onConfirm, type });
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/logout`, { method: 'POST', headers: getAuthHeaders(), credentials: 'include' });
    } catch {}
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminJwtToken');
    navigate('/admin/login');
  };

  const getAdminLevelBadge = (level: Admin['adminLevel']) => {
    const map = { ROOT_ADMIN: 'bg-red-500/20 text-red-300 border border-red-500/30', ADMIN: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', SUPPORT_ADMIN: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
    return map[level] || 'bg-slate-700 text-slate-300';
  };

  const getStatusBadge = (status: Admin['status']) => {
    const map = { ACTIVE: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', PENDING_APPROVAL: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', SUSPENDED: 'bg-red-500/20 text-red-300 border border-red-500/30', INACTIVE: 'bg-slate-600/40 text-slate-400 border border-slate-600/40' };
    return map[status] || 'bg-slate-700 text-slate-300';
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const canPerformAdminActions = adminData?.adminLevel === 'ROOT_ADMIN' || adminData?.adminLevel === 'ADMIN';

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('adminData') || 'null') as AdminData | null;
    const token = localStorage.getItem('adminJwtToken');
    if (!data && !token) { setIsLoading(false); return; }
    if (token && !data) { localStorage.removeItem('adminJwtToken'); setIsLoading(false); return; }
    if (data && token && !data.token) { data.token = token; setAdminData(data); localStorage.setItem('adminData', JSON.stringify(data)); }
    else setAdminData(data);
    loadAdmins(); loadHospitals();
    if (data?.canManageAdmins) loadPendingAdmins();
    setIsLoading(false);
  }, [loadAdmins, loadPendingAdmins, loadHospitals]);

  const navItems = [
    { path: '/admin', label: 'Overview', exact: true, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { path: '/admin/admins', label: 'Administrators', badge: admins.length, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )},
    ...(adminData?.canManageAdmins ? [{ path: '/admin/pending-approval', label: 'Pending Approvals', badge: pendingAdmins.length, highlight: pendingAdmins.length > 0, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )}] : []),
    ...(adminData?.canManageAdmins ? [{ path: '/admin/medicines', label: 'Medicine Database', badge: null, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
    )}] : []),
    ...(adminData?.canManageAdmins ? [{ path: '/admin/hospitals', label: 'Hospitals', badge: hospitals.length, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    )}] : []),
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === '/admin' || location.pathname === '/admin/';
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  const levelColors: Record<string, string> = { ROOT_ADMIN: 'text-red-400', ADMIN: 'text-blue-400', SUPPORT_ADMIN: 'text-emerald-400' };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-10 max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-slate-400 mb-6">You need to be logged in as an administrator to access this page.</p>
          <Link to="/admin/login" className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors">Go to Admin Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Confirm Dialog */}
      {showConfirmDialog.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 p-7 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${showConfirmDialog.type === 'suspend' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
              <svg className={`w-6 h-6 ${showConfirmDialog.type === 'suspend' ? 'text-red-400' : 'text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showConfirmDialog.type === 'suspend' ? "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{showConfirmDialog.title}</h3>
            <p className="text-slate-400 text-sm mb-6">{showConfirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowConfirmDialog(prev => ({ ...prev, show: false }))} className="px-4 py-2 text-sm text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${showConfirmDialog.type === 'suspend' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                onClick={() => { showConfirmDialog.onConfirm(); setShowConfirmDialog(prev => ({ ...prev, show: false })); }}
              >
                {showConfirmDialog.type === 'suspend' ? 'Suspend' : showConfirmDialog.type === 'approve' ? 'Approve' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">HealthSync</p>
              <p className="text-slate-500 text-xs">Admin Console</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path, (item as any).exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className={active ? 'text-red-400' : 'text-slate-500'}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {(item as any).badge !== undefined && (item as any).badge > 0 && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(item as any).highlight ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'}`}>
                    {(item as any).badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {adminData.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{adminData.name}</p>
              <p className={`text-xs font-medium ${levelColors[adminData.adminLevel] || 'text-slate-400'}`}>
                {adminData.adminLevel.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            {(() => {
              const current = navItems.find(n => isActive(n.path, (n as any).exact));
              return (
                <>
                  <h1 className="text-lg font-bold text-white">{current?.label || 'Dashboard'}</h1>
                  <p className="text-xs text-slate-500">HealthSync Administration</p>
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getStatusBadge(adminData.status)}`}>
              {adminData.status}
            </span>
            <span className="text-xs text-slate-500">
              Last login: {formatDate(adminData.lastLogin)}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          <Routes>
            <Route index element={<OverviewTab adminData={adminData} admins={admins} pendingAdmins={pendingAdmins} formatDate={formatDate} getAdminLevelBadge={getAdminLevelBadge} getStatusBadge={getStatusBadge} />} />
            <Route path="overview" element={<OverviewTab adminData={adminData} admins={admins} pendingAdmins={pendingAdmins} formatDate={formatDate} getAdminLevelBadge={getAdminLevelBadge} getStatusBadge={getStatusBadge} />} />
            <Route path="admins" element={<AdminsTab adminData={adminData} admins={admins} formatDate={formatDate} getAdminLevelBadge={getAdminLevelBadge} getStatusBadge={getStatusBadge} showConfirmation={showConfirmation} actionLoading={actionLoading} handleSuspendAdmin={handleSuspendAdmin} />} />
            <Route path="pending-approval" element={<PendingApprovalsTab adminData={adminData} pendingAdmins={pendingAdmins} formatDate={formatDate} getAdminLevelBadge={getAdminLevelBadge} getStatusBadge={getStatusBadge} showConfirmation={showConfirmation} actionLoading={actionLoading} canPerformAdminActions={canPerformAdminActions} handleApproveAdmin={handleApproveAdmin} />} />
            <Route path="medicines" element={<MedicinesTab adminData={adminData} medicines={medicines} formatDate={formatDate} showConfirmation={showConfirmation} canPerformAdminActions={canPerformAdminActions} />} />
            <Route path="medicines/add" element={<AddMedicineForm />} />
            <Route path="medicines/edit/:id" element={<EditMedicineForm />} />
            <Route path="hospitals" element={<HospitalsTab adminData={adminData} hospitals={hospitals} formatDate={formatDate} showConfirmation={showConfirmation} canPerformAdminActions={canPerformAdminActions} />} />
            <Route path="hospitals/add" element={<AddHospitalForm />} />
            <Route path="hospitals/edit/:id" element={<EditHospitalForm />} />
            <Route path="hospitals/:id" element={<HospitalDetails />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
