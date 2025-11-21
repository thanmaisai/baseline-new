import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Download, Check } from 'lucide-react';
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
    
    toast.success('Setup script downloaded!', {
      description: 'Run it with: bash setup-macos.sh',
    });
  };

  const selectedByCategory = (category: ToolCategory) => {
    return selection.tools.filter(t => t.category === category);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DevEnv Setup
            </h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <ProgressBar steps={steps} currentStep={currentStep} />

        {currentCategory !== 'review' ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{steps[currentStep].name}</h2>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </div>

            <div className="max-w-md mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={`Search ${steps[currentStep].name.toLowerCase()}...`}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  selected={isToolSelected(tool)}
                  onToggle={() => toggleTool(tool)}
                />
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tools found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Review Your Setup</h2>
              <p className="text-muted-foreground">
                {selection.tools.length} tool{selection.tools.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {(['applications', 'package-managers', 'devops', 'cli-tools'] as ToolCategory[]).map(category => {
                const categoryTools = selectedByCategory(category);
                if (categoryTools.length === 0) return null;

                return (
                  <Card key={category} className="p-6">
                    <h3 className="font-semibold mb-4 text-lg capitalize">
                      {category.replace('-', ' ')}
                    </h3>
                    <ul className="space-y-2">
                      {categoryTools.map(tool => (
                        <li key={tool.id} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-accent" />
                          <span>{tool.name}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>

            {selection.tools.length > 0 && (
              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={handleDownloadScript}
                  className="bg-gradient-primary hover:opacity-90 shadow-hover"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Setup Script
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-12 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < steps.length - 1 && (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Configurator;
