import { Download, Terminal, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { generateScanScript } from '@/utils/scanScriptGenerator';
import { motion } from 'framer-motion';

const ExportSetup = () => {
  const navigate = useNavigate();

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-20" />
      
      <div className="container mx-auto px-4 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>

          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-5xl font-bold mb-4 gradient-text"
            >
              Export Your Current Setup
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-muted-foreground"
            >
              Clone your Mac in 2 minutes and replicate it anywhere
            </motion.p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="group p-8 hover-lift border-2 bg-card/50 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white font-bold text-2xl shadow-lg">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Download the Scanner Script</h3>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      Download our scanning script that will automatically detect all your installed tools, apps, and configurations.
                    </p>
                    <Button 
                      onClick={handleDownloadScript} 
                      className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download scan-mac.sh
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="group p-8 hover-lift border-2 bg-card/50 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white font-bold text-2xl shadow-lg">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Run the Script on Your Mac</h3>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      Open Terminal and run the script. It will scan your system and create a complete inventory.
                    </p>
                    <div className="glass-card rounded-xl p-6 font-mono text-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Terminal className="h-5 w-5 text-primary" />
                        <span className="text-muted-foreground font-semibold">Terminal</span>
                      </div>
                      <code className="text-foreground block">
                        <div className="text-green-500">$</div> chmod +x scan-mac.sh<br />
                        <div className="text-green-500">$</div> ./scan-mac.sh
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Creates a <code className="bg-muted px-2 py-1 rounded font-mono">my-mac-setup.tar.gz</code> file
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="group p-8 hover-lift border-2 bg-card/50 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white font-bold text-2xl shadow-lg">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Upload & Generate Your Setup Script</h3>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      Upload the generated file and we'll create a custom installation script for your new Mac.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/upload-scan')}
                      size="lg"
                      className="border-2 hover:border-primary/50 hover:bg-secondary/50"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Upload Scan Results
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <Card className="p-8 glass-card">
              <p className="text-muted-foreground leading-relaxed">
                🔒 <strong>100% Safe</strong> — The scanner only reads data, never modifies your system. Open-source and transparent.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExportSetup;
