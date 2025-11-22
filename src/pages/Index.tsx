import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Rocket, 
  Package, 
  Code, 
  Terminal, 
  Sparkles, 
  Download, 
  Users,
  Clock,
  CheckCircle2,
  PlayCircle,
  Github,
  Star,
  Coffee,
  Gauge,
  LucideIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TerminalWindow } from '@/components/TerminalWindow';
import { AnimatedStat } from '@/components/AnimatedStats';
import { CodeBlock } from '@/components/CodeBlock';
import { FloatingIcons } from '@/components/FloatingIcons';

const Index = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Setup',
      description: 'Transform from zero to fully configured dev environment in minutes',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Safe & Idempotent',
      description: 'Run multiple times without breaking - smart detection and skip logic',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Package,
      title: 'Everything Included',
      description: 'Apps, CLIs, languages, DevOps tools, and custom configs unified',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Code,
      title: 'Team Templates',
      description: 'Share standardized setups for consistent environments across teams',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Rocket,
      title: 'Zero Manual Work',
      description: 'Visual configuration eliminates memorizing commands and docs',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: Terminal,
      title: 'One Command Run',
      description: 'Download and execute. Everything else is fully automated.',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  const terminalDemo = [
    { text: 'bash setup-macos.sh', type: 'command' as const, delay: 500 },
    { text: '🚀 Starting macOS Dev Environment Setup...', type: 'info' as const, delay: 800 },
    { text: '', type: 'output' as const, delay: 200 },
    { text: 'Installing Homebrew...', type: 'output' as const, delay: 300 },
    { text: 'Homebrew installed successfully', type: 'success' as const, delay: 1200 },
    { text: '', type: 'output' as const, delay: 200 },
    { text: 'Installing VS Code...', type: 'output' as const, delay: 300 },
    { text: 'VS Code installed', type: 'success' as const, delay: 1000 },
    { text: '', type: 'output' as const, delay: 200 },
    { text: 'Installing Docker...', type: 'output' as const, delay: 300 },
    { text: 'Docker installed', type: 'success' as const, delay: 1000 },
    { text: '', type: 'output' as const, delay: 200 },
    { text: 'Setting up Node.js (v20.x)...', type: 'output' as const, delay: 300 },
    { text: 'Node.js v20.11.0 ready', type: 'success' as const, delay: 1000 },
    { text: '', type: 'output' as const, delay: 200 },
    { text: '✨ Setup complete! All 24 tools installed.', type: 'success' as const, delay: 500 },
  ];

  const comparisonData = [
    { aspect: 'Setup Time', manual: '4-6 hours', devenv: '5 minutes', icon: Clock },
    { aspect: 'Consistency', manual: 'Variable', devenv: '100% identical', icon: CheckCircle2 },
    { aspect: 'Documentation', manual: 'Scattered notes', devenv: 'Built-in', icon: Code },
    { aspect: 'Team Onboarding', manual: 'Days', devenv: 'Minutes', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      <FloatingIcons />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative bg-gradient-primary p-2 rounded-lg">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">Mac Setup Genie</span>
                <div className="text-xs text-muted-foreground">Dev Environment Automation</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">Star</span>
                </span>
              </a>
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Column - Content */}
            <motion.div
              style={{ opacity, scale }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium border-2 border-primary/20">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  100% Free & Open Source
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                  Clone Your Mac
                  <br />
                  <span className="gradient-text">In Minutes</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                  Stop wasting hours setting up new Macs. Generate a single script that 
                  installs <span className="font-semibold text-foreground">everything</span> automatically.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/configure')}
                  className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 text-lg h-14 px-8 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <Rocket className="mr-2 h-5 w-5" />
                    Build Your Setup
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/export-setup')}
                  className="text-lg h-14 px-8 border-2 hover:bg-secondary/80 hover:border-primary/50 transition-all duration-300 group"
                >
                  <Download className="mr-2 h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
                  Export Current Mac
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-4"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span><strong className="text-foreground">2 min</strong> setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span><strong className="text-foreground">100%</strong> safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-orange-500" />
                  <span><strong className="text-foreground">No config</strong> needed</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Terminal Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              <TerminalWindow lines={terminalDemo} className="relative z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 border-y border-border/40 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <AnimatedStat value={95} label="Time Saved" suffix="%" />
            <AnimatedStat value={5} label="Minutes to Setup" suffix="m" />
            <AnimatedStat value={100} label="Tools Available" suffix="+" />
            <AnimatedStat value={100} label="Team Satisfaction" suffix="%" />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30">
              <Gauge className="w-4 h-4 mr-2" />
              Comparison
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Manual Setup vs <span className="gradient-text">Mac Setup Genie</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how much time and frustration you can save with automated setup
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4">
              {comparisonData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.aspect}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover-lift border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                      <div className="grid md:grid-cols-3 gap-6 items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-semibold text-lg">{item.aspect}</span>
                        </div>
                        <div className="text-center md:text-left">
                          <div className="text-sm text-muted-foreground mb-1">Manual Setup</div>
                          <div className="text-red-500 font-medium">{item.manual}</div>
                        </div>
                        <div className="text-center md:text-left">
                          <div className="text-sm text-muted-foreground mb-1">Mac Setup Genie</div>
                          <div className="text-green-500 font-bold">{item.devenv}</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Developers Love It</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built by developers, for developers. Every feature designed to save you time and headaches.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group p-8 hover-lift border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm relative overflow-hidden h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    <div className="relative">
                      <div className="mb-5">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30">
              <Code className="w-4 h-4 mr-2" />
              Simple
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">One Command. That's It.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Download your personalized script and run it. Everything else happens automatically.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <CodeBlock 
              code={`# Download your personalized setup script
curl -O https://setup.mac-genie.dev/your-setup.sh

# Make it executable
chmod +x your-setup.sh

# Run it and grab a coffee ☕
./your-setup.sh

# That's it! Your Mac is ready for development 🚀`}
              language="bash"
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4 border-primary/30">
                <PlayCircle className="w-4 h-4 mr-2" />
                How It Works
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Three Steps to Perfect Setup</h2>
              <p className="text-lg text-muted-foreground">No complex configuration. No learning curve. Just results.</p>
            </motion.div>
            
            <div className="space-y-12">
              {[
                {
                  step: '1',
                  title: 'Select Your Tools',
                  description: 'Browse through beautifully organized categories. Select apps, package managers, languages, CLI tools, and DevOps utilities with a single click. See exactly what you\'re getting with clear descriptions and icons.',
                  icon: Package,
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  step: '2',
                  title: 'Review & Customize',
                  description: 'Review your selections in an intuitive interface. Add custom configurations, set environment variables, and configure dotfiles. Everything is customizable, nothing is hidden.',
                  icon: Code,
                  color: 'from-purple-500 to-pink-500',
                },
                {
                  step: '3',
                  title: 'Download & Run',
                  description: 'Get a production-ready bash script with proper error handling, progress tracking, and logging. Run it on any Mac - fresh or existing. Idempotent design means it\'s safe to run multiple times.',
                  icon: Rocket,
                  color: 'from-green-500 to-emerald-500',
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <Card className="p-8 hover-lift border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
                      <div className="relative flex gap-6 items-start">
                        <div className="flex-shrink-0">
                          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white font-bold text-2xl shadow-lg`}>
                            {item.step}
                          </div>
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-center gap-3 mb-3">
                            <Icon className="w-6 h-6 text-primary" />
                            <h3 className="text-2xl font-bold">{item.title}</h3>
                          </div>
                          <p className="text-muted-foreground text-lg leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary-glow/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to Save Hours
              <br />
              <span className="gradient-text">of Setup Time?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of developers who automated their Mac setup. 
              Free, open source, and maintained by the community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => navigate('/configure')}
                className="bg-gradient-primary hover:opacity-90 shadow-2xl hover:shadow-primary/20 transition-all duration-300 text-lg h-16 px-10 group"
              >
                <Rocket className="mr-2 h-6 w-6" />
                Start Building Now
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/export-setup')}
                className="text-lg h-16 px-10 border-2 hover:bg-secondary/80 hover:border-primary/50 transition-all duration-300"
              >
                <Download className="mr-2 h-6 w-6" />
                Or Export Current Setup
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>100% free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Open source</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/40 py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold gradient-text">Mac Setup Genie</div>
                <div className="text-xs text-muted-foreground">Dev Environment Automation</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://github.com" className="hover:text-foreground transition-colors">
                GitHub
              </a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Documentation
              </a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>

            <div className="text-sm text-muted-foreground">
              Built with ❤️ by developers, for developers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
