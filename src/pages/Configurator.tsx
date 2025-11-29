import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Download, Check, X, Loader2, Star } from 'lucide-react';
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

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSearchQuery('');
      updateLog(`navigated to ${steps[currentStep + 1].name.toLowerCase()}`);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSearchQuery('');
      updateLog(`navigated to ${steps[currentStep - 1].name.toLowerCase()}`);
    } else {
      navigate('/');
    }
  }, [currentStep, navigate]);

  const updateLog = (message: string) => {
    setLiveLog(message);
  };

  const handleDownloadScript = useCallback(() => {
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
  }, [selection]);

  // Keyboard shortcuts - CMD+Left for back, CMD+Right for next, CMD+H for home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if modifiers are not pressed
      if (!(e.metaKey || e.ctrlKey)) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleBack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentStep < steps.length - 1) {
            handleNext();
          }
          break;
        case 'Enter':
          if (currentStep === steps.length - 1) {
            e.preventDefault();
            handleDownloadScript();
          }
          break;
        case 'h':
          e.preventDefault();
          navigate('/');
          break;
        case 'f':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack, handleNext, navigate, currentStep, handleDownloadScript]);

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
    // Special handling for dev-picks: get tools with devPick flag from ALL categories
    if (currentCategory === 'dev-picks') {
      // Get all tools with devPick flag, regardless of category
      let devPickTools = enhancedStaticTools.filter(t => t.devPick === true);

      // Deduplicate by normalized name (filter out beta/nightly/dev variants)
      const seenNames = new Map<string, Tool>();
      devPickTools = devPickTools.filter(tool => {
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

      // Sort: popular first, then alphabetically
      devPickTools.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });

      // Apply "show all" filter
      if (!showAllTools) {
        const popularTools = devPickTools.filter(t => t.popular);
        if (popularTools.length >= 10) {
          devPickTools = popularTools.slice(0, 50);
        } else {
          devPickTools = devPickTools.slice(0, 30);
        }
      }

      return devPickTools;
    }

    // Regular category filtering
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

  const handleReset = () => {
    clearSelection();
    updateLog('reset selection');
    toast.success('Selection cleared');
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
              className="mb-6 p-6 bg-[#222222] dark:bg-[#1A1A1A] text-[#FAF3E1] rounded-xl border-2 border-[#222222] dark:border-[#3A3A3A] shadow-[4px_4px_0px_0px_#FF6D1F] relative overflow-hidden group"
            >
              {/* Decorative circle */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FF6D1F] rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="flex items-start gap-5 relative z-10">
                <div className="w-12 h-12 bg-[#FF6D1F] text-[#222222] rounded-lg flex items-center justify-center border-2 border-[#FAF3E1] shadow-sm shrink-0">
                  <Star className="h-6 w-6 fill-current" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-[#FAF3E1]">Recommended Stack</h3>
                  <p className="text-[#F5E7C6]/90 dark:text-[#F5E7C6] font-medium max-w-2xl">
                    Most developers install standard <span className="text-white border-b-2 border-[#FF6D1F] font-bold">Chrome</span> and <span className="text-white border-b-2 border-[#FF6D1F] font-bold">Firefox</span> for cross-browser testing.
                  </p>
                </div>
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
                    className="group relative p-6 rounded-xl border-2 border-[#222222] dark:border-[#3A3A3A] hover:border-[#FF6D1F] bg-[#F5E7C6] dark:bg-[#111111] shadow-[4px_4px_0px_0px_#222222] dark:shadow-[4px_4px_0px_0px_#3A3A3A] hover:shadow-[6px_6px_0px_0px_#222222] dark:hover:shadow-[6px_6px_0px_0px_#3A3A3A] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-left overflow-hidden"
                  >
                    {/* Decorative gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF6D1F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative">
                      <h3 className="font-bold text-lg mb-2 text-[#222222] dark:text-white group-hover:text-[#FF6D1F] transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-[#222222]/70 dark:text-gray-400 mb-4 leading-relaxed font-medium">
                        {template.description}
                      </p>
                      {template.toolIds.length > 0 && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-[#222222]/60 dark:text-gray-400 group-hover:text-[#FF6D1F] transition-colors">
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
                        <div className="relative overflow-hidden rounded-xl h-[200px] flex flex-col border-2 border-dashed border-[#222222] dark:border-[#3A3A3A] hover:border-[#FF6D1F] dark:hover:border-[#FF6D1F] bg-[#FAF3E1] dark:bg-[#0A0A0A] hover:bg-[#F5E7C6] dark:hover:bg-[#111111] transition-all duration-200 shadow-[4px_4px_0px_0px_#222222] dark:shadow-[4px_4px_0px_0px_#3A3A3A] hover:shadow-[6px_6px_0px_0px_#222222] dark:hover:shadow-[6px_6px_0px_0px_#3A3A3A] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                          <div className="relative z-10 p-5 flex-1 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#1A1A1A] border-2 border-dashed border-[#222222] dark:border-[#3A3A3A] group-hover:border-[#FF6D1F] dark:group-hover:border-[#FF6D1F] flex items-center justify-center transition-colors">
                              <span className="text-2xl">➕</span>
                            </div>
                            <div className="px-4">
                              <p className="text-base font-bold text-[#222222] dark:text-white mb-1.5 leading-tight">Request a Tool</p>
                              <p className="text-[10.5px] text-[#222222]/70 dark:text-gray-400 leading-[1.4] font-medium">
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto py-12"
              >
                {/* Header */}
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black text-[hsl(var(--foreground))] mb-3">
                    {selection.tools.length} {selection.tools.length === 1 ? 'Tool' : 'Tools'}
                  </h2>
                  <p className="text-base text-[hsl(var(--muted-foreground))] font-medium">Ready to install on your Mac</p>
                </div>
                
                {/* Tools Grid */}
                <div className="flex flex-wrap gap-2.5 justify-center mb-16">
                  {Array.from(selection.tools).map(tool => (
                    <span
                      key={tool.id}
                      className="px-4 py-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] transition-colors"
                    >
                      {tool.name}
                    </span>
                  ))}
                </div>

                {selection.tools.length > 0 && (
                  <>
                    {/* Commands Section */}
                    <div className="space-y-6 mb-12">
                      <div>
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Make executable</p>
                        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-4">
                          <code className="font-mono text-sm text-[hsl(var(--foreground))]">chmod +x setup-macos.sh</code>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Run script</p>
                        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-4">
                          <code className="font-mono text-sm text-[hsl(var(--foreground))]">./setup-macos.sh</code>
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={handleDownloadScript}
                      className="w-full h-14 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Download className="h-5 w-5" />
                      Download Setup Script
                    </button>
                  </>
                )}
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
        onBack={handleBack}
        primaryButtonText={getPrimaryButtonText()}
        primaryButtonIcon={getPrimaryButtonIcon()}
        onPrimaryAction={currentStep < steps.length - 1 ? handleNext : handleDownloadScript}
        primaryShortcut={currentStep === steps.length - 1 ? 'Enter' : undefined}
        showThemeToggle={true}
        showKeyboardShortcuts={true}
      />
    </PageLayout>
  );
};

export default Configurator;
