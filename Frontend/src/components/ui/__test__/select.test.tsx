import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../select';

// Simplified test component that focuses on core functionality
const TestSelect = ({ onValueChange, defaultValue, disabled }: {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}) => (
  <Select onValueChange={onValueChange} defaultValue={defaultValue} disabled={disabled}>
    <SelectTrigger data-testid="select-trigger">
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
      <SelectItem value="option3" disabled>Option 3 (Disabled)</SelectItem>
    </SelectContent>
  </Select>
);

describe('Select Component', () => {
  describe('Rendering', () => {
    it('should render select trigger with placeholder', () => {
      render(<TestSelect />);
      
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      render(<TestSelect defaultValue="option1" />);
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should render as disabled', () => {
      render(<TestSelect disabled />);
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
    });

    it('should render trigger with chevron icon', () => {
      render(<TestSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      const chevronIcon = trigger.querySelector('svg');
      expect(chevronIcon).toBeInTheDocument();
    });
  });

  describe('Basic Interactions', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<TestSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);
      
      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });
    });

    it('should call onValueChange when option is selected', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();
      
      render(<TestSelect onValueChange={handleValueChange} />);
      
      // Open dropdown
      await user.click(screen.getByTestId('select-trigger'));
      
      // Wait for options and click one
      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Option 2'));
      
      expect(handleValueChange).toHaveBeenCalledWith('option2');
    });

    it('should not open when disabled', async () => {
      const user = userEvent.setup();
      render(<TestSelect disabled />);
      
      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);
      
      // Options should not be visible
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct CSS classes to trigger', () => {
      render(<TestSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'items-center',
        'justify-between',
        'rounded-md',
        'border',
        'border-input'
      );
    });

    it('should apply disabled styles when disabled', () => {
      render(<TestSelect disabled />);
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TestSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('role', 'combobox');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<TestSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      await user.tab();
      
      expect(trigger).toHaveFocus();
    });
  });

  describe('Controlled Behavior', () => {
    it('should work as uncontrolled component with defaultValue', () => {
      render(<TestSelect defaultValue="option2" />);
      
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });
});