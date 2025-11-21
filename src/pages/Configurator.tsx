import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Download, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ProgressBar';
import { ToolCard } from '@/components/ToolCard';
import { SearchBar } from '@/components/SearchBar';
import { tools } from '@/data/tools';
import { Tool, Selection, ToolCategory } from '@/types/tools';
import { generateSetupScript } from '@/utils/scriptGenerator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const steps = [
  { id: 'applications', name: 'Applications', description: 'GUI apps' },
  { id: 'package-managers', name: 'Package Managers', description: 'Version managers' },
  { id: 'devops', name: 'DevOps', description: 'Cloud & containers' },
  { id: 'cli-tools', name: 'CLI Tools', description: 'Terminal utilities' },
  { id: 'review', name: 'Review', description: 'Generate script' },
];

const Configurator = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selection, setSelection] = useState<Selection>({
    tools: [],
    languageVersions: [],
    customScripts: [],
  });

  const currentCategory = steps[currentStep].id as ToolCategory | 'review';
  
  const filteredTools = useMemo(() => {
    if (currentCategory === 'review') return [];
    
    return tools
      .filter(t => t.category === currentCategory)
      .filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [currentCategory, searchQuery]);

  const isToolSelected = (tool: Tool) => {
    return selection.tools.some(t => t.id === tool.id);
  };

  const toggleTool = (tool: Tool) => {
    if (isToolSelected(tool)) {
      setSelection(prev => ({
        ...prev,
        tools: prev.tools.filter(t => t.id !== tool.id),
      }));
    } else {
      setSelection(prev => ({
        ...prev,
        tools: [...prev.tools, tool],
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSearchQuery('');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSearchQuery('');
    }
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
    
    // Celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#5B8DEF', '#7B68EE', '#9B59B6'],
    });
    
    toast.success('🎉 Setup script downloaded!', {
      description: 'Run it with: bash setup-macos.sh',
    });
  };

  const selectedByCategory = (category: ToolCategory) => {
    return selection.tools.filter(t => t.category === category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-20" />
      
      <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </motion.button>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold gradient-text"
            >
              Mac Setup Genie
            </motion.h1>
            <div className="w-28" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProgressBar steps={steps} currentStep={currentStep} />
        </motion.div>

        <AnimatePresence mode="wait">
          {currentCategory !== 'review' ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
                </div>
                <h2 className="text-4xl font-bold mb-3">{steps[currentStep].name}</h2>
                <p className="text-lg text-muted-foreground">{steps[currentStep].description}</p>
              </div>

              <div className="max-w-md mx-auto">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={`Search ${steps[currentStep].name.toLowerCase()}...`}
                />
              </div>

              <motion.div
                layout
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <ToolCard
                      tool={tool}
                      selected={isToolSelected(tool)}
                      onToggle={() => toggleTool(tool)}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {filteredTools.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="text-muted-foreground text-lg">No tools found matching "{searchQuery}"</p>
                </motion.div>
              )}
            </motion.div>
            ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-primary text-white mb-6 shadow-lg"
                >
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">{selection.tools.length} tools selected</span>
                </motion.div>
                <h2 className="text-4xl font-bold mb-3">Review Your Setup</h2>
                <p className="text-lg text-muted-foreground">
                  Everything looks good? Download your custom installation script
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                {(['applications', 'package-managers', 'devops', 'cli-tools'] as ToolCategory[]).map((category, catIndex) => {
                  const categoryTools = selectedByCategory(category);
                  if (categoryTools.length === 0) return null;

                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.1 }}
                    >
                      <Card className="p-6 hover-lift border-2 bg-card/50 backdrop-blur-sm">
                        <h3 className="font-bold mb-4 text-xl capitalize flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {category.replace('-', ' ')}
                        </h3>
                        <ul className="space-y-3">
                          {categoryTools.map(tool => (
                            <motion.li
                              key={tool.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 text-sm"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary" />
                              </div>
                              <span className="font-medium">{tool.name}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {selection.tools.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center pt-6"
                >
                  <Button
                    size="lg"
                    onClick={handleDownloadScript}
                    className="bg-gradient-primary hover:opacity-90 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg h-16 px-12 group"
                  >
                    <Download className="mr-2 h-6 w-6 group-hover:animate-bounce" />
                    Download Setup Script
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between mt-12 pt-6 border-t"
        >
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="border-2 hover:border-primary/50 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < steps.length - 1 && (
            <Button 
              onClick={handleNext}
              className="bg-gradient-primary hover:opacity-90 shadow-lg"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Configurator;
