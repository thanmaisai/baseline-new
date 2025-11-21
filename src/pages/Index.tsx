import { ArrowRight, Zap, Shield, Rocket, Package, Code, Terminal, Sparkles, Download, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30 relative overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium gradient-text">Built for Developers</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
            >
              Configure Your Perfect{' '}
              <span className="gradient-text">macOS Dev Setup</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Stop wasting hours setting up new Macs. Build your ideal development 
              environment visually, then download a single script that installs everything automatically.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <Button
                size="lg"
                onClick={() => navigate('/configure')}
                className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-lg h-14 px-8 group"
              >
                Start Building
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/export-setup')}
                className="text-lg h-14 px-8 border-2 hover:bg-secondary/50 hover:border-primary/50 transition-all duration-300"
              >
                <Download className="mr-2 h-5 w-5" />
                Export Current Setup
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>2 min setup</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% safe</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Open source</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Mac Setup Genie?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Save hours of setup time and ensure every developer on your team has the exact same environment
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
                <Card
                  className="group p-8 hover-lift border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm relative overflow-hidden h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="mb-5">
                      <div className="inline-flex p-3 rounded-xl bg-gradient-primary shadow-lg">
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
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to your perfect dev environment</p>
          </motion.div>
          
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Select Your Tools',
                description: 'Browse through categories and visually select apps, package managers, languages, and CLI tools you need for your workflow',
              },
              {
                step: '2',
                title: 'Customize & Review',
                description: 'Fine-tune your selections, add custom configurations, and review everything before generating your script',
              },
              {
                step: '3',
                title: 'Download & Run',
                description: 'Get a single optimized .sh file with proper error handling, logging, and progress tracking. Run it on any Mac!',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex gap-6 group"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white font-bold text-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/configure')}
              className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-lg h-14 px-10"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
