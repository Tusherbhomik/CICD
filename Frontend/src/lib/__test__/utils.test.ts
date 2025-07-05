import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const isConditional = true;
      const isHidden = false;
      const result = cn('base', isConditional && 'conditional', isHidden && 'hidden');
      expect(result).toBe('base conditional');
    });

    it('should handle empty inputs', () => {
      const result = cn('', null, undefined);
      expect(result).toBe('');
    });

    it('should merge conflicting Tailwind classes correctly', () => {
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });
  });
});