import { Button } from '../../components/ui/button';

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

const PendingApprovalsTab = ({ adminData, pendingAdmins, formatDate, getAdminLevelBadge, getStatusBadge, showConfirmation, actionLoading, canPerformAdminActions, handleApproveAdmin }: PendingApprovalsTabProps) => {
  return (
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
  );
};

export default PendingApprovalsTab;