/**
 * Focus management utilities
 */
export const focus = {
  /**
   * Trap focus within a container
   */
  trap: (container: HTMLElement, event: KeyboardEvent) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  },

  /**
   * Focus the first focusable element in a container
   */
  focusFirst: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  },

  /**
   * Focus the last focusable element in a container
   */
  focusLast: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
    }
  },
};

/**
 * ARIA utilities
 */
export const aria = {
  /**
   * Toggle aria-expanded attribute
   */
  toggleExpanded: (element: HTMLElement) => {
    const isExpanded = element.getAttribute('aria-expanded') === 'true';
    element.setAttribute('aria-expanded', String(!isExpanded));
    return !isExpanded;
  },

  /**
   * Announce a message to screen readers
   */
  announce: (message: string, polite: boolean = true) => {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.setAttribute('aria-live', polite ? 'polite' : 'assertive');
      announcer.textContent = message;
    }
  },

  /**
   * Set aria-label for an element
   */
  setLabel: (element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label);
  },

  /**
   * Set aria-describedby for an element
   */
  setDescription: (element: HTMLElement, descriptionId: string) => {
    element.setAttribute('aria-describedby', descriptionId);
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboard = {
  /**
   * Check if a key is an arrow key
   */
  isArrowKey: (key: string): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
  },

  /**
   * Check if a key is an enter key
   */
  isEnterKey: (key: string): boolean => {
    return key === 'Enter';
  },

  /**
   * Check if a key is an escape key
   */
  isEscapeKey: (key: string): boolean => {
    return key === 'Escape';
  },

  /**
   * Check if a key is a space key
   */
  isSpaceKey: (key: string): boolean => {
    return key === ' ' || key === 'Spacebar';
  },

  /**
   * Check if a key is a tab key
   */
  isTabKey: (key: string): boolean => {
    return key === 'Tab';
  },
};

/**
 * Color contrast utilities
 */
export const contrast = {
  /**
   * Calculate luminance of a color
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (luminance1: number, luminance2: number): number => {
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast ratio meets WCAG standards
   */
  isAccessible: (ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const thresholds = {
      AA: { normal: 4.5, large: 3, ui: 3 },
      AAA: { normal: 7, large: 4.5, ui: 3 },
    };
    return ratio >= thresholds[level].normal;
  },
};

/**
 * Skip links utility
 */
export function createSkipLinks(): string {
  return `
    <nav aria-label="Skip to main content">
      <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-obsidian focus:text-gold focus:border focus:border-gold focus:rounded-md">
        Skip to main content
      </a>
      <a href="#main-navigation" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-50 focus:p-4 focus:bg-obsidian focus:text-gold focus:border focus:border-gold focus:rounded-md">
        Skip to navigation
      </a>
    </nav>
  `;
}

/**
 * Screen reader only class
 */
export const srOnly = 'sr-only';

/**
 * Screen reader only class with focus visible
 */
export const srOnlyFocusable = 'sr-only focus:not-sr-only';