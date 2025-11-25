import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useThemeTokens } from '@/theme/useThemeTokens';

interface FloatingFooterProps {
  branding?: string;
  statusLabel: string;
  statusText: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBack?: () => void;
  primaryButtonText: string;
  primaryButtonIcon?: React.ReactNode;
  onPrimaryAction: () => void;
  primaryButtonDisabled?: boolean;
  primaryShortcut?: string;
  secondaryButtonText?: string;
  secondaryButtonIcon?: React.ReactNode;
  onSecondaryAction?: () => void;
  secondaryButtonDisabled?: boolean;
  secondaryShortcut?: string;
  showThemeToggle?: boolean;
  showKeyboardShortcuts?: boolean;
}

const Kbd = ({ children, variant = 'dark' }: { children: React.ReactNode; variant?: 'dark' | 'light' | 'orange' | 'theme' }) => {
  const baseStyles = "inline-flex items-center justify-center text-[10px] font-mono rounded px-1.5 py-0.5 border";
  const variants = {
    dark: "text-[var(--brand-sand)] border-[var(--brand-sand)] bg-[var(--brand-ink)]/60",
    light: "text-white border-[var(--brand-ink)] bg-[var(--brand-ink)]/70",
    orange: "text-[var(--brand-ink)] border-[var(--brand-ink)] bg-transparent",
    theme: "text-[var(--brand-ink)] dark:text-[var(--brand-sand)] border-[var(--brand-ink)] dark:border-[var(--brand-sand)] bg-transparent",
  };

  return <span className={`${baseStyles} ${variants[variant]}`}>{children}</span>;
};

export const FloatingFooter = ({
  branding = 'Baseline.',
  statusLabel,
  statusText,
  showBackButton = true,
  backButtonText = 'Back',
  onBack,
  primaryButtonText,
  primaryButtonIcon,
  onPrimaryAction,
  primaryButtonDisabled = false,
  primaryShortcut,
  secondaryButtonText,
  secondaryButtonIcon,
  onSecondaryAction,
  secondaryButtonDisabled = false,
  secondaryShortcut,
  showThemeToggle = true,
  showKeyboardShortcuts = true,
}: FloatingFooterProps) => {
  const navigate = useNavigate();
  const { brand, colors, isDark } = useThemeTokens();

  const shellStyles = {
    backgroundColor: isDark ? colors.background.secondary : brand.ink,
    color: isDark ? colors.text.primary : brand.sand,
    borderColor: isDark ? colors.border.default : brand.ink,
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4">
      <div
        className="rounded-2xl py-3 px-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6 border ring-1 ring-[var(--brand-sand)]/20 w-auto whitespace-nowrap backdrop-blur-xl"
        style={shellStyles}
      >

        {/* Branding + Status Container */}
        <div className="flex items-center gap-6">
          {/* Branding (clickable) */}
          <div className="flex items-center gap-2">
            <button
              tabIndex={0}
              onClick={() => navigate('/')}
              className="text-lg font-bold tracking-tight hover:underline focus:outline-none rounded focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {branding}
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-[var(--brand-sand)]/20 hidden md:block"></div>

          {/* Status Info */}
          <div className="hidden md:flex flex-col py-1 opacity-80">
            <span className="text-[10px] font-bold tracking-widest uppercase mb-0.5">
              {statusLabel}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{statusText}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Navigation Actions */}
        <div className="flex items-center gap-3 pl-4 md:pl-0">
          {/* Theme Toggle - Moved before Back button */}
          {showThemeToggle && (
            <div className="flex items-center">
              <div className="h-8 w-px bg-[var(--brand-sand)]/20 mr-3"></div>
              <div className="[&_button]:text-[var(--brand-sand)] [&_button]:hover:text-[var(--brand-sand)] [&_button]:hover:bg-[var(--brand-sand)]/10 dark:[&_button]:hover:bg-white/5 [&_button]:h-8 [&_button]:w-8">
                <ThemeToggle />
              </div>
            </div>
          )}

          {/* Back Button with Keyboard Shortcut */}
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="group relative flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 hover:bg-[var(--brand-sand)]/10 dark:hover:bg-white/5"
              style={{
                borderColor: isDark ? 'rgba(235, 222, 201, 0.3)' : 'rgba(235, 222, 201, 0.4)',
                backgroundColor: 'transparent',
              }}
              aria-keyshortcuts="Meta+ArrowLeft"
            >
              {showKeyboardShortcuts && (
                <span className="flex items-center gap-0.5">
                  <Kbd variant="dark">⌘</Kbd>
                  <Kbd variant="dark">←</Kbd>
                </span>
              )}
              <span className="text-sm font-medium">{backButtonText}</span>
            </button>
          )}

          {/* Primary Button with Keyboard Shortcut */}
          <button
            onClick={onPrimaryAction}
            disabled={primaryButtonDisabled}
            className="group relative font-bold py-2.5 px-6 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              backgroundColor: brand.sunset,
              color: brand.ink,
              border: `2px solid ${brand.ink}`,
            }}
            aria-keyshortcuts={primaryShortcut ? `Meta+${primaryShortcut}` : "Meta+ArrowRight"}
          >
            {primaryButtonIcon}
            <span>{primaryButtonText}</span>
            {showKeyboardShortcuts && (
              <span className="flex items-center gap-0.5 ml-2">
                <Kbd variant="orange">⌘</Kbd>
                <Kbd variant="orange">{primaryShortcut === 'Enter' ? '↩' : (primaryShortcut || '→')}</Kbd>
              </span>
            )}
          </button>

          {secondaryButtonText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              disabled={secondaryButtonDisabled}
              className="group relative font-semibold py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 transition-all duration-200"
              style={{
                backgroundColor: isDark ? 'transparent' : brand.sand,
                color: isDark ? brand.sand : brand.ink,
                border: isDark ? `2px solid ${brand.sand}` : `2px solid ${brand.ink}`,
              }}
              aria-keyshortcuts={secondaryShortcut ? `Meta+${secondaryShortcut}` : "Meta+Digit2"}
            >
              {secondaryButtonIcon}
              <span>{secondaryButtonText}</span>
              {showKeyboardShortcuts && (
                <span className="flex items-center gap-0.5 ml-1">
                  <Kbd variant="theme">⌘</Kbd>
                  <Kbd variant="theme">{secondaryShortcut || '2'}</Kbd>
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
