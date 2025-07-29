import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/test-utils';
import OverviewTab from '../OverviewTab';

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

const mockAdmins = [
  {
    id: 1,
    name: 'Admin 1',
    email: 'admin1@test.com',
    password: 'password',
    adminLevel: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    createdAt: new Date('2025-07-01'),
    loginAttempts: 0
  }
];

const mockPendingAdmins = [
  {
    id: 2,
    name: 'Pending Admin',
    email: 'pending@test.com',
    password: 'password',
    adminLevel: 'ADMIN' as const,
    status: 'PENDING_APPROVAL' as const,
    createdAt: new Date('2025-07-28'),
    loginAttempts: 0
  }
];

const mockFormatDate = (date: string | Date | null) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString();
};

const mockGetAdminLevelBadge = (level: string) => 'bg-blue-100 text-blue-800';
const mockGetStatusBadge = (status: string) => 'bg-green-100 text-green-800';

describe('OverviewTab Component', () => {
  describe('Admin Level Display', () => {
    it('should display admin level correctly', () => {
      render(
        <OverviewTab 
          adminData={mockAdminData}
          admins={mockAdmins}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
        />
      );

      expect(screen.getByText('ROOT ADMIN')).toBeInTheDocument();
    });

    it('should format admin level with spaces', () => {
      const adminWithSupportLevel = {
        ...mockAdminData,
        adminLevel: 'SUPPORT_ADMIN' as const
      };

      render(
        <OverviewTab 
          adminData={adminWithSupportLevel}
          admins={mockAdmins}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
        />
      );

      expect(screen.getByText('SUPPORT ADMIN')).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('should render statistics cards with proper structure', () => {
      render(
        <OverviewTab 
          adminData={mockAdminData}
          admins={mockAdmins}
          pendingAdmins={mockPendingAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
        />
      );

      const cards = screen.getAllByRole('generic');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should handle empty admin lists', () => {
      render(
        <OverviewTab 
          adminData={mockAdminData}
          admins={[]}
          pendingAdmins={[]}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
        />
      );

      const totalAdminsText = screen.getByText('Total Admins');
      expect(totalAdminsText).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should use provided formatDate function', () => {
      const customFormatDate = vi.fn(() => 'Custom Date');
      
      render(
        <OverviewTab 
          adminData={mockAdminData}
          admins={mockAdmins}
          pendingAdmins={mockPendingAdmins}
          formatDate={customFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
        />
      );

      expect(customFormatDate).toHaveBeenCalled();
    });
  });
});
