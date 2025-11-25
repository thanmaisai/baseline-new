import { useTheme } from '@/contexts/ThemeContext';
import { themeTokens } from './tokens';

/**
 * Hook to get theme tokens based on current theme
 * Use this hook in components to access centralized design tokens
 */
export const useThemeTokens = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return {
    colors: isDark ? themeTokens.colors.dark : themeTokens.colors.light,
    shared: themeTokens.colors.shared,
    brand: themeTokens.colors.brand,
    footer: themeTokens.colors.footer,
    spacing: themeTokens.spacing,
    borderRadius: themeTokens.borderRadius,
    shadows: themeTokens.shadows,
    isDark,
  };
};

