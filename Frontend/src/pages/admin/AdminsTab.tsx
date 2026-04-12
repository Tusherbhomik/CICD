import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

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

interface AdminsTabProps {
  adminData: AdminData;
  admins: Admin[];
  formatDate: (dateString: string | Date | null) => string;
  getAdminLevelBadge: (level: Admin['adminLevel']) => string;
  getStatusBadge: (status: Admin['status']) => string;
  showConfirmation: (title: string, message: string, onConfirm: () => void, type: 'approve' | 'suspend' | 'activate') => void;
  actionLoading: { [key: string]: boolean };
  handleSuspendAdmin: (adminId: number, adminName: string) => Promise<void>;
}

const AdminsTab = ({ adminData, admins, formatDate, getAdminLevelBadge, getStatusBadge, showConfirmation, actionLoading, handleSuspendAdmin }: AdminsTabProps) => {
  const avatarColors = ['from-red-600 to-rose-500', 'from-blue-600 to-indigo-500', 'from-emerald-600 to-teal-500', 'from-purple-600 to-violet-500', 'from-amber-600 to-orange-500'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">All Administrators</h2>
          <p className="text-sm text-slate-400 mt-0.5">{admins.length} accounts registered in the system</p>
        </div>
        {adminData.canManageAdmins && (
          <Link to="/admin/signup">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Admin
            </button>
          </Link>
        )}
      </div>

      {/* Table card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Administrator</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {admins.map((admin, idx) => (
                <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                          {admin.name}
                          {admin.id === adminData.id && <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">You</span>}
                        </p>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getAdminLevelBadge(admin.adminLevel)}`}>
                      {admin.adminLevel.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadge(admin.status)}`}>
                      {admin.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDate(admin.lastLogin)}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDate(admin.createdAt)}</td>
                  <td className="px-6 py-4">
                    {admin.adminLevel === 'ROOT_ADMIN' ? (
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Protected
                      </span>
                    ) : admin.id === adminData.id ? (
                      <span className="text-xs text-slate-500">Current session</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {admin.status === 'ACTIVE' && (
                          <button
                            className="text-xs px-3 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => showConfirmation(
                              'Suspend Admin',
                              `Are you sure you want to suspend ${admin.name}? They will lose access to the admin panel.`,
                              () => handleSuspendAdmin(admin.id, admin.name),
                              'suspend'
                            )}
                            disabled={actionLoading[`suspend-${admin.id}`]}
                          >
                            {actionLoading[`suspend-${admin.id}`] ? 'Suspending...' : 'Suspend'}
                          </button>
                        )}
                        {admin.status === 'SUSPENDED' && (
                          <button
                            className="text-xs px-3 py-1.5 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            onClick={() => showConfirmation(
                              'Activate Admin',
                              `Reactivate ${admin.name}? They will regain access to the admin panel.`,
                              () => console.log('Activate to be implemented'),
                              'activate'
                            )}
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="text-slate-400 font-medium">No administrators found</p>
                    <p className="text-slate-600 text-sm mt-1">Add a new admin to get started</p>
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

export default AdminsTab;
