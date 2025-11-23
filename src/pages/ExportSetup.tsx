import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Upload, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { generateScanScript } from '@/utils/scanScriptGenerator';
import { generateSetupFromScan, parseBaselineJSON } from '@/utils/scanParser';
import { FloatingFooter } from '@/components/FloatingFooter';
import { PageLayout } from '@/components/PageLayout';
import { toast } from 'sonner';

const ExportSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedManualCommand, setCopiedManualCommand] = useState(false);
  const [scanData, setScanData] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const curlCommand = `curl -fsSL https://raw.githubusercontent.com/thanmaisai/mac-setup-genie/main/public/baseline-scan.sh | bash`;
  const manualCommand = `chmod +x baseline-scanner.sh && ./baseline-scanner.sh`;

  const handleDownloadScript = () => {
    // Download the baseline script from public folder
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
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Size:', file.size);

    const reader = new FileReader();

    reader.onerror = () => {
      console.error('FileReader error:', reader.error);
      toast.error('Failed to read file', {
        description: 'Please try again'
      });
    };

    reader.onload = (e) => {
      const content = e.target?.result as string;

      if (!content) {
        console.error('No content read from file');
        toast.error('File appears to be empty');
        return;
      }

      console.log('File content length:', content.length);

      // Set the scan data immediately
      setScanData(content);
      setFileName(file.name);

      // Try to parse as JSON
      const parsed = parseBaselineJSON(content);
      if (parsed) {
        console.log('JSON parsed successfully:', {
          formulae: parsed.package_managers.homebrew?.formulae.length || 0,
          casks: parsed.package_managers.homebrew?.casks.length || 0,
          apps: parsed.applications.length
        });
        setParsedData(parsed);
        toast.success('Snapshot loaded!', {
          description: `Found ${parsed.package_managers.homebrew?.formulae.length || 0} packages and ${parsed.applications.length} apps`
        });
      } else {
        console.warn('Failed to parse JSON, treating as plain text');
        setParsedData(null);
        toast.success('File uploaded!');
      }
    };

    reader.readAsText(file);

    // Reset the input value so the same file can be uploaded again
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
      console.error('Error generating script:', error);
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+ArrowLeft for back
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }
      // CMD+ArrowRight for next
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack, handleNext]);

  const getFooterStatus = () => {
    switch (currentStep) {
      case 1:
        return { label: 'CURRENT STATUS', text: 'Scanner Download' };
      case 2:
        return { label: 'CURRENT STATUS', text: scanData ? 'Scan Ready' : 'Waiting for Upload...' };
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
      <header className="flex-shrink-0 px-6 py-6 border-b border-gray-50 dark:border-[#262626] flex flex-col justify-center">
        {/* Back to Home Link */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-xs font-bold text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wider group"
          >
            <ArrowLeft className="mr-1 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">Clone your Mac</h1>
            <p className="text-gray-500 dark:text-gray-400 font-light text-sm">Export your current setup and replicate it anywhere.</p>
          </div>
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center space-x-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            <button
              onClick={() => setCurrentStep(1)}
              className={`transition-all ${currentStep === 1
                  ? 'text-gray-900 dark:text-white font-bold'
                  : currentStep > 1
                    ? 'text-gray-900 dark:text-white opacity-40 line-through hover:opacity-70 hover:no-underline cursor-pointer'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
            >
              Scanner
            </button>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <button
              onClick={() => currentStep > 1 && setCurrentStep(2)}
              className={`transition-all ${currentStep === 2
                  ? 'text-gray-900 dark:text-white font-bold'
                  : currentStep > 2
                    ? 'text-gray-900 dark:text-white opacity-40 line-through hover:opacity-70 hover:no-underline cursor-pointer'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
            >
              Upload
            </button>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <button
              onClick={() => currentStep > 2 && setCurrentStep(3)}
              className={`transition-all ${currentStep === 3
                  ? 'text-gray-900 dark:text-white font-bold'
                  : 'text-gray-400 dark:text-gray-500'
                }`}
            >
              Generate
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto p-6 md:p-8 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto w-full">

          {/* Step 1: Download Scanner */}
          {currentStep === 1 && (
            <section className="animate-in fade-in duration-400">
              <div className="flex items-start mb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold mr-4 text-lg shadow-lg">
                  1
                </div>
                <div className="pt-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Download the Scanner Script</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Get our scanner that detects all your installed tools, apps, and configurations. Safe, read-only, and open-source.</p>
                </div>
              </div>

              <div className="ml-0 md:ml-14 grid md:grid-cols-2 gap-6">
                {/* Option 1: Manual */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#111111] hover:border-gray-300 dark:hover:border-[#404040] transition-all hover:shadow-xl hover:shadow-gray-100/50 dark:hover:shadow-black/50 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm mb-1">Option 1: Manual</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Download and run manually</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDownloadScript}
                    className="w-full mb-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-medium"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download baseline-scanner.sh
                  </Button>
                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-[#262626]">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">Then run in terminal:</p>
                    <div
                      className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg px-3 py-2 relative group cursor-pointer hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
                      onClick={handleCopyManualCommand}
                    >
                      <code className="block text-xs font-mono text-gray-700 dark:text-gray-300 pr-14">
                        {manualCommand}
                      </code>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-2 bg-gray-200 dark:bg-[#262626] hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black text-gray-700 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded transition-all uppercase tracking-wide"
                      >
                        {copiedManualCommand ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">Outputs: <code className="font-mono bg-gray-100 dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded">baseline-snapshot.json</code></p>
                  </div>
                </div>

                {/* Option 2: Curl (Recommended) */}
                <div className="p-6 rounded-xl border-2 border-blue-50 dark:border-blue-950/30 bg-blue-50/20 dark:bg-blue-950/20 relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500 dark:bg-blue-600 text-white uppercase tracking-wider">
                      Recommended
                    </span>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-bold text-sm mb-1">Option 2: One-Line Install</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Copy and paste into terminal</p>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">Copy this command:</p>
                    <div
                      className="bg-gray-900 dark:bg-black rounded-lg p-3 relative group cursor-pointer"
                      onClick={handleCopyCommand}
                    >
                      <code className="block text-green-400 text-xs font-mono break-all pr-10">
                        {curlCommand}
                      </code>
                      <button
                        className="absolute top-2 right-2 bg-gray-800/90 dark:bg-[#1A1A1A] hover:bg-green-600 dark:hover:bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-all uppercase tracking-wide"
                      >
                        {copiedCommand ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-[#1A1A1A]/50 rounded-lg p-2.5">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Generates: <code className="font-mono bg-gray-100 dark:bg-[#0A0A0A] px-1.5 py-0.5 rounded">baseline-snapshot.json</code> and <code className="font-mono bg-gray-100 dark:bg-[#0A0A0A] px-1.5 py-0.5 rounded">baseline-snapshot.tar.gz</code></span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Step 2: Upload */}
          {currentStep === 2 && (
            <section className="animate-in fade-in duration-400">
              <div className="flex items-start mb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold mr-4 text-lg shadow-lg">
                  2
                </div>
                <div className="pt-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Upload Your Scan Results</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">After running the script, upload the generated JSON file or paste its contents below.</p>
                </div>
              </div>

              <div className="ml-0 md:ml-14">
                <div
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 rounded-xl transition-all group relative overflow-hidden ${scanData
                      ? 'border-solid border-green-500 dark:border-green-600 bg-green-50/10 dark:bg-green-950/20'
                      : 'border-dashed border-gray-300 dark:border-[#262626] bg-gray-50 dark:bg-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-[#111111] hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer'
                    }`}
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
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#1A1A1A] group-hover:bg-blue-100 dark:group-hover:bg-blue-950/30 flex items-center justify-center mb-3 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                      <h3 className="font-bold text-base mb-1.5 text-gray-900 dark:text-white">Click to upload</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">or drag and drop</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        <code className="font-mono bg-gray-100 dark:bg-[#1A1A1A] px-2 py-0.5 rounded">baseline-snapshot.json</code>
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mb-3">
                        <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-bold text-base mb-1.5 text-gray-900 dark:text-white">File Uploaded Successfully</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <code className="font-mono bg-gray-100 dark:bg-[#1A1A1A] px-2 py-1 rounded">{fileName}</code>
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
            <section className="animate-in fade-in duration-400 pb-12">
              <div className="flex items-start mb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold mr-4 text-lg shadow-lg">
                  3
                </div>
                <div className="pt-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Analyze & Generate Setup Script</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">We'll analyze your scan and create a custom installation script for your new Mac.</p>
                </div>
              </div>

              <div className="ml-0 md:ml-14 bg-gray-900 dark:bg-black rounded-xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />

                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-4">Setup Script Preview</h3>

                  {/* Stats Grid */}
                  {parsedData ? (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                          <div className="text-2xl font-bold mb-1">
                            {(parsedData.package_managers.homebrew?.formulae?.length || 0) +
                              (parsedData.package_managers.homebrew?.casks?.length || 0)}
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Packages</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                          <div className="text-2xl font-bold mb-1">
                            {parsedData.development.vscode?.extensions?.length || 0}
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider">VS Code Ext.</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                          <div className="text-2xl font-bold mb-1 text-green-400">100%</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Automated</div>
                        </div>
                      </div>

                      {/* What's Included - Dynamic from JSON */}
                      <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10 mb-4">
                        <h4 className="font-bold text-xs mb-3 uppercase tracking-wider text-gray-300">Detected Configuration:</h4>
                        <div className="space-y-3">
                          {/* Homebrew Section */}
                          {parsedData.package_managers.homebrew && (
                            <div>
                              <div className="text-xs text-blue-400 font-bold mb-2">📦 HOMEBREW</div>
                              <div className="grid grid-cols-2 gap-3 text-sm ml-4">
                                {parsedData.package_managers.homebrew.formulae?.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                    <span className="text-gray-300">{parsedData.package_managers.homebrew.formulae.length} formulae</span>
                                  </div>
                                )}
                                {parsedData.package_managers.homebrew.casks?.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                    <span className="text-gray-300">{parsedData.package_managers.homebrew.casks.length} applications</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* VS Code Section */}
                          {parsedData.development.vscode?.extensions?.length > 0 && (
                            <div>
                              <div className="text-xs text-purple-400 font-bold mb-2">💻 VS CODE</div>
                              <div className="text-sm ml-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                  <span className="text-gray-300">{parsedData.development.vscode.extensions.length} extensions</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Languages Section */}
                          {(parsedData.languages.node?.global_packages?.length > 0 ||
                            parsedData.languages.python?.pip_packages?.length > 0) && (
                              <div>
                                <div className="text-xs text-yellow-400 font-bold mb-2">🔧 LANGUAGES</div>
                                <div className="grid grid-cols-2 gap-3 text-sm ml-4">
                                  {parsedData.languages.node?.global_packages?.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                      <span className="text-gray-300">Node.js packages</span>
                                    </div>
                                  )}
                                  {parsedData.languages.python?.pip_packages?.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                      <span className="text-gray-300">Python packages</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Git Section */}
                          {parsedData.development.git?.global_config && (
                            <div>
                              <div className="text-xs text-orange-400 font-bold mb-2">🔗 GIT</div>
                              <div className="text-sm ml-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                  <span className="text-gray-300">Global configuration</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Shell Section */}
                          {Object.keys(parsedData.terminal.shell_configs || {}).length > 0 && (
                            <div>
                              <div className="text-xs text-cyan-400 font-bold mb-2">⚡ SHELL</div>
                              <div className="text-sm ml-4">
                                {Object.keys(parsedData.terminal.shell_configs).map(shell => (
                                  <div key={shell} className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                    <span className="text-gray-300">{shell}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                        <div className="text-2xl font-bold mb-1">—</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Packages</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                        <div className="text-2xl font-bold mb-1">—</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Est. Minutes</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                        <div className="text-2xl font-bold mb-1 text-green-400">100%</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Automated</div>
                      </div>
                    </div>
                  )}

                  {/* Terminal Preview */}
                  <div className="mt-4 bg-black/40 dark:bg-black/60 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      <span className="ml-2 text-[10px] text-gray-400 font-mono">baseline-setup.sh</span>
                    </div>
                    <div className="font-mono text-xs text-green-400 space-y-0.5">
                      <div>$ chmod +x baseline-setup.sh</div>
                      <div>$ ./baseline-setup.sh</div>
                      <div className="text-gray-500"># Installing all your tools...</div>
                    </div>
                  </div>
                </div>
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
        showThemeToggle={true}
        showKeyboardShortcuts={true}
      />
    </PageLayout>
  );
};

export default ExportSetup;
