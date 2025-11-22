import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Download, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolCard } from '@/components/ToolCard';
import { PageHeader } from '@/components/PageHeader';
import { usePersistedSelection } from '@/hooks/usePersistedSelection';
import { useBrewPackages } from '@/hooks/useBrewPackages';
import { tools } from '@/data/tools';
import { Tool, ToolCategory } from '@/types/tools';
import { generateSetupScript } from '@/utils/scriptGenerator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const steps = [
  { id: 'templates', name: 'Templates', subtitle: 'Choose Your Starting Point' },
  { id: 'applications', name: 'Dev Picks', subtitle: 'Developer-Preferred Apps' },
  { id: 'package-managers', name: 'Package Managers', subtitle: 'Version & Package Managers' },
  { id: 'browsers', name: 'Browsers', subtitle: 'Web Browsers' },
  { id: 'dev-tools', name: 'Dev Tools', subtitle: 'Editors, IDEs & API Clients' },
  { id: 'design-tools', name: 'Design', subtitle: 'Graphics & Design Tools' },
  { id: 'communication', name: 'Communication', subtitle: 'Chat, Email & Video' },
  { id: 'productivity', name: 'Productivity', subtitle: 'Notes, Tasks & Office' },
  { id: 'languages', name: 'Languages', subtitle: 'Runtimes & Version Managers' },
  { id: 'devops', name: 'DevOps', subtitle: 'Cloud & Container Tools' },
  { id: 'databases', name: 'Databases', subtitle: 'Data Storage Solutions' },
  { id: 'terminal', name: 'Terminal', subtitle: 'Shells & Terminal Apps' },
  { id: 'cli-tools', name: 'CLI Tools', subtitle: 'Command-Line Utilities' },
  { id: 'media', name: 'Media', subtitle: 'Music & Video Players' },
  { id: 'security', name: 'Security', subtitle: 'Password & VPN Tools' },
  { id: 'utilities', name: 'Utilities', subtitle: 'System & Productivity Apps' },
  { id: 'review', name: 'Finalize', subtitle: 'Review your stack' },
];

const templates = [
  {
    id: 'frontend',
    name: 'Frontend Developer',
    description: 'Tools for modern web development',
    toolIds: ['vscode', 'node', 'git', 'docker', 'chrome', 'postman', 'figma'],
  },
  {
    id: 'backend',
    name: 'Backend Developer',
    description: 'Server-side development essentials',
    toolIds: ['vscode', 'node', 'python', 'docker', 'git', 'postman', 'postgres', 'mongodb'],
  },
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    description: 'Complete development environment',
    toolIds: ['vscode', 'node', 'python', 'docker', 'git', 'postman', 'postgres', 'mongodb', 'chrome', 'figma'],
  },
  {
    id: 'custom',
    name: 'Custom Setup',
    description: 'Start from scratch',
    toolIds: [],
  },
];

