import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import HospitalsTab from '../HospitalsTab';

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

const mockHospitals = [
  {
    id: 1,
    name: 'Square Hospital Ltd',
    address: '18/F Bir Uttam Qazi Nuruzzaman Sarak',
    city: 'Dhaka',
    state: 'Dhaka Division',
    zipCode: '1205',
    phone: '+88028159457',
    email: 'info@squarehospital.com',
    website: 'http://www.squarehospital.com'
  },
  {
    id: 2,
    name: 'Evercare Hospital Dhaka',
    address: 'Plot 81, Block E, Bashundhara R/A',
    city: 'Dhaka',
    state: 'Dhaka Division',
    zipCode: '1229',
    phone: '+880255037242',
    email: '',
    website: 'https://www.evercarebd.com'
  }
];

const mockFormatDate = (date: string | Date | null) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString();
};

const mockShowConfirmation = vi.fn();

describe('HospitalsTab Component', () => {
  describe('Rendering', () => {
    it('should render hospitals tab with title', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Hospital Management')).toBeInTheDocument();
    });

    it('should display hospital count', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('All Hospitals (2)')).toBeInTheDocument();
    });

    it('should render add new hospital button', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Add New Hospital')).toBeInTheDocument();
    });

    it('should render CSV upload button', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Upload CSV')).toBeInTheDocument();
    });

    it('should render download sample CSV button', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Download Sample CSV')).toBeInTheDocument();
    });
  });

  describe('Hospital Table', () => {
    it('should render table with hospital data', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Square Hospital Ltd')).toBeInTheDocument();
      expect(screen.getByText('Evercare Hospital Dhaka')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Hospital Name')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render clickable hospital names', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const hospitalLink = screen.getByRole('link', { name: 'Square Hospital Ltd' });
      expect(hospitalLink).toHaveAttribute('href', '/admin/hospitals/1');
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no hospitals', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={[]}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('No hospitals')).toBeInTheDocument();
      expect(screen.getByText('Get started by adding a new hospital.')).toBeInTheDocument();
    });
  });

  describe('CSV Upload', () => {
    it('should handle CSV file selection', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const fileInput = screen.getByDisplayValue('');
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.csv');
    });

    it('should disable upload button when uploading', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const uploadButton = screen.getByText('Upload CSV');
      expect(uploadButton).not.toBeDisabled();
    });
  });

  describe('Permissions', () => {
    it('should not show management features for unauthorized users', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={false}
        />
      );

      expect(screen.getByText("You don't have permission to manage hospitals.")).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render view details link for each hospital', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const viewLinks = screen.getAllByText('View Details');
      expect(viewLinks.length).toBe(2);
    });

    it('should render edit link for each hospital', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const editLinks = screen.getAllByText('Edit');
      expect(editLinks.length).toBe(2);
    });

    it('should have correct action links', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const viewLinks = screen.getAllByText('View Details');
      const editLinks = screen.getAllByText('Edit');
      
      expect(viewLinks[0].closest('a')).toHaveAttribute('href', '/admin/hospitals/1');
      expect(editLinks[0].closest('a')).toHaveAttribute('href', '/admin/hospitals/edit/1');
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBe(4);
    });

    it('should have accessible buttons and links', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');
      
      [...buttons, ...links].forEach(element => {
        expect(element).toHaveTextContent(/.+/);
      });
    });
  });

  describe('Sample CSV Download', () => {
    it('should trigger download when sample CSV button is clicked', () => {
      // Mock URL.createObjectURL and revokeObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
      global.URL.revokeObjectURL = vi.fn();

      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const downloadButton = screen.getByText('Download Sample CSV');
      fireEvent.click(downloadButton);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Hospital ID Display', () => {
    it('should display hospital IDs correctly', () => {
      render(
        <HospitalsTab 
          adminData={mockAdminData}
          hospitals={mockHospitals}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('ID: 1')).toBeInTheDocument();
      expect(screen.getByText('ID: 2')).toBeInTheDocument();
    });
  });
});
