import { describe, it, expect, vi, beforeEach } from 'vitest'; // Added beforeEach
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import AdminsTab from '../AdminsTab';

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
    password: 'mock-password', // Added password field here
    adminLevel: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    createdAt: new Date('2025-07-01'),
    loginAttempts: 0
  },
  {
    id: 2,
    name: 'Admin 2',
    email: 'admin2@test.com',
    password: 'mock-password', // Added password field here
    adminLevel: 'SUPPORT_ADMIN' as const,
    status: 'SUSPENDED' as const,
    createdAt: new Date('2025-07-02'),
    loginAttempts: 0
  }
];

// Mocks for props - ensure these accurately reflect what your component expects and returns
const mockFormatDate = (date: string | Date | null) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString();
};

const mockGetAdminLevelBadge = (level: string) => {
  if (level === 'ADMIN') return 'bg-blue-100 text-blue-800';
  if (level === 'SUPPORT_ADMIN') return 'bg-purple-100 text-purple-800';
  return ''; // Default or empty for other cases
};

const mockGetStatusBadge = (status: string) => {
  if (status === 'ACTIVE') return 'bg-green-100 text-green-800';
  if (status === 'SUSPENDED') return 'bg-red-100 text-red-800';
  return ''; // Default
};

const mockShowConfirmation = vi.fn();
const mockHandleSuspendAdmin = vi.fn();

describe('AdminsTab Component', () => {
  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---
  // Rendering Tests
  // ---
  describe('Rendering', () => {
    it('should render admins tab with title', () => {
      render(
        <AdminsTab
          adminData={mockAdminData}
          admins={mockAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          handleSuspendAdmin={mockHandleSuspendAdmin}
        />
      );

      // Use regex for 'All Administrators' to be more flexible
      expect(screen.getByText(/All Administrators/i)).toBeInTheDocument();
    });

    it('should render table with admin data', () => {
      render(
        <AdminsTab
          adminData={mockAdminData}
          admins={mockAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          handleSuspendAdmin={mockHandleSuspendAdmin}
        />
      );

      // Verify specific admin data is rendered
      expect(screen.getByText('Admin 1')).toBeInTheDocument();
      expect(screen.getByText('admin1@test.com')).toBeInTheDocument();
      expect(screen.getByText('Admin 2')).toBeInTheDocument();
      expect(screen.getByText('admin2@test.com')).toBeInTheDocument();
    });
  });





  // ---
  // Admin Level Display Tests
  // ---
  describe('Admin Level Display', () => {
    it('should format admin levels correctly', () => {
      render(
        <AdminsTab
          adminData={mockAdminData}
          admins={mockAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          handleSuspendAdmin={mockHandleSuspendAdmin}
        />
      );

      // Check for the rendered text of admin levels
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.getByText('SUPPORT ADMIN')).toBeInTheDocument();
    });
  });

  // ---
  // Accessibility Tests
  // ---
  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(
        <AdminsTab
          adminData={mockAdminData}
          admins={mockAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          handleSuspendAdmin={mockHandleSuspendAdmin}
        />
      );

      // Assert table roles and header counts
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBe(6);
    });

    it('should have accessible buttons with meaningful text', () => {
      render(
        <AdminsTab
          adminData={mockAdminData}
          admins={mockAdmins}
          formatDate={mockFormatDate}
          getAdminLevelBadge={mockGetAdminLevelBadge}
          getStatusBadge={mockGetStatusBadge}
          showConfirmation={mockShowConfirmation}
          actionLoading={{}}
          handleSuspendAdmin={mockHandleSuspendAdmin}
        />
      );

      // Get all buttons and check if they have accessible names
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName(); // Checks for text content, aria-label, etc.
      });
    });
  });
});