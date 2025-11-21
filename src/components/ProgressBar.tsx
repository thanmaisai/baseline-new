import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  name: string;
  description: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
}

export const ProgressBar = ({ steps, currentStep }: ProgressBarProps) => {
  return (
    <nav aria-label="Progress" className="mb-12">
      <ol className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, idx) => (
          <li key={step.id} className="relative flex-1">
            {idx !== 0 && (
              <div className="absolute left-0 top-6 -ml-px h-0.5 w-full -z-10">
                <motion.div
                  className="h-full bg-gradient-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: idx < currentStep ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{ transformOrigin: "left" }}
                />
                <div className="h-full bg-border" style={{ 
                  opacity: idx < currentStep ? 0 : 1,
                  transition: 'opacity 0.5s'
                }} />
              </div>
            )}
            <motion.div
              initial={false}
              animate={{ scale: idx === currentStep ? 1 : 0.95 }}
              className="group relative flex flex-col items-center z-10"
            >
              <motion.span
                animate={idx === currentStep ? {
                  boxShadow: ['0 0 0 0 rgba(91, 141, 239, 0.4)', '0 0 0 8px rgba(91, 141, 239, 0)']
                } : {}}
                transition={idx === currentStep ? {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'loop'
                } : {}}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  idx < currentStep
                    ? 'border-primary bg-gradient-primary text-white shadow-lg shadow-primary/30'
                    : idx === currentStep
                    ? 'border-primary bg-white dark:bg-gray-900 text-primary ring-4 ring-primary/20 shadow-lg'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {idx < currentStep ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <span className="text-sm font-bold">{idx + 1}</span>
                )}
              </motion.span>
              <span className={`mt-3 text-sm font-semibold text-center transition-colors ${
                idx === currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.name}
              </span>
            </motion.div>
          </li>
        ))}
      </ol>
    </nav>
  );
};
