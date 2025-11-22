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
    
    const allTools = Array.from(toolMap.values());
    
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(99,102,241,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <PageHeader showGithub={false} />

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-12 flex-1 flex flex-col relative pb-32 pt-32">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </motion.div>

        {/* Timeline Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 pb-6 border-b border-border"
        >
          <div className="flex justify-between items-center">
            <nav className="flex items-center gap-8 font-mono text-xs tracking-wider">
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
                    className={`py-2 border-b-2 transition-all duration-300 uppercase ${
                      isActive
                        ? 'border-foreground text-foreground'
                        : isCompleted
                        ? 'border-border text-muted-foreground hover:text-foreground'
                        : 'border-transparent text-muted-foreground/50 hover:text-muted-foreground'
                    }`}
                  >
                    <span className="mr-2 opacity-50">0{index + 1}</span>
                    {step.name}
                  </button>
                );
              })}
            </nav>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Total Selected
                </div>
                <div className="font-mono text-xl font-bold">{selection.tools.length}</div>
              </div>
              <button
                onClick={handleReset}
                className={`text-xs text-red-400 hover:text-red-300 transition-opacity hover:underline ${
                  selection.tools.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stage Header & Search */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            {/* Top Section: Category Label & Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.p
                  layout
                  className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium"
                >
                  {steps[currentStep].subtitle}
                </motion.p>
                {currentCategory !== 'review' && currentCategory !== 'templates' && filteredTools.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-px bg-border" />
                    <span className="text-xs text-muted-foreground font-mono">
                      {filteredTools.filter(t => isToolSelected(t)).length} of {filteredTools.length} selected
                    </span>
                  </div>
                )}
              </div>
              
              {currentCategory !== 'review' && currentCategory !== 'templates' && filteredTools.length > 0 && (
                <div className="flex items-center gap-3">
                  {brewLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Loading packages...</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      refreshData();
                      toast.success('Refreshing package data...');
                    }}
                    className="h-8 text-xs font-medium"
                    disabled={brewLoading}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1.5 ${brewLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllInCategory}
                    className="h-8 text-xs font-medium"
                  >
                    <Check className="h-3 w-3 mr-1.5" />
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllInCategory}
                    className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1.5" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Title & Search Row */}
            <div className="flex items-end justify-between gap-8">
              <motion.h1
                layout
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight"
              >
                {steps[currentStep].name}
              </motion.h1>
              
              {currentCategory !== 'review' && currentCategory !== 'templates' && (
                <div className="relative group min-w-[280px]">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      updateLog(`searching for "${e.target.value}"`);
                    }}
                    placeholder="Search tools..."
                    className="w-full bg-muted/50 border border-border rounded-lg py-2.5 px-4 pr-20 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <span className="font-mono bg-background border border-border rounded px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      ⌘K
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

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
              {/* Info Banner */}
              {!brewLoading && totalCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Live Homebrew Data
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Showing {filteredTools.length.toLocaleString()} packages from {totalCount.toLocaleString()} total
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {filteredTools.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-8">
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
                      <p className="text-xs text-muted-foreground">
                        or use search to find specific packages
                      </p>
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

        {/* Bottom Control Bar (Floating) */}
        <div className="fixed bottom-6 left-0 right-0 max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-end pointer-events-none">
          {/* Live Log */}
          <div className="font-mono text-xs text-muted-foreground bg-background/80 backdrop-blur border border-border px-4 py-2 rounded-lg flex items-center gap-2 pointer-events-auto min-w-[300px] shadow-lg">
            <span className="text-green-400">➜</span>
            <span className="flex-1">{liveLog}</span>
            <span className="w-1.5 h-3 bg-muted-foreground/40 ml-auto animate-pulse" />
          </div>

          <div className="flex items-center gap-4 pointer-events-auto">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outline"
              className="px-6 py-3 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-0 disabled:pointer-events-none flex items-center gap-2"
            >
              Back
            </Button>

            {currentStep < steps.length - 1 && (
              <Button
                onClick={handleNext}
                className="pl-8 pr-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg flex items-center gap-3 group"
              >
                <span>Next Step</span>
                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  <span className="font-mono border border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground rounded px-1.5 py-0.5 text-[10px]">
                    CMD
                  </span>
                  <span className="font-mono border border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground rounded px-1.5 py-0.5 text-[10px]">
                    →
                  </span>
                </div>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Configurator;
