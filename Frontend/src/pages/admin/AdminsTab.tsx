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
  canPerformAdminActions: boolean;
  handleSuspendAdmin: (adminId: number, adminName: string) => Promise<void>;
}

const AdminsTab = ({ adminData, admins, formatDate, getAdminLevelBadge, getStatusBadge, showConfirmation, actionLoading, canPerformAdminActions, handleSuspendAdmin }: AdminsTabProps) => {
  return (
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
  );
};

export default AdminsTab;