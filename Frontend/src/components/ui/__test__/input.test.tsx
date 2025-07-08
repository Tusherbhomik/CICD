import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import { Input } from '../input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input with default props', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      // Default type for input is implicit, so checking for textbox role is sufficient
      expect(input).toHaveProperty('type', 'text');
    });

    it('should render with different input types', () => {
      const { rerender } = render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

      rerender(<Input type="password" />);
      // Password inputs don't have textbox role, need to query by input element
      const passwordInput = screen.getByDisplayValue('');
      expect(passwordInput).toHaveAttribute('type', 'password');

      rerender(<Input type="number" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');

      rerender(<Input type="date" />);
      // Date inputs might not have standard roles, query by input element
      const dateInput = document.querySelector('input[type="date"]');
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    it('should render with placeholder text', () => {
      render(<Input placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      render(<Input defaultValue="Default text" />);
      expect(screen.getByDisplayValue('Default text')).toBeInTheDocument();
    });

    it('should render as disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Styling', () => {
    it('should apply default CSS classes', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2'
      );
    });

    it('should apply custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      render(<Input className="custom-border" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-border', 'flex', 'h-10'); // Should have both
    });
  });

  describe('Interactions', () => {
    it('should handle user input', async () => {
      const user = userEvent.setup();
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello, World!');
      
      expect(input).toHaveValue('Hello, World!');
    });

    it('should handle onChange events', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalledTimes(4); // Once for each character
    });

    it('should handle focus and blur events', async () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled defaultValue="initial" />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'should not work');
      
      expect(input).toHaveValue('initial');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component', async () => {
      const ControlledInput = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        );
      };
      
      const user = userEvent.setup();
      render(<ControlledInput />);
      
      const input = screen.getByTestId('controlled-input');
      await user.type(input, 'controlled');
      
      expect(input).toHaveValue('controlled');
    });

    it('should work as uncontrolled component', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="uncontrolled-input" />);
      
      const input = screen.getByTestId('uncontrolled-input');
      await user.type(input, 'uncontrolled');
      
      expect(input).toHaveValue('uncontrolled');
    });
  });

  describe('Accessibility', () => {
    it('should support aria attributes', () => {
      render(
        <Input 
          aria-label="Custom label"
          aria-describedby="description"
          aria-required={true}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Custom label');
      expect(input).toHaveAttribute('aria-describedby', 'description');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should support required attribute', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="focusable-input" />);
      
      const input = screen.getByTestId('focusable-input');
      await user.tab();
      
      expect(input).toHaveFocus();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should allow ref to access input methods', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} defaultValue="test" />);
      
      expect(ref.current?.value).toBe('test');
    });
  });

  describe('File Input Specific', () => {
    it('should handle file input type', () => {
      render(<Input type="file" data-testid="file-input" />);
      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('type', 'file');
    });

    it('should apply file-specific styling', () => {
      render(<Input type="file" data-testid="file-input" />);
      const input = screen.getByTestId('file-input');
      expect(input).toHaveClass('file:border-0', 'file:bg-transparent');
    });
  });
});