import { Download, Terminal, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { generateScanScript } from '@/utils/scanScriptGenerator';

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
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Export Your Current Mac Setup</h1>
            <p className="text-lg text-muted-foreground">
              Scan your current Mac in 2 minutes and generate a perfect clone script for your new machine
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Download the Scanner Script</h3>
                  <p className="text-muted-foreground mb-4">
                    Download our scanning script that will automatically detect all your installed tools, apps, configurations, and settings.
                  </p>
                  <Button onClick={handleDownloadScript} className="bg-gradient-primary hover:opacity-90">
                    <Download className="mr-2 h-4 w-4" />
                    Download scan-mac.sh
                  </Button>
                </div>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Run the Script on Your Mac</h3>
                  <p className="text-muted-foreground mb-4">
                    Open Terminal and run the script. It will scan your system and create a complete inventory.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Terminal</span>
                    </div>
                    <code className="text-foreground">
                      chmod +x scan-mac.sh<br />
                      ./scan-mac.sh
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    The script will create a <code className="bg-muted px-2 py-1 rounded">my-mac-setup.tar.gz</code> file with all your setup data.
                  </p>
                </div>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Upload & Generate Your Setup Script</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload the generated file and we'll create a custom installation script for your new Mac.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/upload-scan')}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Upload Scan Results
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              The scanner is safe, open-source, and only reads data — it never modifies your system.
            </p>
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSetup;
