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
  adminLevel: 'ROOT_ADMIN' | 'ADMIN' | 'SUPPORT_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';
  createdAt: Date;
  lastLogin?: Date | null;
  loginAttempts: number;
}

interface OverviewTabProps {
  adminData: AdminData;
  admins: Admin[];
  pendingAdmins: Admin[];
  formatDate: (dateString: string | Date | null) => string;
  getAdminLevelBadge: (level: Admin['adminLevel']) => string;
  getStatusBadge: (status: Admin['status']) => string;
}

const OverviewTab = ({ adminData, admins, pendingAdmins, formatDate, getAdminLevelBadge, getStatusBadge }: OverviewTabProps) => {
  const activeCount = admins.filter(a => a.status === 'ACTIVE').length;
  const suspendedCount = admins.filter(a => a.status === 'SUSPENDED').length;
  const rootCount = admins.filter(a => a.adminLevel === 'ROOT_ADMIN').length;

  const stats = [
    {
      label: 'Total Admins',
      value: admins.length,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: 'from-blue-600 to-indigo-600',
      bg: 'bg-blue-500/10',
      color: 'text-blue-400',
    },
    {
      label: 'Active Admins',
      value: activeCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-600 to-teal-600',
      bg: 'bg-emerald-500/10',
      color: 'text-emerald-400',
    },
    {
      label: 'Pending Approvals',
      value: pendingAdmins.length,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-600 to-orange-600',
      bg: 'bg-amber-500/10',
      color: 'text-amber-400',
      highlight: pendingAdmins.length > 0,
    },
    {
      label: 'Suspended',
      value: suspendedCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      gradient: 'from-red-600 to-rose-600',
      bg: 'bg-red-500/10',
      color: 'text-red-400',
    },
  ];

  const levelLabel: Record<string, string> = { ROOT_ADMIN: 'Root Admin', ADMIN: 'Admin', SUPPORT_ADMIN: 'Support' };

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-7 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-2xl" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                {adminData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Welcome back</p>
                <h2 className="text-xl font-bold text-white">{adminData.name}</h2>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Last login: {formatDate(adminData.lastLogin)} &nbsp;·&nbsp; {adminData.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getAdminLevelBadge(adminData.adminLevel)}`}>
              {adminData.adminLevel.replace(/_/g, ' ')}
            </span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusBadge(adminData.status)}`}>
              {adminData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-slate-900 border rounded-2xl p-6 ${stat.highlight ? 'border-amber-500/40' : 'border-slate-800'}`}>
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
            {stat.highlight && (
              <div className="mt-2 text-xs text-amber-400 font-medium">Needs attention</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent admins */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white">Recent Administrators</h3>
            <Link to="/admin/admins" className="text-xs text-red-400 hover:text-red-300 transition-colors">View all →</Link>
          </div>
          <div className="space-y-3">
            {admins.slice(0, 5).map(admin => (
              <div key={admin.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {admin.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{admin.name}</p>
                  <p className="text-xs text-slate-500">{levelLabel[admin.adminLevel]}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadge(admin.status)}`}>
                  {admin.status === 'PENDING_APPROVAL' ? 'Pending' : admin.status}
                </span>
              </div>
            ))}
            {admins.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No administrators yet</p>}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-5">Quick Actions</h3>
          <div className="space-y-3">
            {adminData.canManageAdmins && (
              <Link to="/admin/signup" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Create New Admin</p>
                  <p className="text-xs text-slate-500">Add a new administrator account</p>
                </div>
              </Link>
            )}
            {pendingAdmins.length > 0 && (
              <Link to="/admin/pending-approval" className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 rounded-xl transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-300">{pendingAdmins.length} Pending Approval{pendingAdmins.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-slate-500">Review and approve admin requests</p>
                </div>
              </Link>
            )}
            <Link to="/admin/hospitals" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Manage Hospitals</p>
                <p className="text-xs text-slate-500">Add or update hospital records</p>
              </div>
            </Link>
            <Link to="/admin/medicines" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Medicine Database</p>
                <p className="text-xs text-slate-500">Manage medicines and bulk upload</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
