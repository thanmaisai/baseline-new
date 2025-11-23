import { useState, useRef } from 'react';
import { Download, Upload, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { generateScanScript } from '@/utils/scanScriptGenerator';
import { generateSetupFromScan } from '@/utils/scanParser';
import { FloatingFooter } from '@/components/FloatingFooter';
import { toast } from 'sonner';

const ExportSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedManualCommand, setCopiedManualCommand] = useState(false);
  const [scanData, setScanData] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const curlCommand = `curl -fsSL https://raw.githubusercontent.com/yourusername/mac-setup-genie/main/scripts/scan-mac.sh | bash`;
  const manualCommand = `chmod +x scan-mac.sh && ./scan-mac.sh`;
  
  const handleDownloadScript = () => {
    const script = generateScanScript();
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scan-mac.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Script downloaded!', {
      description: 'Run it in your terminal to scan your Mac'
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
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setScanData(content);
        setFileName(file.name);
        toast.success('File uploaded!');
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateScript = () => {
    if (!scanData.trim()) {
      toast.error('No scan data found');
      return;
    }
    
    const setupScript = generateSetupFromScan(scanData);
    
    const blob = new Blob([setupScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup-new-mac.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('🎉 Setup script downloaded!');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerateScript();
    }
  };

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
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Main Content Card */}
      <main className="w-full max-w-[1200px] h-[85vh] bg-white border border-gray-100 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] flex flex-col relative overflow-hidden z-10">
        
        {/* Header */}
        <header className="flex-shrink-0 px-8 py-8 border-b border-gray-50 flex flex-col justify-center">
          {/* Back to Home Link */}
          <div className="mb-6">
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider group"
            >
              <ArrowLeft className="mr-1 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Clone your Mac</h1>
              <p className="text-gray-500 font-light text-lg">Export your current setup and replicate it anywhere.</p>
            </div>
            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center space-x-3 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              <button
                onClick={() => setCurrentStep(1)}
                className={`transition-all ${
                  currentStep === 1
                    ? 'text-gray-900 font-bold'
                    : currentStep > 1
                    ? 'text-gray-900 opacity-40 line-through hover:opacity-70 hover:no-underline cursor-pointer'
                    : 'text-gray-400'
                }`}
              >
                Scanner
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => currentStep > 1 && setCurrentStep(2)}
                className={`transition-all ${
                  currentStep === 2
                    ? 'text-gray-900 font-bold'
                    : currentStep > 2
                    ? 'text-gray-900 opacity-40 line-through hover:opacity-70 hover:no-underline cursor-pointer'
                    : 'text-gray-400'
                }`}
              >
                Upload
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => currentStep > 2 && setCurrentStep(3)}
                className={`transition-all ${
                  currentStep === 3
                    ? 'text-gray-900 font-bold'
                    : 'text-gray-400'
                }`}
              >
                Generate
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-5xl mx-auto w-full">

            {/* Step 1: Download Scanner */}
            {currentStep === 1 && (
              <section className="animate-in fade-in duration-400">
                <div className="flex items-start mb-10">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold mr-6 text-xl shadow-lg">
                    1
                  </div>
                  <div className="pt-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Download the Scanner Script</h2>
                    <p className="text-gray-500 text-base">Get our scanner that detects all your installed tools, apps, and configurations. Safe, read-only, and open-source.</p>
                  </div>
                </div>

                <div className="ml-0 md:ml-16 grid md:grid-cols-2 gap-8">
                  {/* Option 1: Manual */}
                  <div className="p-8 rounded-3xl border border-gray-200 bg-white hover:border-gray-300 transition-all hover:shadow-xl hover:shadow-gray-100/50 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-base mb-1">Option 1: Manual</h3>
                        <p className="text-sm text-gray-500">Download and run manually</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleDownloadScript}
                      className="w-full mb-4 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download scan-mac.sh
                    </Button>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Then run in terminal:</p>
                      <div 
                        className="bg-gray-50 rounded-lg px-3 py-2 relative group cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={handleCopyManualCommand}
                      >
                        <code className="block text-xs font-mono text-gray-700 pr-16">
                          {manualCommand}
                        </code>
                        <button
                          className="absolute top-1/2 -translate-y-1/2 right-2 bg-gray-200 hover:bg-gray-900 hover:text-white text-gray-700 text-[10px] font-bold px-2 py-1 rounded transition-all uppercase tracking-wide"
                        >
                          {copiedManualCommand ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Curl (Recommended) */}
                  <div className="p-8 rounded-3xl border-2 border-blue-50 bg-blue-50/20 relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-4 right-4">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-500 text-white uppercase tracking-wider">
                        Recommended
                      </span>
                    </div>
                    <div className="mb-6">
                      <h3 className="font-bold text-base mb-1">Option 2: One-Line Install</h3>
                      <p className="text-sm text-gray-500">Copy and paste into terminal</p>
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Copy this command:</p>
                      <div 
                        className="bg-gray-900 rounded-xl p-4 relative group cursor-pointer"
                        onClick={handleCopyCommand}
                      >
                        <code className="block text-green-400 text-xs font-mono break-all pr-12">
                          {curlCommand}
                        </code>
                        <button
                          className="absolute top-2 right-2 bg-gray-800/90 hover:bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all uppercase tracking-wide"
                        >
                          {copiedCommand ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 flex items-start gap-2 text-xs text-gray-600 bg-white/50 rounded-lg p-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Generates output file: <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">mac-setup-scan.json</code></span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Step 2: Upload */}
            {currentStep === 2 && (
              <section className="animate-in fade-in duration-400">
                <div className="flex items-start mb-10">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold mr-6 text-xl shadow-lg">
                    2
                  </div>
                  <div className="pt-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Scan Results</h2>
                    <p className="text-gray-500 text-base">After running the script, upload the generated JSON file or paste its contents below.</p>
                  </div>
                </div>

                <div className="ml-0 md:ml-16">
                  <label 
                    className={`flex flex-col items-center justify-center w-full h-80 border-2 rounded-3xl cursor-pointer transition-all group relative overflow-hidden ${
                      scanData
                        ? 'border-solid border-green-500 bg-green-50/10'
                        : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400'
                    }`}
                    onClick={() => !scanData && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {!scanData ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-gray-200 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900">Click to upload</h3>
                        <p className="text-sm text-gray-500 mb-1">or drag and drop</p>
                        <p className="text-xs text-gray-400">
                          <code className="font-mono bg-gray-100 px-2 py-0.5 rounded">mac-setup-scan.json</code>
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                          <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900">File Uploaded Successfully</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          <code className="font-mono bg-gray-100 px-2 py-1 rounded">{fileName}</code>
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setScanData('');
                            setFileName('');
                            toast.info('Upload cleared');
                          }}
                          className="text-xs"
                        >
                          Upload Different File
                        </Button>
                      </div>
                    )}
                  </label>
                </div>
              </section>
            )}

            {/* Step 3: Analyze & Generate */}
            {currentStep === 3 && (
              <section className="animate-in fade-in duration-400 pb-20">
                <div className="flex items-start mb-10">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold mr-6 text-xl shadow-lg">
                    3
                  </div>
                  <div className="pt-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyze & Generate Setup Script</h2>
                    <p className="text-gray-500 text-base">We'll analyze your scan and create a custom installation script for your new Mac.</p>
                  </div>
                </div>

                <div className="ml-0 md:ml-16 bg-gray-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden ring-1 ring-gray-900/5">
                  {/* Decorative gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-6">Setup Script Preview</h3>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                        <div className="text-3xl font-bold mb-1">
                          {scanData.split('\n').filter(line => line.includes('brew')).length || '—'}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Packages</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                        <div className="text-3xl font-bold mb-1">
                          {Math.ceil((scanData.split('\n').length || 0) / 50)}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Est. Minutes</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                        <div className="text-3xl font-bold mb-1 text-green-400">100%</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Automated</div>
                      </div>
                    </div>

                    {/* What's Included */}
                    <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                      <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-gray-300">What We'll Include:</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                          'Homebrew packages',
                          'Applications (casks)',
                          'Node.js versions',
                          'Python versions',
                          'VS Code extensions',
                          'Git configuration',
                          'Shell configuration',
                          'npm global packages',
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                            <span className="text-gray-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Terminal Preview */}
                    <div className="mt-6 bg-black/40 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-2 text-xs text-gray-400 font-mono">setup-new-mac.sh</span>
                      </div>
                      <div className="font-mono text-xs text-green-400 space-y-1">
                        <div>$ chmod +x setup-new-mac.sh</div>
                        <div>$ ./setup-new-mac.sh</div>
                        <div className="text-gray-500"># Installing all your tools...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </main>

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
        primaryButtonDisabled={currentStep === 2 && !scanData.trim()}
      />
    </div>
  );
};

export default ExportSetup;
