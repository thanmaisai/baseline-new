import { ArrowRight, Zap, Shield, Rocket, Package, Code, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Setup',
      description: 'Go from zero to fully configured dev environment in minutes, not hours',
    },
    {
      icon: Shield,
      title: 'Safe & Idempotent',
      description: 'Scripts are designed to run safely multiple times without breaking your system',
    },
    {
      icon: Package,
      title: 'Everything in One Place',
      description: 'Apps, CLIs, languages, DevOps tools, and custom configs all in one script',
    },
    {
      icon: Code,
      title: 'Team Templates',
      description: 'Share standardized setups across your team for consistent environments',
    },
    {
      icon: Rocket,
      title: 'Zero Manual Work',
      description: 'Visual configuration means no memorizing brew commands or digging through docs',
    },
    {
      icon: Terminal,
      title: 'One Command Run',
      description: 'Download the script and run it. That\'s it. Everything else is automated.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Configure Your Perfect macOS Dev Environment
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stop wasting hours setting up new Macs. Build your ideal development setup visually, 
              then download a single script that installs everything automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => navigate('/export-setup')}
                className="bg-gradient-primary hover:opacity-90 shadow-hover text-lg h-14 px-8"
              >
                Export My Current Setup
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/configure')}
                className="text-lg h-14 px-8"
              >
                Build From Scratch
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              🔥 Clone your exact Mac setup in minutes — no manual configuration needed
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why DevEnv Setup?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Save time, reduce errors, and ensure every developer on your team has the exact same setup
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="p-6 hover:shadow-hover transition-shadow duration-200 border-border"
              >
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Select Your Tools',
                description: 'Browse through categories and visually select apps, package managers, languages, and CLI tools',
              },
              {
                step: '2',
                title: 'Add Custom Configs',
                description: 'Include your dotfiles, shell aliases, and custom scripts',
              },
              {
                step: '3',
                title: 'Download & Run',
                description: 'Get a single .sh file that installs everything with proper error handling and logging',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg shadow-card">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/configure')}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
