import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

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
  showThemeToggle?: boolean;
  showKeyboardShortcuts?: boolean;
  customActions?: React.ReactNode;
}

const Kbd = ({ children, variant = 'dark' }: { children: React.ReactNode; variant?: 'dark' | 'light' }) => {
  const baseStyles = "inline-block text-xs font-mono rounded px-1";
  const variants = {
    dark: "text-gray-300 bg-gray-800",
    light: "text-gray-500 bg-gray-100 border border-gray-300",
  };

  return <span className={`${baseStyles} ${variants[variant]} `}>{children}</span>;
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
  showThemeToggle = true,
  showKeyboardShortcuts = true,
  customActions,
}: FloatingFooterProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4">
      <div className="bg-[#1A1A1A] text-white rounded-2xl py-3 px-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6 border border-[#374151] ring-1 ring-white/10 w-auto whitespace-nowrap">

        {/* Branding + Status Container */}
        <div className="flex items-center gap-6">
          {/* Branding (clickable) */}
          <div className="flex items-center gap-2">
            <button
              tabIndex={0}
              onClick={() => navigate('/')}
              className="text-lg font-bold tracking-tight text-white hover:underline hover:text-blue-400 focus:outline-none rounded focus:ring-2 focus:ring-blue-400 px-0.5"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {branding}
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-[#374151] hidden md:block"></div>

          {/* Status Info */}
          <div className="hidden md:flex flex-col py-1">
            <span className="text-[10px] font-bold tracking-widest text-[#9CA3AF] uppercase mb-0.5">
              {statusLabel}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{statusText}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Navigation Actions */}
        <div className="flex items-center gap-3 pl-4 md:pl-0">
          {/* Theme Toggle - Moved before Back button */}
          {showThemeToggle && (
            <div className="flex items-center">
              <div className="h-8 w-px bg-[#374151] mr-3"></div>
              <div className="[&_button]:text-white [&_button]:hover:text-white [&_button]:hover:bg-white/10 [&_button]:h-8 [&_button]:w-8">
                <ThemeToggle />
              </div>
            </div>
          )}

          {customActions ? (
            customActions
          ) : (
            <>
              {/* Back Button with Keyboard Shortcut */}
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="group relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#374151] hover:bg-[#4B5563] transition-all duration-200"
                >
                  <span className="flex items-center gap-0.5">
                    <Kbd variant="dark">⌘</Kbd>
                    <Kbd variant="dark">←</Kbd>
                  </span>
                  <span className="text-sm font-medium text-white">{backButtonText}</span>
                </button>
              )}

              {/* Primary Button with Keyboard Shortcut */}
              <Button
                onClick={onPrimaryAction}
                disabled={primaryButtonDisabled}
                className="group relative bg-white hover:bg-gray-100 text-black font-bold py-2.5 px-6 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {primaryButtonIcon}
                <span>{primaryButtonText}</span>
                <span className="flex items-center gap-0.5 ml-2">
                  <Kbd variant="light">⌘</Kbd>
                  <Kbd variant="light">→</Kbd>
                </span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