const Configurator = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllTools, setShowAllTools] = useState(false);
  const [liveLog, setLiveLog] = useState('loading homebrew packages...');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { selection, setSelection, clearSelection } = usePersistedSelection();
  
  // Fetch real-time Homebrew data
  const { 
    packages: brewPackages, 
    loading: brewLoading, 
    error: brewError,
    refreshData,
    totalCount 
  } = useBrewPackages();

  const currentCategory = steps[currentStep].id as ToolCategory | 'review' | 'templates';
  
  // Reset showAllTools when changing categories
  useEffect(() => {
    setShowAllTools(false);
    setSearchQuery('');
  }, [currentStep]);
  
  // Update log when Homebrew data loads
  useEffect(() => {
    if (!brewLoading && totalCount > 0) {
      updateLog(`loaded ${totalCount.toLocaleString()} homebrew packages`);
    } else if (brewError) {
      updateLog('error loading packages - using cached data');
    }
  }, [brewLoading, totalCount, brewError]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const updateLog = (message: string) => {
    setLiveLog(message);
  };
  
  const filteredTools = useMemo(() => {
    if (currentCategory === 'review' || currentCategory === 'templates') return [];
    
    // Merge static tools with Homebrew packages
    const categoryBrewPackages = brewPackages
      .filter(pkg => pkg.category === currentCategory)
      .map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        category: pkg.category as ToolCategory,
        installCommand: pkg.installCommand,
        type: (pkg.type === 'cask' ? 'brew-cask' : 'brew') as 'brew' | 'brew-cask',
        isHomebrew: true,
        homepage: pkg.homepage,
        version: pkg.version,
        popular: pkg.popular,
      } as Tool));
    
    const staticTools = tools.filter(t => t.category === currentCategory);
    
    // Combine and deduplicate by name (prefer static tools)
    const toolMap = new Map<string, Tool>();
    staticTools.forEach(tool => toolMap.set(tool.name.toLowerCase(), tool));
    categoryBrewPackages.forEach(tool => {
      const key = tool.name.toLowerCase();
      if (!toolMap.has(key)) {
        toolMap.set(key, tool);
      }
    });
    
    let allTools = Array.from(toolMap.values());
    
    // For 'applications' category (Dev Picks), only show tools with devPick: true
    if (currentCategory === 'applications') {
      allTools = allTools.filter(tool => tool.devPick === true);
    }
    
    // Use fuzzy search if there's a query
    let filtered: Tool[];
    if (searchQuery.trim()) {
      const fuse = new Fuse(allTools, {
        keys: ['name', 'description'],
        threshold: 0.4,
        includeScore: true,
      });
      filtered = fuse.search(searchQuery).map(result => result.item);
    } else {
      filtered = allTools;
    }
    
    // Sort: popular first, then alphabetically
    filtered.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    });
    
    // If searching, show all results; otherwise show only popular tools (or at least first 30)
    if (!searchQuery && !showAllTools) {
      const popularTools = filtered.filter(t => t.popular);
      // Show popular tools up to 50, or if less than 10 popular tools, show first 30 alphabetically
      if (popularTools.length >= 10) {
        filtered = popularTools.slice(0, 50);
      } else {
        filtered = filtered.slice(0, 30);
      }
    }
    
    return filtered;
  }, [currentCategory, searchQuery, brewPackages, brewLoading, showAllTools]);

  const isToolSelected = (tool: Tool) => {
    return selection.tools.some(t => t.id === tool.id);
  };

  const toggleTool = (tool: Tool) => {
    if (isToolSelected(tool)) {
      setSelection(prev => ({
        ...prev,
        tools: prev.tools.filter(t => t.id !== tool.id),
      }));
      updateLog(`removed ${tool.name.toLowerCase()}`);
    } else {
      setSelection(prev => ({
        ...prev,
        tools: [...prev.tools, tool],
      }));
      updateLog(`added ${tool.name.toLowerCase()}`);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const selectedTools = tools.filter(tool => template.toolIds.includes(tool.id));
    setSelection(prev => ({
      ...prev,
      tools: selectedTools,
    }));
    updateLog(`applied ${template.name.toLowerCase()} template`);
    toast.success(`${template.name} template applied!`, {
      description: `${selectedTools.length} tools pre-selected`,
    });
    // Move to next step after selecting template
    handleNext();
  };

  const selectAllInCategory = () => {
    const categoryTools = tools.filter(t => t.category === currentCategory);
    const toolsToAdd = categoryTools.filter(tool => !isToolSelected(tool));
    
    setSelection(prev => ({
      ...prev,
      tools: [...prev.tools, ...toolsToAdd],
    }));
    updateLog(`selected all ${currentCategory}`);
    toast.success(`All tools in ${steps[currentStep].name} selected`);
  };

  const clearAllInCategory = () => {
    setSelection(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t.category !== currentCategory),
    }));
    updateLog(`cleared all ${currentCategory}`);
    toast.success(`All tools in ${steps[currentStep].name} cleared`);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSearchQuery('');
      updateLog(`navigated to ${steps[currentStep + 1].name.toLowerCase()}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSearchQuery('');
      updateLog(`navigated to ${steps[currentStep - 1].name.toLowerCase()}`);
    }
  };

  const handleReset = () => {
    clearSelection();
    updateLog('reset selection');
    toast.success('Selection cleared');
  };

  const handleDownloadScript = () => {
    const script = generateSetupScript(selection);
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup-macos.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateLog('generating script...');
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    
    toast.success('🎉 Setup script downloaded!', {
      description: 'Run it with: bash setup-macos.sh',
    });
  };

  const selectedByCategory = (category: ToolCategory) => {
    return selection.tools.filter(t => t.category === category);
  };

  const progressPercentage = Math.round((currentStep / (steps.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <PageHeader showGithub={true} />
      
      <div className="flex pt-[73px]">
        {/* Left Sidebar */}
        <aside className="w-[200px] border-r border-border flex flex-col bg-background/50 backdrop-blur-sm fixed left-0 top-[73px] bottom-0 z-30">
        {/* Progress Header */}
        <div className="p-6 border-b border-border">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Setup Progress
          </div>
          <div className="text-3xl font-bold text-primary">
            {progressPercentage}%
          </div>
        </div>

        {/* Navigation Steps */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentStep(index);
                  updateLog(`jumped to ${step.name.toLowerCase()}`);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : isCompleted
                    ? 'text-foreground hover:bg-accent'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="flex-1">{step.name}</span>
                  {isCompleted && !isActive && (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  )}
                </div>
                {isActive && (
                  <div className="text-[10px] text-muted-foreground mt-1 ml-6">
                    {step.subtitle}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen ml-[200px]">
        {/* Top Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            {/* Left: Category Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Stack</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium">{steps[currentStep].name}</span>
              </div>
            </div>

            {/* Right: Search */}
            {currentCategory !== 'review' && currentCategory !== 'templates' && (
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateLog(`searching for "${e.target.value}"`);
                  }}
                  placeholder="Filter browsers..."
                  className="w-[280px] bg-background border border-border rounded-lg py-2 pl-4 pr-10 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-xs text-muted-foreground">/</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-8 py-6 pb-24 overflow-y-auto">
          {/* Page Title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-bold mb-2">{steps[currentStep].name}</h1>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Recommended Section Banner */}
          {currentCategory === 'browsers' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  Recommended Section
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Most developers install standard Chrome and Firefox for cross-browser testing.
                </p>
              </div>
            </motion.div>
          )}

        {/* Templates Section - Only on Step 0 */}
        {currentCategory === 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 rounded-xl border-2 border-border hover:border-primary/50 bg-card hover:bg-accent transition-all text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  <div className="relative">
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {template.description}
                    </p>
                    {template.toolIds.length > 0 && (
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Check className="h-3.5 w-3.5" />
                        <span>{template.toolIds.length} tools included</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Grid or Review */}
        <AnimatePresence mode="wait">
          {currentCategory !== 'review' && currentCategory !== 'templates' ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {filteredTools.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                    {filteredTools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02, duration: 0.3 }}
                      >
                        <ToolCard
                          tool={tool}
                          selected={isToolSelected(tool)}
                          onToggle={() => toggleTool(tool)}
                        />
                      </motion.div>
                    ))}
                    
                    {/* Request a Tool Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: filteredTools.length * 0.02, duration: 0.3 }}
                      className="relative cursor-pointer group"
                      onClick={() => {
                        toast.info('Feature coming soon!', {
                          description: 'Request tool functionality will be available soon.'
                        });
                      }}
                    >
                      <div className="relative overflow-hidden rounded-xl h-[180px] flex flex-col border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30 transition-all duration-200">
                        {/* Top border */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-muted to-muted/50" />
                        
                        <div className="relative z-10 p-4 flex-1 flex flex-col items-center justify-center text-center gap-2.5">
                          <div className="w-12 h-12 rounded-xl bg-muted/50 border-2 border-dashed border-border group-hover:border-primary/50 flex items-center justify-center transition-colors">
                            <span className="text-xl">➕</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground mb-0.5">Request a Tool</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              Don't see what you need? Add<br />a custom Homebrew formula.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Show All Tools Button */}
                  {!searchQuery && !showAllTools && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center py-8 gap-4"
                    >
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredTools.length} popular tools
                      </p>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowAllTools(true)}
                        className="font-medium"
                      >
                        Show All Available Tools
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <X className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    No tools found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search for "{searchQuery}"
                  </p>
                </div>
              )}
            </motion.div>
          ) : currentCategory === 'review' ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="bg-card/50 backdrop-blur border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                  READY TO INITIALIZE
                </p>
                <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  {selection.tools.length} {selection.tools.length === 1 ? 'tool' : 'tools'} selected.
                </h3>
                <p className="text-xl text-muted-foreground mb-10 max-w-md mx-auto">
                  We're ready to compile your setup script. Review your choices or go back to make changes.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-3xl">
                  {Array.from(selection.tools).map(tool => (
                    <span
                      key={tool.id}
                      className="px-3 py-1.5 rounded-md border border-border text-xs font-mono text-muted-foreground bg-background/40 hover:bg-accent transition-colors cursor-default"
                    >
                      {tool.name}
                    </span>
                  ))}
                </div>

                {selection.tools.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12"
                  >
                    <Button
                      size="lg"
                      onClick={handleDownloadScript}
                      className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-xl text-lg group"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Setup Script
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        </main>

        {/* Bottom Control Bar (Fixed) */}
        <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center pb-8">
          <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl py-4 px-6 flex items-center gap-4">
            {/* Left: Selection Count */}
            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <div>
                <div className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5 font-medium">
                  Total Selected
                </div>
                <div className="text-white font-bold text-base">
                  {selection.tools.length} Application{selection.tools.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Right: Navigation Buttons */}
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="h-10 px-6 text-white hover:bg-white/10 hover:text-white font-medium"
                >
                  Back
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="h-10 px-6 bg-white text-black hover:bg-white/90 font-medium gap-2"
                >
                  Next: {steps[currentStep + 1].name}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleDownloadScript}
                  className="h-10 px-6 bg-white text-black hover:bg-white/90 font-medium gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Script
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
      </div>
    </div>
  );
};

export default Configurator;
