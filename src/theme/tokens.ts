/**
 * Centralized Design Tokens
 * All colors, spacing, and design values used across the application
 * Change values here to update the entire application theme
 */

export const themeTokens = {
  colors: {
    brand: {
      sand: '#FAF3E1',
      dunes: '#F5E7C6',
      sunset: '#FF6D1F',
      ink: '#222222',
    },
    // Light Mode
    light: {
      background: {
        primary: '#F9FAFB', // gray-50
        secondary: '#FFFFFF', // white
        card: '#FFFFFF',
        hover: '#F3F4F6', // gray-100
      },
      text: {
        primary: '#111827', // gray-900
        secondary: '#6B7280', // gray-500
        tertiary: '#9CA3AF', // gray-400
        muted: '#D1D5DB', // gray-300
      },
      border: {
        default: '#E5E7EB', // gray-200
        light: '#F3F4F6', // gray-100
        dark: '#D1D5DB', // gray-300
      },
      accent: {
        primary: '#3B82F6', // blue-500
        hover: '#2563EB', // blue-600
        light: '#DBEAFE', // blue-100
      },
    },
    // Dark Mode (Pitch Black)
    dark: {
      background: {
        primary: '#000000', // pitch black
        secondary: '#0A0A0A', // near black
        card: '#111111', // very dark gray
        hover: '#1A1A1A', // dark gray
      },
      text: {
        primary: '#FFFFFF', // white
        secondary: '#D4D4D4', // light gray
        tertiary: '#A3A3A3', // medium gray
        muted: '#737373', // dark gray
      },
      border: {
        default: '#262626', // gray-800
        light: '#1F1F1F', // gray-900
        dark: '#404040', // gray-700
      },
      accent: {
        primary: '#3B82F6', // blue-500
        hover: '#60A5FA', // blue-400
        light: '#1E3A8A', // blue-900
      },
    },
    // Shared colors (same in both modes)
    shared: {
      success: '#10B981', // green-500
      warning: '#F59E0B', // amber-500
      error: '#EF4444', // red-500
      info: '#3B82F6', // blue-500
    },
    // Footer specific (dark always)
    footer: {
      background: '#1A1A1A',
      text: '#FFFFFF',
      textMuted: '#9CA3AF',
      border: '#374151', // gray-700
      button: {
        primary: '#FFFFFF',
        primaryText: '#000000',
        secondary: '#374151',
        secondaryText: '#FFFFFF',
      },
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
  },
  borderRadius: {
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    '2xl': '2rem', // 32px
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
  },
} as const;

