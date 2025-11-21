import { Check } from 'lucide-react';

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
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <li key={step.id} className="relative flex-1">
            {idx !== 0 && (
              <div
                className="absolute left-0 top-5 -ml-px h-0.5 w-full"
                style={{
                  background: idx < currentStep
                    ? 'var(--gradient-primary)'
                    : 'hsl(var(--border))',
                }}
              />
            )}
            <div className="group relative flex flex-col items-center">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  idx < currentStep
                    ? 'border-primary bg-primary text-primary-foreground shadow-hover'
                    : idx === currentStep
                    ? 'border-primary bg-background text-primary ring-4 ring-primary/10'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {idx < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{idx + 1}</span>
                )}
              </span>
              <span className="mt-2 text-xs font-medium text-center">
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};
