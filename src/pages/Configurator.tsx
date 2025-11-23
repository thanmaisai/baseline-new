import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Download, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolCard } from '@/components/ToolCard';
import { PageLayout } from '@/components/PageLayout';
import { NotionBreadcrumb } from '@/components/NotionBreadcrumb';
import { FloatingFooter } from '@/components/FloatingFooter';
import { usePersistedSelection } from '@/hooks/usePersistedSelection';
import { useBrewPackages } from '@/hooks/useBrewPackages';
import { useDebounce } from '@/hooks/useDebounce';
import { enhanceToolsWithBrewData } from '@/services/toolEnhancementService';
import { tools } from '@/data/tools';
import { Tool, ToolCategory } from '@/types/tools';
import { generateSetupScript } from '@/utils/scriptGenerator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const steps = [
  { id: 'templates', name: 'Templates', subtitle: 'Choose Your Starting Point' },
  { id: 'browsers', name: 'Browsers', subtitle: 'Web Browsers' },
  { id: 'communication', name: 'Communication', subtitle: 'Chat, Email & Video' },
  { id: 'productivity', name: 'Productivity', subtitle: 'Notes, Tasks & Office' },
  { id: 'package-managers', name: 'Package Managers', subtitle: 'Version & Package Managers' },
  { id: 'languages', name: 'Languages', subtitle: 'Runtimes & Version Managers' },
  { id: 'databases', name: 'Databases', subtitle: 'Data Storage Solutions' },
  { id: 'devops', name: 'DevOps', subtitle: 'Cloud & Container Tools' },
  { id: 'dev-tools', name: 'Dev Tools', subtitle: 'Editors, IDEs & API Clients' },
  { id: 'design-tools', name: 'Design', subtitle: 'Graphics & Design Tools' },
  { id: 'terminal', name: 'Terminal', subtitle: 'Shells & Terminal Apps' },
  { id: 'cli-tools', name: 'CLI Tools', subtitle: 'Command-Line Utilities' },
  { id: 'media', name: 'Media', subtitle: 'Music & Video Players' },
  { id: 'security', name: 'Security', subtitle: 'Password & VPN Tools' },
  { id: 'utilities', name: 'Utilities', subtitle: 'System & Productivity Apps' },
  { id: 'dev-picks', name: 'Dev Picks', subtitle: 'Developer-Preferred Apps' },
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
  const debouncedSearchQuery = useDebounce(searchQuery, 250); // 250ms debounce for snappy feel
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

  // Keyboard shortcuts - CMD+Left for back, CMD+Right for next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
          setSearchQuery('');
          updateLog(`navigated to ${steps[currentStep - 1].name.toLowerCase()}`);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
          setSearchQuery('');
          updateLog(`navigated to ${steps[currentStep + 1].name.toLowerCase()}`);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
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

    // Enhance static tools with Homebrew data (homepage URLs, etc.)
    const enhancedStaticTools = enhanceToolsWithBrewData(tools, brewPackages);

    // If searching, search across ALL tools
    if (debouncedSearchQuery.trim()) {
      // Get all tools from all categories
      const allStaticTools = enhancedStaticTools;
      const allBrewPackages = brewPackages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        category: pkg.category as ToolCategory,
        installCommand: pkg.installCommand,
        type: (pkg.type === 'cask' ? 'brew-cask' : 'brew') as 'brew' | 'brew-cask',
        isHomebrew: true,
        url: pkg.url,
        version: pkg.version,
        popular: pkg.popular,
      } as Tool));

      // Combine and deduplicate by install command (prefer enhanced static tools)
      const toolMap = new Map<string, Tool>();
      allStaticTools.forEach(tool => toolMap.set(tool.installCommand, tool));
      allBrewPackages.forEach(tool => {
        if (!toolMap.has(tool.installCommand)) {
          toolMap.set(tool.installCommand, tool);
        }
      });

      const allTools = Array.from(toolMap.values());

      // Use fuzzy search with optimized configuration
      const fuse = new Fuse(allTools, {
        keys: [
          { name: 'name', weight: 2 },           // Prioritize name matches
          { name: 'description', weight: 1 },    // Then description matches
        ],
        threshold: 0.3,                         // Stricter matching (0 = perfect, 1 = match anything)
        distance: 100,                          // Maximum distance between characters
        minMatchCharLength: 2,                  // Minimum characters to start matching
        includeScore: true,
        ignoreLocation: true,                   // Match anywhere in the string
        useExtendedSearch: false,
      });

      let searchResults = fuse.search(debouncedSearchQuery)
        .map(result => result.item);

      // Deduplicate by normalized name (filter out beta/nightly/dev variants)
      const seenNames = new Map<string, Tool>();
      searchResults = searchResults.filter(tool => {
        const normalizedName = tool.name.toLowerCase().replace(/[\s-]/g, '');
        const isBetaVariant = /-(beta|nightly|dev|preview|alpha|rc|canary)/.test(tool.installCommand);

        if (!seenNames.has(normalizedName)) {
          seenNames.set(normalizedName, tool);
          return true;
        }

        // If we've seen this name, only keep it if the existing one is a beta variant and this isn't
        const existing = seenNames.get(normalizedName)!;
        const existingIsBeta = /-(beta|nightly|dev|preview|alpha|rc|canary)/.test(existing.installCommand);

        if (existingIsBeta && !isBetaVariant) {
          seenNames.set(normalizedName, tool);
          return true;
        }

        return false;
      });

      // Sort: exact name match > popular > alphabetically
      searchResults.sort((a, b) => {
        const aNameLower = a.name.toLowerCase();
        const bNameLower = b.name.toLowerCase();
        const queryLower = debouncedSearchQuery.toLowerCase();

        const aExactName = aNameLower === queryLower;
        const bExactName = bNameLower === queryLower;
        const aStartsWith = aNameLower.startsWith(queryLower);
        const bStartsWith = bNameLower.startsWith(queryLower);

        if (aExactName && !bExactName) return -1;
        if (!aExactName && bExactName) return 1;
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;

        return a.name.localeCompare(b.name);
      });

      return searchResults;
    }

    // When NOT searching, filter by current category
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
        url: pkg.url,  // URL from Homebrew API
        version: pkg.version,
        popular: pkg.popular,
      } as Tool));

    const staticTools = enhancedStaticTools.filter(t => t.category === currentCategory);

    // Combine and deduplicate by install command (prefer static tools)
    const toolMap = new Map<string, Tool>();
    staticTools.forEach(tool => toolMap.set(tool.installCommand, tool));
    categoryBrewPackages.forEach(tool => {
      if (!toolMap.has(tool.installCommand)) {
        toolMap.set(tool.installCommand, tool);
      }
    });

    let allTools = Array.from(toolMap.values());

    // Deduplicate by normalized name (filter out beta/nightly/dev variants)
    const seenNames = new Map<string, Tool>();
    allTools = allTools.filter(tool => {
      const normalizedName = tool.name.toLowerCase().replace(/[\s-]/g, '');
      const isBetaVariant = /-(beta|nightly|dev|preview|alpha|rc|canary)/.test(tool.installCommand);

      if (!seenNames.has(normalizedName)) {
        seenNames.set(normalizedName, tool);
        return true;
      }

      // If we've seen this name, only keep it if the existing one is a beta variant and this isn't
      const existing = seenNames.get(normalizedName)!;
      const existingIsBeta = /-(beta|nightly|dev|preview|alpha|rc|canary)/.test(existing.installCommand);

      if (existingIsBeta && !isBetaVariant) {
        seenNames.set(normalizedName, tool);
        return true;
      }

      return false;
    });

    // For 'dev-picks' category (Dev Picks), only show tools with devPick: true
    if (currentCategory === 'dev-picks') {
      allTools = allTools.filter(tool => tool.devPick === true);
    }

    // Sort: popular first, then alphabetically
    allTools.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    });

    // If not showing all, limit to popular tools
    if (!showAllTools) {
      const popularTools = allTools.filter(t => t.popular);
      // Show popular tools up to 50, or if less than 10 popular tools, show first 30 alphabetically
      if (popularTools.length >= 10) {
        allTools = popularTools.slice(0, 50);
      } else {
        allTools = allTools.slice(0, 30);
      }
    }

    return allTools;
  }, [currentCategory, debouncedSearchQuery, brewPackages, showAllTools]);

  const isToolSelected = useCallback((tool: Tool) => {
    return selection.tools.some(t => t.id === tool.id);
  }, [selection.tools]);

  const toggleTool = useCallback((tool: Tool) => {
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
  }, [isToolSelected, setSelection]);

  const applyTemplate = useCallback((templateId: string) => {
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
  }, [setSelection]);

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

  const getFooterStatus = () => {
    if (currentCategory === 'review') {
      return { label: 'READY TO INSTALL', text: `${selection.tools.length} Tools Selected` };
    }
    return { label: 'SETUP PROGRESS', text: `${progressPercentage}% Complete` };
  };

  const getPrimaryButtonText = () => {
    if (currentStep < steps.length - 1) {
      return `Next: ${steps[currentStep + 1].name}`;
    }
    return 'Download Script';
  };

  const getPrimaryButtonIcon = () => {
    if (currentStep === steps.length - 1) {
      return <Download className="h-4 w-4 mr-2" />;
    }
    return undefined;
  };

  const footerStatus = getFooterStatus();

  return (
    <PageLayout>
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-6 border-b border-gray-50 dark:border-[#262626] flex flex-col justify-center">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">{steps[currentStep].name}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-light text-sm">{steps[currentStep].subtitle}</p>
          </div>
          {/* Breadcrumbs/Timeline */}
          <div className="w-full flex justify-end">
            <NotionBreadcrumb
              steps={steps}
              currentIndex={currentStep}
              onStepClick={(index) => {
                setCurrentStep(index);
                updateLog(`jumped to ${steps[index].name.toLowerCase()}`);
              }}
            />
          </div>
        </div>

        {/* Search Bar */}
        {currentCategory !== 'review' && currentCategory !== 'templates' && (
          <div className="mt-4 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  updateLog(`searching for "${e.target.value}"`);
                }
              }}
              placeholder="Search all tools..."
              className="w-full max-w-md bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-lg py-2.5 pl-3.5 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery !== debouncedSearchQuery ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-[10px] text-gray-400 font-mono">⌘F</span>
              </div>
            )}
            {debouncedSearchQuery && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                {filteredTools.length} {filteredTools.length === 1 ? 'result' : 'results'}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto p-6 md:p-8 flex flex-col">
        <div className="max-w-full mx-auto w-full">
          {/* Recommended Section Banner */}
          {currentCategory === 'browsers' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2.5"
            >
              <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                  Recommended Section
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-snug">
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
              className="mb-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => applyTemplate(template.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative p-4 rounded-lg border-2 border-gray-200 dark:border-[#262626] hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-[#111111] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-all text-left"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                    <div className="relative">
                      <h3 className="font-bold text-lg mb-1.5 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-snug">
                        {template.description}
                      </p>
                      {template.toolIds.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                          <Check className="h-3 w-3" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
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
                        <div className="relative overflow-hidden rounded-lg h-[160px] flex flex-col border-2 border-dashed border-gray-300 dark:border-[#262626] hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-[#111111] transition-all duration-200">
                          {/* Top border */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-[#262626] to-[#404040]" />

                          <div className="relative z-10 p-3.5 flex-1 flex flex-col items-center justify-center text-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-[#1A1A1A] border-2 border-dashed border-gray-300 dark:border-[#262626] group-hover:border-blue-500 dark:group-hover:border-blue-400 flex items-center justify-center transition-colors">
                              <span className="text-lg">➕</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Request a Tool</p>
                              <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-snug">
                                Don't see what you need? Add a custom Homebrew formula.
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
                        className="flex flex-col items-center justify-center py-6 gap-3"
                      >
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Showing {filteredTools.length} popular tools
                        </p>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setShowAllTools(true)}
                          className="font-medium border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
                        >
                          Show All Available Tools
                        </Button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center mb-3">
                      <X className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-base font-medium text-gray-900 dark:text-white mb-1.5">
                      No tools found
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
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
                <div className="bg-gray-50 dark:bg-[#0A0A0A] backdrop-blur border border-gray-200 dark:border-[#262626] rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-4">
                    READY TO INITIALIZE
                  </p>
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                    {selection.tools.length} {selection.tools.length === 1 ? 'tool' : 'tools'} selected.
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    We're ready to compile your setup script. Review your choices or go back to make changes.
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-3xl">
                    {Array.from(selection.tools).map(tool => (
                      <span
                        key={tool.id}
                        className="px-2.5 py-1 rounded-md border border-gray-200 dark:border-[#262626] text-[10px] font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-[#111111] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors cursor-default"
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
                      className="mt-8"
                    >
                      <Button
                        size="lg"
                        onClick={handleDownloadScript}
                        className="h-11 px-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium shadow-lg text-base group"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Setup Script
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Footer Navigation Bar */}
      <FloatingFooter
        statusLabel={footerStatus.label}
        statusText={footerStatus.text}
        showBackButton={true}
        backButtonText={currentCategory === 'templates' ? 'Back to Home' : 'Back'}
        onBack={currentCategory === 'templates' ? () => navigate('/') : handleBack}
        primaryButtonText={getPrimaryButtonText()}
        primaryButtonIcon={getPrimaryButtonIcon()}
        onPrimaryAction={currentStep < steps.length - 1 ? handleNext : handleDownloadScript}
        showThemeToggle={true}
        showKeyboardShortcuts={true}
      />
    </PageLayout>
  );
};

export default Configurator;
