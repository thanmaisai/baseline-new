import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  showGithub?: boolean;
}

export const PageHeader = ({ showGithub = true }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img
              src="/brand/baseline-mark-192.png"
              alt="Baseline mark"
              className="w-9 h-9 rounded-2xl shadow-card border border-white/40 dark:border-white/10"
            />
            <div className="leading-tight">
              <span className="text-lg font-semibold tracking-tight block">Baseline</span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block">
                Mac Setup Studio
              </span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-6"
          >
            {showGithub && (
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                GitHub
              </a>
            )}
            <ThemeToggle />
          </motion.div>
        </div>
      </div>
    </header>
  );
};
