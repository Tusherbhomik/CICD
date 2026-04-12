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

interface PendingApprovalsTabProps {
  adminData: AdminData;
  pendingAdmins: Admin[];
  formatDate: (dateString: string | Date | null) => string;
  getAdminLevelBadge: (level: Admin['adminLevel']) => string;
  getStatusBadge: (status: Admin['status']) => string;
  showConfirmation: (title: string, message: string, onConfirm: () => void, type: 'approve' | 'suspend' | 'activate') => void;
  actionLoading: { [key: string]: boolean };
  canPerformAdminActions: boolean;
  handleApproveAdmin: (adminId: number, adminName: string) => Promise<void>;
}

const PendingApprovalsTab = ({ adminData, pendingAdmins, formatDate, getAdminLevelBadge, showConfirmation, actionLoading, canPerformAdminActions, handleApproveAdmin }: PendingApprovalsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Pending Approvals</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {pendingAdmins.length === 0 ? 'No pending requests' : `${pendingAdmins.length} request${pendingAdmins.length > 1 ? 's' : ''} awaiting review`}
          </p>
        </div>
        {pendingAdmins.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-amber-300">Action Required</span>
          </div>
        )}
      </div>

      {pendingAdmins.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-300 font-semibold text-lg mb-1">All clear!</p>
          <p className="text-slate-500 text-sm">No pending admin approval requests at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingAdmins.map((admin, idx) => (
            <div key={admin.id} className="bg-slate-900 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{admin.name}</h3>
                    <p className="text-sm text-slate-400">{admin.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getAdminLevelBadge(admin.adminLevel)}`}>
                        {admin.adminLevel.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500">Requested {formatDate(admin.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {canPerformAdminActions && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 border border-slate-700 hover:border-red-500/40 hover:text-red-400 rounded-lg transition-colors"
                      onClick={() => showConfirmation(
                        'Reject Request',
                        `Reject ${admin.name}'s admin application? This cannot be undone.`,
                        () => console.log('Reject to be implemented'),
                        'suspend'
                      )}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Reject
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
                      onClick={() => showConfirmation(
                        'Approve Admin',
                        `Approve ${admin.name}? They will gain access to the admin panel.`,
                        () => handleApproveAdmin(admin.id, admin.name),
                        'approve'
                      )}
                      disabled={actionLoading[`approve-${admin.id}`]}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {actionLoading[`approve-${admin.id}`] ? 'Approving...' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsTab;
