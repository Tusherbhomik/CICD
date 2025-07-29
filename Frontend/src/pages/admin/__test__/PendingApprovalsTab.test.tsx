import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import PendingApprovalsTab from '../PendingApprovalsTab';

// Mock data for testing
const mockAdminData = {
  id: 1,
  name: 'Test Admin',
  email: 'admin@test.com',
  adminLevel: 'ROOT_ADMIN' as const,
  status: 'ACTIVE' as const,
  canManageAdmins: true,
  lastLogin: '2025-07-29T10:00:00Z',
  loginTime: '2025-07-29T10:00:00Z',
  token: 'mock-token'
};

const mockPendingAdmins = [
  {
    id: 1,
    name: 'Pending Admin 1',
    email: 'pending1@test.com',
    password: 'password',
    adminLevel: 'ADMIN' as const,
    status: 'PENDING_APPROVAL' as const,
    createdAt: new Date('2025-07-28'),
    loginAttempts: 0
  },
  {
    id: 2,
    name: 'Pending Admin 2',
    email: 'pending2@test.com',
    password: 'password',
    adminLevel: 'SUPPORT_ADMIN' as const,
    status: 'PENDING_APPROVAL' as const,
    createdAt: new Date('2025-07-29'),
    loginAttempts: 0
  }
];

const mockFormatDate = (date: string | Date | null) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString();
};

const mockGetAdminLevelBadge = (level: string) => 'bg-blue-100 text-blue-800';
const mockGetStatusBadge = (status: string) => 'bg-yellow-100 text-yellow-800';
const mockShowConfirmation = vi.fn();
const mockHandleApproveAdmin = vi.fn();

describe('PendingApprovalsTab Component', () => {
  describe('Rendering', () => {

    it('should render table with pending admin data', () => {
      render(
        <PendingApprovalsTab 
          adminData={mockAdminData}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          canPerformAdminActions={true}
          handleApproveAdmin={mockHandleApproveAdmin}
        />
      );

      expect(screen.getByText('Pending Admin 1')).toBeInTheDocument();
      expect(screen.getByText('pending1@test.com')).toBeInTheDocument();
      expect(screen.getByText('Pending Admin 2')).toBeInTheDocument();
      expect(screen.getByText('pending2@test.com')).toBeInTheDocument();
    });
  });


  describe('Admin Actions', () => {
    it('should show approve button for pending admins', () => {
      render(
        <PendingApprovalsTab 
          adminData={mockAdminData}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          canPerformAdminActions={true}
          handleApproveAdmin={mockHandleApproveAdmin}
        />
      );

      const approveButtons = screen.getAllByText('Approve');
      expect(approveButtons.length).toBe(2);
    });

    it('should call showConfirmation when approve button is clicked', () => {
      render(
        <PendingApprovalsTab 
          adminData={mockAdminData}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          canPerformAdminActions={true}
          handleApproveAdmin={mockHandleApproveAdmin}
        />
      );

      const approveButton = screen.getAllByText('Approve')[0];
      fireEvent.click(approveButton);

      expect(mockShowConfirmation).toHaveBeenCalled();
    });

    it('should not show actions when user cannot perform admin actions', () => {
      render(
        <PendingApprovalsTab 
          adminData={mockAdminData}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          canPerformAdminActions={false}
          handleApproveAdmin={mockHandleApproveAdmin}
        />
      );

      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    });
  });
  describe('Loading States', () => {
    it('should show loading state for specific admin approval', () => {
      const actionLoading = { 'approve-1': true };
      
      render(
        <PendingApprovalsTab 
          adminData={mockAdminData}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={actionLoading}
          canPerformAdminActions={true}
          handleApproveAdmin={mockHandleApproveAdmin}
        />
      );

      expect(screen.getByText('Approving...')).toBeInTheDocument();
    });
  });


  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(
        <PendingApprovalsTab 
          adminData={mockAdminData}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          canPerformAdminActions={true}
          handleApproveAdmin={mockHandleApproveAdmin}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBe(5);
    });

    it('should have accessible buttons', () => {
      render(
        <PendingApprovalsTab 
          adminData={mockAdminData}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          canPerformAdminActions={true}
          handleApproveAdmin={mockHandleApproveAdmin}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveTextContent(/.+/);
      });
    });
  });
});