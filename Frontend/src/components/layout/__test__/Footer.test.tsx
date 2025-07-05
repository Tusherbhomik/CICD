import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/test-utils';
import Footer from '../Footer';

describe('Footer Component', () => {
  describe('Rendering', () => {
    it('should render footer with brand name', () => {
      render(<Footer />);

      expect(screen.getByText('Med')).toBeInTheDocument();
      expect(screen.getByText('Scribe')).toBeInTheDocument();
    });

    it('should render company description', () => {
      render(<Footer />);

      expect(screen.getByText(/A modern digital prescription platform/)).toBeInTheDocument();
    });

    it('should render current year in copyright', () => {
      render(<Footer />);

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} MedScribe`))).toBeInTheDocument();
    });

    it('should render Quick Links section', () => {
      render(<Footer />);

      expect(screen.getByText('Quick Links')).toBeInTheDocument();
    });

    it('should render Support section', () => {
      render(<Footer />);

      expect(screen.getByText('Support')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render all quick links with correct hrefs', () => {
      render(<Footer />);

      // Quick Links
      const homeLink = screen.getByRole('link', { name: 'Home' });
      const loginLink = screen.getByRole('link', { name: 'Login' });
      const signupLink = screen.getByRole('link', { name: 'Sign Up' });

      expect(homeLink).toHaveAttribute('href', '/');
      expect(loginLink).toHaveAttribute('href', '/login');
      expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('should render brand logo link to home', () => {
      render(<Footer />);

      // Find link containing both Med and Scribe elements
      const allLinks = screen.getAllByRole('link');
      const brandLink = allLinks.find(link =>
        link.textContent?.includes('Med') && link.textContent?.includes('Scribe')
      );

      expect(brandLink).toBeTruthy();
      expect(brandLink).toHaveAttribute('href', '/');
    });

    it('should render all support links', () => {
      render(<Footer />);

      expect(screen.getByRole('link', { name: 'Contact Us' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Help Center' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
    });

    it('should have placeholder hrefs for support links', () => {
      render(<Footer />);

      const contactLink = screen.getByRole('link', { name: 'Contact Us' });
      const helpLink = screen.getByRole('link', { name: 'Help Center' });
      const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
      const termsLink = screen.getByRole('link', { name: 'Terms of Service' });

      expect(contactLink).toHaveAttribute('href', '#');
      expect(helpLink).toHaveAttribute('href', '#');
      expect(privacyLink).toHaveAttribute('href', '#');
      expect(termsLink).toHaveAttribute('href', '#');
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct CSS classes for layout', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-white', 'border-t', 'mt-auto', 'py-8');
    });

    it('should render brand with correct styling', () => {
      render(<Footer />);

      const medText = screen.getByText('Med');
      const scribeText = screen.getByText('Scribe');

      expect(medText).toHaveClass('text-medical-secondary', 'font-bold', 'text-xl');
      expect(scribeText).toHaveClass('text-medical-primary', 'font-bold', 'text-xl');
    });

    it('should have responsive grid layout', () => {
      render(<Footer />);

      // Check for grid container
      const gridContainer = screen.getByRole('contentinfo').querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-4');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      render(<Footer />);

      // Footer should have contentinfo role
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should have properly structured headings', () => {
      render(<Footer />);

      // Section headings should be h3
      expect(screen.getByRole('heading', { name: 'Quick Links', level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Support', level: 3 })).toBeInTheDocument();
    });

    it('should have accessible link text', () => {
      render(<Footer />);

      // All links should have descriptive text
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveTextContent(/.+/); // Should have some text content
      });
    });

    it('should support keyboard navigation', () => {
      render(<Footer />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('Content Accuracy', () => {
    it('should display correct company description', () => {
      render(<Footer />);

      expect(screen.getByText(/A modern digital prescription platform connecting doctors and patients/)).toBeInTheDocument();
    });

    it('should display all rights reserved text', () => {
      render(<Footer />);

      expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
    });

    it('should render section divider', () => {
      render(<Footer />);

      // Check for border-t class in the copyright section
      const copyrightSection = screen.getByText(/All rights reserved/).closest('.border-t');
      expect(copyrightSection).toHaveClass('border-t', 'border-gray-200');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizing', () => {
      render(<Footer />);

      // Description text should be responsive
      const description = screen.getByText(/A modern digital prescription platform/);
      expect(description).toHaveClass('text-sm');
    });

    it('should have responsive spacing', () => {
      render(<Footer />);

      // Grid should have responsive gaps
      const gridContainer = screen.getByRole('contentinfo').querySelector('.grid');
      expect(gridContainer).toHaveClass('gap-8');
    });
  });

  describe('Dynamic Year', () => {
    it('should update copyright year dynamically', () => {
      // Mock Date to test year calculation
      const mockDate = new Date('2025-01-01');
      vi.setSystemTime(mockDate);

      render(<Footer />);

      expect(screen.getByText(/© 2025 MedScribe/)).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should work with different years', () => {
      const mockDate = new Date('2030-06-15');
      vi.setSystemTime(mockDate);

      render(<Footer />);

      expect(screen.getByText(/© 2030 MedScribe/)).toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});