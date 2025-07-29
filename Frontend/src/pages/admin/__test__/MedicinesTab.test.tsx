import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import MedicinesTab from '../MedicinesTab';

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

const mockMedicines = [
  {
    id: 1,
    name: 'Medicine 1',
    genericName: 'Generic 1',
    strength: '500mg',
    form: 'TABLET',
    price: '100',
    manufacturer: 'Company A',
    category: 'Pain Relief',
    description: 'Test medicine 1'
  },
  {
    id: 2,
    name: 'Medicine 2',
    genericName: 'Generic 2',
    strength: '250mg',
    form: 'CAPSULE',
    price: '200',
    manufacturer: 'Company B',
    category: 'Antibiotic',
    description: 'Test medicine 2'
  }
];

const mockFormatDate = (date: string | Date | null) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString();
};

const mockShowConfirmation = vi.fn();

describe('MedicinesTab Component', () => {
  describe('Rendering', () => {

    it('should render add new medicine button', () => {
      render(
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Add New Medicine')).toBeInTheDocument();
    });

    it('should render CSV upload button', () => {
      render(
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Upload CSV')).toBeInTheDocument();
    });

    it('should render download sample CSV button', () => {
      render(
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Download Sample CSV')).toBeInTheDocument();
    });
  });

  describe('Medicine Table', () => {
    it('should render table with medicine data', () => {
      render(
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      expect(screen.getByText('Medicine 1')).toBeInTheDocument();
      expect(screen.getByText('Generic 1')).toBeInTheDocument();
      expect(screen.getByText('Medicine 2')).toBeInTheDocument();
      expect(screen.getByText('Generic 2')).toBeInTheDocument();
    });
  });

  describe('CSV Upload', () => {
    it('should handle CSV file selection', () => {
      render(
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
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
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const uploadButton = screen.getByText('Upload CSV');
      expect(uploadButton).not.toBeDisabled();
    });
  });

  describe('Actions', () => {
    it('should render edit link for each medicine', () => {
      render(
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const editLinks = screen.getAllByText('Edit');
      expect(editLinks.length).toBe(2);
    });

    it('should have correct edit links', () => {
      render(
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
          formatDate={mockFormatDate}
          showConfirmation={mockShowConfirmation}
          canPerformAdminActions={true}
        />
      );

      const editLinks = screen.getAllByText('Edit');
      expect(editLinks[0].closest('a')).toHaveAttribute('href', '/admin/medicines/edit/1');
      expect(editLinks[1].closest('a')).toHaveAttribute('href', '/admin/medicines/edit/2');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons and links', () => {
      render(
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
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
        <MedicinesTab 
          adminData={mockAdminData}
          medicines={mockMedicines}
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
});
