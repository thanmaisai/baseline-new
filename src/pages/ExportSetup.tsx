import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Upload, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { generateScanScript } from '@/utils/scanScriptGenerator';
import { generateSetupFromScan, parseBaselineJSON } from '@/utils/scanParser';
import { FloatingFooter } from '@/components/FloatingFooter';
import { PageLayout } from '@/components/PageLayout';
import { toast } from 'sonner';
import { themeTokens } from '@/theme/tokens';
import { useTheme } from '@/contexts/ThemeContext';

const ExportSetup = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedManualCommand, setCopiedManualCommand] = useState(false);
  const [scanData, setScanData] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get theme-aware border colors
  const isDark = theme === 'dark';
  const borderColors = {
    card: themeTokens.colors[isDark ? 'dark' : 'light'].border.card,
    cardInner: themeTokens.colors[isDark ? 'dark' : 'light'].border.cardInner,
  };

  const curlCommand = `curl -fsSL https://raw.githubusercontent.com/thanmaisai/mac-setup-genie/main/public/baseline-scan.sh | bash`;
  const manualCommand = `chmod +x baseline-scanner.sh && ./baseline-scanner.sh`;
  
  const handleDownloadScript = () => {
    const a = document.createElement('a');
    a.href = '/baseline-scan.sh';
    a.download = 'baseline-scanner.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Scanner downloaded!', {
      description: 'Run baseline-scanner.sh in your terminal'
    });
  };

  const handleCopyCommand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopiedCommand(true);
      toast.success('Copied!');
      setTimeout(() => setCopiedCommand(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleCopyManualCommand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(manualCommand);
      setCopiedManualCommand(true);
      toast.success('Copied!');
      setTimeout(() => setCopiedManualCommand(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => {
      toast.error('Failed to read file', {
        description: 'Please try again'
      });
    };
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (!content) {
        toast.error('File appears to be empty');
        return;
      }
      
      setScanData(content);
      setFileName(file.name);
      
      const parsed = parseBaselineJSON(content);
      if (parsed) {
        setParsedData(parsed);
        toast.success('Snapshot loaded!', {
          description: `Found ${parsed.package_managers.homebrew?.formulae.length || 0} packages and ${parsed.applications.length} apps`
        });
      } else {
        setParsedData(null);
        toast.success('File uploaded!');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  }, [currentStep, navigate]);

  const handleGenerateScript = useCallback(() => {
    if (!scanData.trim()) {
      toast.error('No scan data found', {
        description: 'Please upload a baseline-snapshot.json file first'
      });
      return;
    }
    
    try {
      const setupScript = generateSetupFromScan(scanData);
      
      const blob = new Blob([setupScript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'baseline-setup.sh';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('🎉 Setup script downloaded!', {
        description: 'Run baseline-setup.sh on your new Mac'
      });
    } catch (error) {
      toast.error('Failed to generate script', {
        description: 'Please check the console for details'
      });
    }
  }, [scanData]);

  const handleNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerateScript();
    }
  }, [currentStep, handleGenerateScript]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentStep < 3) {
          handleNext();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (currentStep === 3) {
          e.preventDefault();
          handleGenerateScript();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack, handleNext, navigate, currentStep, handleGenerateScript]);

  const getFooterStatus = () => {
    switch (currentStep) {
      case 1:
        return { label: 'CURRENT STATUS', text: 'Scanner Download' };
      case 2:
        return { label: 'CURRENT STATUS', text: scanData ? 'Scan Ready' : 'Waiting for Upload' };
      case 3:
        return { label: 'READY TO INSTALL', text: 'Setup Complete' };
      default:
        return { label: 'CURRENT STATUS', text: 'Scanner Download' };
    }
  };

  const getPrimaryButtonText = () => {
    switch (currentStep) {
      case 1:
        return 'Next: Upload Scan';
      case 2:
        return 'Next: Generate Script';
      case 3:
        return 'Download Script';
      default:
        return 'Next';
    }
  };

  const getPrimaryButtonIcon = () => {
    if (currentStep === 3) {
      return <Download className="h-4 w-4 mr-2" />;
    }
    return undefined;
  };

  const footerStatus = getFooterStatus();

  return (
    <PageLayout>
      {/* Header */}
      <header 
        className="flex-shrink-0 px-6 md:px-10 py-8 border-b flex flex-col justify-center"
        style={{ borderColor: borderColors.cardInner }}
      >
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div 
              className="inline-flex items-center gap-2 bg-[var(--brand-sand)]/60 dark:bg-[var(--brand-ink)]/60 text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full border text-[var(--brand-ink)] dark:text-[var(--brand-sand)]"
              style={{ borderColor: borderColors.cardInner }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-sunset)]" />
              Clone your Mac
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)] tracking-tight">
              Export & Replicate
            </h1>
            <p className="text-[var(--brand-ink)]/60 dark:text-[var(--brand-sand)]/60 text-sm md:text-base max-w-2xl">
              Scan your current Mac, capture all tools and configurations, and generate a setup script for your new machine.
            </p>
          </div>
          {/* Breadcrumbs */}
          <div className="hidden lg:flex items-center space-x-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-ink)]/40 dark:text-[var(--brand-sand)]/40 mb-1">
              <button
                onClick={() => setCurrentStep(1)}
                className={`transition-all ${
                  currentStep === 1
                    ? 'text-[var(--brand-ink)] dark:text-[var(--brand-sand)]'
                    : currentStep > 1
                    ? 'text-[var(--brand-ink)] dark:text-[var(--brand-sand)] opacity-30 line-through hover:opacity-60 hover:no-underline cursor-pointer'
                    : 'text-[var(--brand-ink)]/40 dark:text-[var(--brand-sand)]/40'
                }`}
              >
                Scanner
              </button>
              <span className="text-[var(--brand-ink)]/20 dark:text-[var(--brand-sand)]/20">/</span>
              <button
                onClick={() => currentStep > 1 && setCurrentStep(2)}
                className={`transition-all ${
                  currentStep === 2
                    ? 'text-[var(--brand-ink)] dark:text-[var(--brand-sand)]'
                    : currentStep > 2
                    ? 'text-[var(--brand-ink)] dark:text-[var(--brand-sand)] opacity-30 line-through hover:opacity-60 hover:no-underline cursor-pointer'
                    : 'text-[var(--brand-ink)]/40 dark:text-[var(--brand-sand)]/40'
                }`}
              >
                Upload
              </button>
              <span className="text-[var(--brand-ink)]/20 dark:text-[var(--brand-sand)]/20">/</span>
              <button
                onClick={() => currentStep > 2 && setCurrentStep(3)}
                className={`transition-all ${
                  currentStep === 3
                    ? 'text-[var(--brand-ink)] dark:text-[var(--brand-sand)]'
                    : 'text-[var(--brand-ink)]/40 dark:text-[var(--brand-sand)]/40'
                }`}
              >
                Generate
              </button>
            </div>
          </div>
        </header>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto px-6 md:px-10 py-12 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full">

          {/* Step 1: Download Scanner */}
          {currentStep === 1 && (
            <section className="animate-in fade-in duration-500">
              <div className="flex items-start mb-10">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--brand-sunset)] text-[var(--brand-ink)] flex items-center justify-center font-bold mr-5 text-xl shadow-lg">
                  1
                </div>
                <div className="pt-1.5">
                  <h2 className="text-2xl font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)] mb-2 tracking-tight">Download the Scanner Script</h2>
                  <p className="text-[var(--brand-ink)]/60 dark:text-[var(--brand-sand)]/60 text-base max-w-2xl">Get our scanner that detects all your installed tools, apps, and configurations. Safe, read-only, and open-source.</p>
                </div>
              </div>

              <div className="ml-0 md:ml-17 grid md:grid-cols-2 gap-6">
                {/* Option 1: Manual */}
                <div 
                  className="p-8 rounded-2xl border-2 transition-all duration-200 hover:bg-[var(--brand-sand)]/10 dark:hover:bg-white/5 flex flex-col h-full group"
                  style={{
                    borderColor: borderColors.card,
                    backgroundColor: 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-base mb-1 text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">Option 1: Manual</h3>
                      <p className="text-sm text-[var(--brand-ink)]/50 dark:text-[var(--brand-sand)]/50">Download and run manually</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleDownloadScript}
                    className="w-full mb-4 bg-[var(--brand-sunset)] hover:bg-[var(--brand-sunset)]/90 text-[var(--brand-ink)] font-semibold h-11 rounded-xl"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download baseline-scanner.sh
                  </Button>
                  <div 
                    className="mt-auto pt-4 border-t"
                    style={{ borderColor: borderColors.cardInner }}
                  >
                    <p className="text-[10px] text-[var(--brand-ink)]/50 dark:text-[var(--brand-sand)]/50 mb-2 uppercase tracking-widest font-bold">Then run in terminal:</p>
                    <div 
                      className="bg-[var(--brand-ink)]/5 dark:bg-[var(--brand-sand)]/5 rounded-xl px-4 py-3 relative cursor-pointer hover:bg-[var(--brand-ink)]/10 dark:hover:bg-[var(--brand-sand)]/10 transition-colors border"
                      style={{ borderColor: borderColors.cardInner }}
                      onClick={handleCopyManualCommand}
                    >
                      <code className="block text-xs font-mono text-[var(--brand-ink)] dark:text-[var(--brand-sand)] pr-16">
                        {manualCommand}
                      </code>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-3 bg-[var(--brand-ink)] dark:bg-[var(--brand-sand)] hover:bg-[var(--brand-sunset)] dark:hover:bg-[var(--brand-sunset)] text-[var(--brand-sand)] dark:text-[var(--brand-ink)] hover:text-[var(--brand-ink)] text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all uppercase tracking-wide"
                      >
                        {copiedManualCommand ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-[var(--brand-ink)]/50 dark:text-[var(--brand-sand)]/50 mt-3">Outputs: <code className="font-mono bg-[var(--brand-ink)]/10 dark:bg-[var(--brand-sand)]/10 px-2 py-1 rounded">baseline-snapshot.json</code></p>
                  </div>
                </div>

                {/* Option 2: Curl (Recommended) */}
                <div 
                  className="p-8 rounded-2xl border-2 transition-all duration-200 hover:bg-[var(--brand-sand)]/10 dark:hover:bg-white/5 relative overflow-hidden flex flex-col h-full group"
                  style={{
                    borderColor: borderColors.card,
                    backgroundColor: 'transparent',
                  }}
                >
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[var(--brand-sunset)] text-[var(--brand-ink)] uppercase tracking-[0.2em]">
                      Recommended
                    </span>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-bold text-base mb-1 text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">Option 2: One-Line Install</h3>
                    <p className="text-sm text-[var(--brand-ink)]/50 dark:text-[var(--brand-sand)]/50">Copy and paste into terminal</p>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] text-[var(--brand-ink)]/50 dark:text-[var(--brand-sand)]/50 mb-2 uppercase tracking-widest font-bold">Copy this command:</p>
                    <div 
                      className="bg-[var(--brand-ink)] dark:bg-black rounded-xl p-4 relative cursor-pointer hover:ring-2 hover:ring-[var(--brand-sunset)]/50 transition-all"
                      onClick={handleCopyCommand}
                    >
                      <code className="block text-[var(--brand-sunset)] text-xs font-mono break-all pr-12">
                        {curlCommand}
                      </code>
                      <button
                        className="absolute top-3 right-3 bg-[var(--brand-sand)]/10 hover:bg-[var(--brand-sunset)] text-[var(--brand-sand)] hover:text-[var(--brand-ink)] text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all uppercase tracking-wide"
                      >
                        {copiedCommand ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div 
                    className="mt-5 flex items-start gap-2.5 text-xs text-[var(--brand-ink)]/60 dark:text-[var(--brand-sand)]/60 bg-[var(--brand-sand)]/30 dark:bg-[var(--brand-ink)]/30 rounded-xl p-3 border"
                    style={{ borderColor: borderColors.cardInner }}
                  >
                    <Check className="w-4 h-4 text-[var(--brand-sunset)] flex-shrink-0 mt-0.5" />
                    <span>Generates: <code className="font-mono bg-[var(--brand-ink)]/10 dark:bg-[var(--brand-sand)]/10 px-2 py-1 rounded">baseline-snapshot.json</code> and <code className="font-mono bg-[var(--brand-ink)]/10 dark:bg-[var(--brand-sand)]/10 px-2 py-1 rounded">baseline-snapshot.tar.gz</code></span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Step 2: Upload */}
          {currentStep === 2 && (
            <section className="animate-in fade-in duration-500">
              <div className="flex items-start mb-10">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--brand-sunset)] text-[var(--brand-ink)] flex items-center justify-center font-bold mr-5 text-xl shadow-lg">
                  2
                </div>
                <div className="pt-1.5">
                  <h2 className="text-2xl font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)] mb-2 tracking-tight">Upload Your Scan Results</h2>
                  <p className="text-[var(--brand-ink)]/60 dark:text-[var(--brand-sand)]/60 text-base max-w-2xl">After running the script, upload the generated JSON file to analyze your current setup.</p>
                </div>
              </div>

              <div className="ml-0 md:ml-17">
                <div 
                  className={`flex flex-col items-center justify-center w-full h-72 border-2 rounded-2xl transition-all group relative overflow-hidden ${
                    scanData
                      ? 'border-solid bg-[var(--brand-sunset)]/10 shadow-lg'
                      : 'border-dashed bg-[var(--brand-sand)]/20 dark:bg-[var(--brand-ink)]/20 hover:bg-[var(--brand-sand)]/40 dark:hover:bg-[var(--brand-ink)]/40 hover:border-[var(--brand-sunset)]/50 cursor-pointer hover:shadow-xl'
                  }`}
                  style={{ borderColor: scanData ? 'var(--brand-sunset)' : borderColors.card }}
                    onClick={() => {
                      if (!scanData) {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                  {!scanData ? (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center transition-opacity duration-300 w-full h-full">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--brand-dunes)]/40 dark:bg-[var(--brand-sand)]/10 group-hover:bg-[var(--brand-sunset)]/20 dark:group-hover:bg-[var(--brand-sunset)]/20 flex items-center justify-center mb-4 transition-all">
                        <Upload className="w-7 h-7 text-[var(--brand-ink)]/40 dark:text-[var(--brand-sand)]/40 group-hover:text-[var(--brand-sunset)] transition-colors" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">Click to upload</h3>
                      <p className="text-sm text-[var(--brand-ink)]/50 dark:text-[var(--brand-sand)]/50 mb-2">or drag and drop</p>
                      <p className="text-xs text-[var(--brand-ink)]/40 dark:text-[var(--brand-sand)]/40">
                        <code className="font-mono bg-[var(--brand-ink)]/10 dark:bg-[var(--brand-sand)]/10 px-3 py-1 rounded-lg">baseline-snapshot.json</code>
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--brand-sunset)]/20 flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-[var(--brand-sunset)]" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">File Uploaded Successfully</h3>
                      <p className="text-sm text-[var(--brand-ink)]/60 dark:text-[var(--brand-sand)]/60 mb-4">
                        <code className="font-mono bg-[var(--brand-ink)]/10 dark:bg-[var(--brand-sand)]/10 px-3 py-1.5 rounded-lg">{fileName}</code>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-xs"
                      >
                        Upload Different File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Step 3: Analyze & Generate */}
          {currentStep === 3 && (
            <section className="animate-in fade-in duration-500 pb-6">
              <div className="flex items-start mb-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--brand-sunset)] text-[var(--brand-ink)] flex items-center justify-center font-bold mr-5 text-xl shadow-lg">
                  3
                </div>
                <div className="pt-1.5">
                  <h2 className="text-2xl font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-sand)] mb-2 tracking-tight">Setup Script Preview</h2>
                  <p className="text-[var(--brand-ink)]/60 dark:text-[var(--brand-sand)]/60 text-base max-w-2xl">Your custom setup script is ready. Review what will be installed on your new Mac.</p>
                </div>
              </div>

              <div className="ml-0 md:ml-17 space-y-5">
                {parsedData ? (
                  <>
                    {/* Combined Stats and Configuration - Side by Side */}
                    <div className="grid md:grid-cols-[200px_1fr] gap-5">
                      {/* Stats - Compact Vertical */}
                      <div className="space-y-3">
                        <div 
                          className="bg-[var(--brand-sand)]/20 dark:bg-[var(--brand-ink)]/20 rounded-xl p-4 border"
                          style={{ borderColor: borderColors.card }}
                        >
                          <div className="text-2xl font-bold mb-1 text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">
                            {(parsedData.package_managers.homebrew?.formulae?.length || 0) + 
                             (parsedData.package_managers.homebrew?.casks?.length || 0)}
                          </div>
                          <div className="text-[10px] text-[var(--brand-ink)]/60 dark:text-[var(--brand-sand)]/60 uppercase tracking-wider font-semibold">Packages</div>
                        </div>
                        <div 
                          className="bg-[var(--brand-sand)]/20 dark:bg-[var(--brand-ink)]/20 rounded-xl p-4 border"
                          style={{ borderColor: borderColors.card }}
                        >
                          <div className="text-2xl font-bold mb-1 text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">
                            {parsedData.development.vscode?.extensions?.length || 0}
                          </div>
                          <div className="text-[10px] text-[var(--brand-ink)]/60 dark:text-[var(--brand-sand)]/60 uppercase tracking-wider font-semibold">Extensions</div>
                        </div>
                        <div 
                          className="bg-[var(--brand-sand)]/20 dark:bg-[var(--brand-ink)]/20 rounded-xl p-4 border"
                          style={{ borderColor: borderColors.card }}
                        >
                          <div className="text-2xl font-bold mb-1 text-[var(--brand-ink)] dark:text-[var(--brand-sand)]">
                            {parsedData.applications?.length || 0}
                          </div>
                          <div className="text-[10px] text-[var(--brand-ink)]/60 dark:text-[var(--brand-sand)]/60 uppercase tracking-wider font-semibold">Applications</div>
                        </div>
                      </div>

                      {/* Detected Configuration */}
                      <div 
                        className="bg-[var(--brand-sand)]/20 dark:bg-[var(--brand-ink)]/20 rounded-xl p-5 border"
                        style={{ borderColor: borderColors.card }}
                      >
                        <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-[var(--brand-ink)]/70 dark:text-[var(--brand-sand)]/70">Detected Configuration</h4>
                        <div className="space-y-3">
                          {/* Homebrew Section */}
                          {parsedData.package_managers.homebrew && (
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-bold uppercase tracking-wider text-[var(--brand-sunset)] min-w-[100px]">Homebrew</span>
                              <div className="flex items-center gap-4 text-[var(--brand-ink)]/70 dark:text-[var(--brand-sand)]/70">
                                {parsedData.package_managers.homebrew.formulae?.length > 0 && (
                                  <span>{parsedData.package_managers.homebrew.formulae.length} formulae</span>
                                )}
                                {parsedData.package_managers.homebrew.casks?.length > 0 && (
                                  <span>{parsedData.package_managers.homebrew.casks.length} applications</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* VS Code Section */}
                          {parsedData.development.vscode?.extensions?.length > 0 && (
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-bold uppercase tracking-wider text-[var(--brand-sunset)] min-w-[100px]">VS Code</span>
                              <span className="text-[var(--brand-ink)]/70 dark:text-[var(--brand-sand)]/70">{parsedData.development.vscode.extensions.length} extensions</span>
                            </div>
                          )}

                          {/* Languages Section */}
                          {(parsedData.languages.node?.global_packages?.length > 0 || 
                            parsedData.languages.python?.pip_packages?.length > 0) && (
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-bold uppercase tracking-wider text-[var(--brand-sunset)] min-w-[100px]">Languages</span>
                              <div className="flex items-center gap-4 text-[var(--brand-ink)]/70 dark:text-[var(--brand-sand)]/70">
                                {parsedData.languages.node?.global_packages?.length > 0 && (
                                  <span>Node.js packages</span>
                                )}
                                {parsedData.languages.python?.pip_packages?.length > 0 && (
                                  <span>Python packages</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Git Section */}
                          {parsedData.development.git?.global_config && (
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-bold uppercase tracking-wider text-[var(--brand-sunset)] min-w-[100px]">Git</span>
                              <span className="text-[var(--brand-ink)]/70 dark:text-[var(--brand-sand)]/70">Global configuration</span>
                            </div>
                          )}

                          {/* Shell Section */}
                          {Object.keys(parsedData.terminal.shell_configs || {}).length > 0 && (
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-bold uppercase tracking-wider text-[var(--brand-sunset)] min-w-[100px]">Shell</span>
                              <div className="flex items-center gap-4 text-[var(--brand-ink)]/70 dark:text-[var(--brand-sand)]/70">
                                {Object.keys(parsedData.terminal.shell_configs).map((shell, index) => (
                                  <span key={shell}>{shell}{index < Object.keys(parsedData.terminal.shell_configs).length - 1 ? ',' : ''}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terminal Preview - Refined */}
                    <div 
                      className="bg-[var(--brand-ink)] dark:bg-black rounded-xl p-4 border"
                      style={{ borderColor: borderColors.card }}
                    >
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b" style={{ borderColor: borderColors.cardInner }}>
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="ml-2 text-xs text-[var(--brand-sand)] font-mono">baseline-setup.sh</span>
                      </div>
                      <div className="font-mono text-sm space-y-1.5">
                        <div className="text-[var(--brand-sunset)]">$ chmod +x baseline-setup.sh</div>
                        <div className="text-[var(--brand-sunset)]">$ ./baseline-setup.sh</div>
                        <div className="text-[var(--brand-sand)]/70"># Installing all your tools...</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Empty State - Compact Side by Side */}
                    <div className="grid md:grid-cols-[200px_1fr] gap-5">
                      {/* Stats - Compact Vertical */}
                      <div className="space-y-3">
                        <div 
                          className="bg-[var(--brand-sand)]/20 dark:bg-[var(--brand-ink)]/20 rounded-xl p-4 border"
                          style={{ borderColor: borderColors.card }}
                        >
                          <div className="text-2xl font-bold mb-1 text-[var(--brand-ink)]/30 dark:text-[var(--brand-sand)]/30">—</div>
                          <div className="text-[10px] text-[var(--brand-ink)]/40 dark:text-[var(--brand-sand)]/40 uppercase tracking-wider font-semibold">Packages</div>
                        </div>
                        <div 
                          className="bg-[var(--brand-sand)]/20 dark:bg-[var(--brand-ink)]/20 rounded-xl p-4 border"
                          style={{ borderColor: borderColors.card }}
                        >
                          <div className="text-2xl font-bold mb-1 text-[var(--brand-ink)]/30 dark:text-[var(--brand-sand)]/30">—</div>
                          <div className="text-[10px] text-[var(--brand-ink)]/40 dark:text-[var(--brand-sand)]/40 uppercase tracking-wider font-semibold">Extensions</div>
                        </div>
                        <div 
                          className="bg-[var(--brand-sand)]/20 dark:bg-[var(--brand-ink)]/20 rounded-xl p-4 border"
                          style={{ borderColor: borderColors.card }}
                        >
                          <div className="text-2xl font-bold mb-1 text-[var(--brand-ink)]/30 dark:text-[var(--brand-sand)]/30">—</div>
                          <div className="text-[10px] text-[var(--brand-ink)]/40 dark:text-[var(--brand-sand)]/40 uppercase tracking-wider font-semibold">Applications</div>
                        </div>
                      </div>

                      {/* Empty Configuration */}
                      <div 
                        className="bg-[var(--brand-sand)]/20 dark:bg-[var(--brand-ink)]/20 rounded-xl p-5 border flex items-center justify-center"
                        style={{ borderColor: borderColors.card }}
                      >
                        <p className="text-sm text-[var(--brand-ink)]/50 dark:text-[var(--brand-sand)]/50">Upload a scan file to see detected configuration</p>
                      </div>
                    </div>

                    {/* Empty Terminal Preview */}
                    <div 
                      className="bg-[var(--brand-ink)] dark:bg-black rounded-xl p-4 border"
                      style={{ borderColor: borderColors.card }}
                    >
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b" style={{ borderColor: borderColors.cardInner }}>
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="ml-2 text-xs text-[var(--brand-sand)] font-mono">baseline-setup.sh</span>
                      </div>
                      <div className="font-mono text-sm space-y-1.5">
                        <div className="text-[var(--brand-sunset)]">$ chmod +x baseline-setup.sh</div>
                        <div className="text-[var(--brand-sunset)]">$ ./baseline-setup.sh</div>
                        <div className="text-[var(--brand-sand)]/70"># Installing all your tools...</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
            )}

        </div>
      </div>

      {/* Floating Footer Navigation Bar */}
      <FloatingFooter
        statusLabel={footerStatus.label}
        statusText={footerStatus.text}
        showBackButton={true}
        backButtonText={currentStep === 1 ? 'Back to Home' : 'Back'}
        onBack={handleBack}
        primaryButtonText={getPrimaryButtonText()}
        primaryButtonIcon={getPrimaryButtonIcon()}
        onPrimaryAction={handleNext}
        primaryButtonDisabled={(currentStep === 2 || currentStep === 3) && !scanData.trim()}
        primaryShortcut={currentStep === 3 ? 'Enter' : undefined}
        showThemeToggle={true}
        showKeyboardShortcuts={true}
      />
    </PageLayout>
  );
};

export default ExportSetup;
