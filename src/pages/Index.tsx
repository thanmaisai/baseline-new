import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FloatingFooter } from '@/components/FloatingFooter';
import { Plus, Download, Terminal, Zap, Shield, Code2 } from 'lucide-react';
import { useRef } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <main className="w-full max-w-[1200px] h-[85vh] bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#262626] rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden z-10">
        <div ref={containerRef} className="flex-grow overflow-y-auto scrollbar-hide">

          {/* Hero Section */}
          <section className="relative min-h-screen flex flex-col justify-center items-start px-6 lg:px-12 z-10">
            <div className="max-w-7xl mx-auto w-full">
              <motion.div
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="max-w-5xl"
              >
                {/* Brand Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="inline-flex items-center gap-2 mb-8"
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 dark:bg-white/10 border border-gray-900 dark:border-white/20">
                    <Terminal className="w-3.5 h-3.5 text-white dark:text-white" />
                    <span className="text-sm font-bold text-white dark:text-white tracking-tight">BASELINE</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">MACOS DEVELOPMENT</span>
                </motion.div>

                {/* Main Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.85] mb-8 text-gray-900 dark:text-white"
                >
                  Automating
                  <br />
                  developer
                  <br />
                  onboarding.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed mb-4"
                >
                  A visual configurator that generates production-ready setup scripts for macOS development environments in minutes, not hours.
                </motion.p>

                {/* Scroll Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="mt-16 flex items-center gap-3 text-gray-400 dark:text-gray-600"
                >
                  <div className="w-12 h-px bg-gray-300 dark:bg-gray-800" />
                  <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* The Problem - Sticky Section */}
          <section className="relative py-32 px-6 lg:px-12 z-10 bg-white dark:bg-[#0A0A0A]">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-20 items-start">
                <div className="lg:sticky lg:top-32">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-600 mb-6">THE CHALLENGE</p>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-gray-900 dark:text-white">
                      Manual setup is <span className="text-red-500">broken.</span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-12">
                      Every new Mac means hours of Googling, copy-pasting commands, and configuring tools. By the time you're done, you've lost a full workday.
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">4-8h</div>
                        <div className="text-sm text-gray-500 dark:text-gray-600 uppercase tracking-wider">Wasted per setup</div>
                      </div>
                      <div>
                        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">67%</div>
                        <div className="text-sm text-gray-500 dark:text-gray-600 uppercase tracking-wider">Miss critical tools</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-6">
                  {[
                    { title: "Dependency Hell", desc: "Node v14 vs v18? Python 2 vs 3? System Ruby conflicts.", color: "border-red-500/20 bg-red-500/5" },
                    { title: "Forgotten Tools", desc: "Realizing you don't have Redis installed 5 minutes before a demo.", color: "border-orange-500/20 bg-orange-500/5" },
                    { title: "Inconsistent Teams", desc: "It works on my machine, but not on yours.", color: "border-yellow-500/20 bg-yellow-500/5" },
                    { title: "Security Risks", desc: "Copy-pasting sudo commands from StackOverflow.", color: "border-red-600/20 bg-red-600/5" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-8 rounded-2xl border ${item.color} backdrop-blur-sm`}
                    >
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* The Solution - Features */}
          <section className="relative py-32 px-6 lg:px-12 z-10 bg-gray-50 dark:bg-black border-y border-gray-200 dark:border-gray-900">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-600 mb-6">THE SOLUTION</p>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
                  One script. <span className="text-blue-500">Zero friction.</span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Declarative configuration meets automated execution.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Zap,
                    title: "Instant Setup",
                    desc: "From fresh macOS to production-ready in under 10 minutes.",
                    color: "text-blue-500",
                    bgColor: "bg-blue-500/10"
                  },
                  {
                    icon: Code2,
                    title: "Version Controlled",
                    desc: "Your entire environment defined in a single JSON file.",
                    color: "text-green-500",
                    bgColor: "bg-green-500/10"
                  },
                  {
                    icon: Shield,
                    title: "Secure by Default",
                    desc: "Only official sources. No shady binaries or scripts.",
                    color: "text-purple-500",
                    bgColor: "bg-purple-500/10"
                  },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-8 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-900 hover:border-gray-300 dark:hover:border-gray-800 transition-colors group"
                    >
                      <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Terminal Demo */}
          <section className="relative py-32 px-6 lg:px-12 z-10 bg-white dark:bg-[#0A0A0A]">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-600 mb-6">ONE COMMAND</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                  From zero to production-ready
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-10" />
                <div className="relative bg-gray-900 dark:bg-black border border-gray-800 dark:border-gray-900 rounded-2xl p-6 shadow-2xl">
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="font-mono text-sm space-y-2">
                    <div className="flex gap-2">
                      <span className="text-blue-400">$</span>
                      <span className="text-gray-300">bash setup-macos.sh</span>
                    </div>
                    <div className="text-green-400">🚀 Starting macOS Dev Environment Setup...</div>
                    <div className="text-gray-500">Installing Homebrew...</div>
                    <div className="text-green-400">✓ Homebrew installed successfully</div>
                    <div className="text-gray-500">Installing VS Code...</div>
                    <div className="text-green-400">✓ VS Code installed</div>
                    <div className="text-gray-500">Setting up Node.js (v20.x)...</div>
                    <div className="text-green-400">✓ Node.js v20.11.0 ready</div>
                    <div className="text-green-400 font-bold">✨ Setup complete! All 24 tools installed.</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-40 px-6 lg:px-12 z-10 bg-gray-50 dark:bg-black pb-32">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gray-900 dark:text-white">
                  Ready to start?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-16">
                  Join 2,400+ developers who eliminated setup time.
                </p>
              </motion.div>
            </div>
          </section>

        </div>

        {/* Floating Footer */}
        <FloatingFooter
          statusLabel="GET STARTED"
          statusText="Choose an option"
          primaryButtonText=""
          onPrimaryAction={() => { }}
          showBackButton={false}
          customActions={
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/configure')}
                className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-bold h-10 px-6 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Create New Setup
              </Button>
              <div className="w-px h-6 bg-white/10" />
              <Button
                onClick={() => navigate('/export-setup')}
                variant="ghost"
                className="text-gray-300 hover:bg-white/10 hover:text-white h-10 px-6 rounded-xl text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Clone This Mac
              </Button>
            </div>
          }
        />
      </main>
    </div>
  );
};

export default Index;
