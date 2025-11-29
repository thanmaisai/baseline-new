import { ArrowRight, Upload, Layers, Sparkles, ShieldCheck, Clock, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { FloatingFooter } from '@/components/FloatingFooter';
import { TerminalWindow } from '@/components/TerminalWindow';
import { useEffect } from 'react';
import { themeTokens } from '@/theme/tokens';
import { useTheme } from '@/contexts/ThemeContext';

const heroStats = [
  { label: 'Minutes to onboard', value: '5', detail: 'Average runtime' },
  { label: 'Tools remembered', value: '24', detail: 'Curated templates' },
  { label: 'Macs standardized', value: '2.4K', detail: 'Engineering teams' },
];

const journeys = [
  {
    id: 'configure',
    title: 'Design a brand-new Mac',
    description: 'Pick your stack visually, toggle tooling, and Baseline generates a single install script.',
    icon: Layers,
    action: { label: 'Configure Setup', route: '/configure' },
    steps: ['Choose a template or start blank', 'Select packages, apps, and dotfiles', 'Download `baseline-setup.sh`'],
  },
  {
    id: 'export',
    title: 'Clone your existing Mac',
    description: 'Scan any Mac, extract packages + apps, and get a repeatable install recipe.',
    icon: Upload,
    action: { label: 'Export Snapshot', route: '/export-setup' },
    steps: ['Download the scanner', 'Upload the baseline snapshot', 'Generate `baseline-setup.sh`'],
  },
];

const featureHighlights = [
  { icon: Sparkles, title: 'Visual automation', copy: 'Every toggle updates your script instantly—no YAML spelunking.' },
  { icon: Wand2, title: 'Opinionated defaults', copy: 'Hand-curated templates keep new hires aligned with your tooling.' },
  { icon: ShieldCheck, title: 'Safe + auditable', copy: 'Generated scripts are readable, versionable, and open source.' },
];

const terminalDemo = [
  { text: 'baseline init --template full-stack', type: 'command' as const, delay: 300 },
  { text: 'Preparing your Baseline workspace…', type: 'info' as const, delay: 800 },
  { text: '• installing homebrew + taps', type: 'output' as const, delay: 300 },
  { text: '• syncing dotfiles + fonts', type: 'output' as const, delay: 300 },
  { text: '• installing vscode, arc, figma, postman', type: 'output' as const, delay: 300 },
  { text: '• configuring nodesource / volta', type: 'output' as const, delay: 300 },
  { text: '✨ Baseline complete. Five minutes. Zero surprises.', type: 'success' as const, delay: 800 },
];

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Get theme-aware border colors
  const isDark = theme === 'dark';
  const borderColors = {
    card: themeTokens.colors[isDark ? 'dark' : 'light'].border.card,
    cardInner: themeTokens.colors[isDark ? 'dark' : 'light'].border.cardInner,
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigate('/configure');
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigate('/export-setup');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return (
    <>
      <PageLayout className="h-auto min-h-screen">
        <div className="flex flex-col gap-12 px-6 md:px-10 py-10 pb-32 overflow-y-auto">
          <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-[2fr,1fr] gap-10"
          >
            <div className="space-y-8">
              <div 
                className="inline-flex items-center gap-2 bg-[var(--brand-sand)]/80 dark:bg-[var(--brand-ink)]/80 text-xs font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-full border text-[var(--brand-ink)] dark:text-[var(--brand-sand)]"
                style={{ borderColor: borderColors.cardInner }}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--brand-sunset)]" />
                Baseline / Mac Ops
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground mb-4">Bring every Mac to the same Baseline.</p>
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">
                  A visual, opinionated studio for macOS environments.
                </h1>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Baseline takes the tribal knowledge of your team—tools, taps, fonts, secrets—and turns it into a beautiful, trusted setup experience.
                The layout you&apos;re inside right now is the same canvas we use for every journey: configure something new or export what already works.
              </p>
              <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate('/configure')}
                size="lg"
                  className="h-12 px-8 bg-[var(--brand-sunset)] text-[var(--brand-ink)] hover:bg-[var(--brand-sunset)]/90"
                  aria-keyshortcuts="Meta+1"
              >
                  Design a Setup
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                onClick={() => navigate('/export-setup')}
                size="lg"
                variant="outline"
                  className="h-12 px-8 border-[var(--brand-ink)]/40 bg-[var(--brand-sand)]/60 hover:bg-[var(--brand-dunes)]/80 text-[var(--brand-ink)]"
                  aria-keyshortcuts="Meta+2"
              >
                Export Current Mac
              </Button>
          </div>
              <div className="grid md:grid-cols-3 gap-6">
                {heroStats.map((stat) => (
                  <div 
                    key={stat.label} 
                    className="rounded-2xl border bg-[var(--brand-sand)]/70 dark:bg-[var(--brand-ink)]/70 p-4"
                    style={{ borderColor: borderColors.card }}
                  >
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div 
              className="rounded-[28px] border bg-[var(--brand-sand)]/85 dark:bg-[var(--brand-ink)]/80 p-6 flex flex-col justify-between"
              style={{ borderColor: borderColors.card }}
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <img src="/brand/baseline-mark.png" alt="Baseline" className="w-12 h-12 rounded-2xl" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Brand System</p>
                    <p className="text-lg font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">Baseline Studio</p>
                    </div>
                </div>
                <p className="text-base text-muted-foreground mb-6">
                  Layout, floating footer, steady typography—the same UX flows through Configurator and Export. It keeps new hires oriented, whichever path they choose.
                </p>
                <div className="space-y-3 text-sm font-mono text-[var(--brand-ink)]/80 dark:text-[var(--brand-sand)]/80">
                  <p>⌘ → Continue to next step</p>
                  <p>⌘ ← Navigate backwards</p>
                  <p>⌘ F Search every tool</p>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">Trusted by</p>
                <div className="flex gap-3">
                  <span className="text-sm font-semibold text-[var(--brand-ink)]/70 dark:text-[var(--brand-sand)]/80">Founders</span>
                  <span className="text-sm font-semibold text-[var(--brand-ink)]/70 dark:text-[var(--brand-sand)]/80">Platform teams</span>
                  <span className="text-sm font-semibold text-[var(--brand-ink)]/70 dark:text-[var(--brand-sand)]/80">Indie makers</span>
                    </div>
                      </div>
                      </div>
          </motion.section>

          <section className="grid lg:grid-cols-2 gap-6">
            {journeys.map((journey) => {
              const Icon = journey.icon;
              return (
                <div
                  key={journey.id}
                  className="rounded-3xl border bg-[var(--brand-sand)]/85 dark:bg-[var(--brand-ink)]/80 p-6 flex flex-col gap-6"
                  style={{ borderColor: borderColors.card }}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-12 w-12 rounded-2xl bg-[var(--brand-sunset)]/20 flex items-center justify-center text-[var(--brand-ink)]">
                      <Icon className="w-6 h-6" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{journey.id}</p>
                      <h3 className="text-2xl font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">{journey.title}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{journey.description}</p>
                  <div className="space-y-3">
                    {journey.steps.map((step, index) => (
                      <div key={step} className="flex items-center gap-3 text-sm text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">
                        <span 
                          className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold"
                          style={{ borderColor: borderColors.cardInner }}
                        >
                          {index + 1}
                        </span>
                        {step}
                </div>
                    ))}
                </div>
                  <Button
                    onClick={() => navigate(journey.action.route)}
                    className="mt-auto bg-[var(--brand-sunset)]/90 text-[var(--brand-ink)] hover:bg-[var(--brand-sunset)]"
                    aria-keyshortcuts={journey.id === 'configure' ? 'Meta+1' : 'Meta+2'}
                  >
                    {journey.action.label}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Shortcut {journey.id === 'configure' ? '⌘ + 1' : '⌘ + 2'}
                  </p>
                </div>
              );
            })}
      </section>

          <section className="grid lg:grid-cols-2 gap-10 items-start">
            <div 
              className="rounded-3xl border bg-[var(--brand-sand)] dark:bg-[var(--brand-ink)]/80 p-6 shadow-card"
              style={{ borderColor: borderColors.card }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Live script</p>
                <span className="inline-flex items-center text-xs font-bold tracking-widest text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">
                  Baseline CLI
                </span>
              </div>
              <TerminalWindow lines={terminalDemo} />
            </div>
            <div className="space-y-6">
              {featureHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border bg-[var(--brand-sand)]/80 dark:bg-[var(--brand-ink)]/70 p-6 flex gap-4"
                    style={{ borderColor: borderColors.card }}
                  >
                    <span className="mt-1 h-12 w-12 rounded-2xl bg-[var(--brand-sunset)]/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[var(--brand-ink)] dark:text-[var(--brand-sand)]" />
                    </span>
                    <div>
                      <h4 className="text-xl font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">{item.title}</h4>
                      <p className="text-muted-foreground">{item.copy}</p>
              </div>
            </div>
                );
              })}
              <div 
                className="rounded-3xl border bg-[var(--brand-dunes)]/90 dark:bg-[var(--brand-ink)]/70 p-6"
                style={{ borderColor: borderColors.card }}
              >
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">Promise</p>
                <p className="text-2xl font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">
                  Five minutes of runway for every new hire. Same layout, same CTA, same confidence.
                </p>
              </div>
        </div>
      </section>

          <section 
            className="rounded-[32px] border bg-[var(--brand-sand)]/85 dark:bg-[var(--brand-ink)]/80 p-8"
            style={{ borderColor: borderColors.card }}
          >
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Playbook</p>
                <h2 className="text-3xl font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">
                  “Baseline let us replace a 12 page Confluence doc with a single CTA. Every page in the product feels like this card—focused, confident, and reusable.”
            </h2>
                <p className="text-sm text-muted-foreground">— Head of Developer Productivity, Series B fintech</p>
              </div>
              <div 
                className="w-full lg:w-64 rounded-3xl border bg-[var(--brand-sand)]/80 dark:bg-[var(--brand-ink)]/60 p-6 space-y-3"
                style={{ borderColor: borderColors.card }}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[var(--brand-ink)]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Before</p>
                    <p className="text-lg font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">360 minutes</p>
            </div>
        </div>
            <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[var(--brand-ink)]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">After Baseline</p>
                    <p className="text-lg font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">5 minutes</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Consistent layout across Configure + Export flows makes onboarding unmistakable.</p>
            </div>
            </div>
          </section>
        </div>
      </PageLayout>

      <FloatingFooter
        branding="Baseline"
        statusLabel=""
        statusText="Choose your journey"
        showBackButton={false}
        primaryButtonText="Design a Setup"
        primaryButtonIcon={<Layers className="w-4 h-4" />}
        onPrimaryAction={() => navigate('/configure')}
        primaryShortcut="←"
        secondaryButtonText="Export Current Mac"
        secondaryButtonIcon={<Upload className="w-4 h-4" />}
        onSecondaryAction={() => navigate('/export-setup')}
        secondaryShortcut="→"
      />
    </>
  );
};

export default Index;
