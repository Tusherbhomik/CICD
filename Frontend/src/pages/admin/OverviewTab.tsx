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

interface OverviewTabProps {
  adminData: AdminData;
  admins: Admin[];
  pendingAdmins: Admin[];
  formatDate: (dateString: string | Date | null) => string;
  getAdminLevelBadge: (level: Admin['adminLevel']) => string;
  getStatusBadge: (status: Admin['status']) => string;
}

const OverviewTab = ({ adminData, admins, pendingAdmins, formatDate, getAdminLevelBadge, getStatusBadge }: OverviewTabProps) => {
  return (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  );
};

export default OverviewTab;