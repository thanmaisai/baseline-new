import { useState } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { generateSetupFromScan } from '@/utils/scanParser';

const UploadScan = () => {
  const navigate = useNavigate();
  const [scanData, setScanData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateScript = () => {
    if (!scanData.trim()) return;
    
    setIsProcessing(true);
    
    // Generate the setup script from scan data
    const setupScript = generateSetupFromScan(scanData);
    
    // Download the script
    const blob = new Blob([setupScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup-new-mac.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Upload Your Mac Scan</h1>
            <p className="text-lg text-muted-foreground">
              Paste the contents of your scan results to generate your setup script
            </p>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Paste Scan Results
                </label>
                <Textarea
                  placeholder="Paste the contents of your scan output here..."
                  className="min-h-[400px] font-mono text-sm"
                  value={scanData}
                  onChange={(e) => setScanData(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Or extract and paste the contents from <code className="bg-muted px-2 py-1 rounded">my-mac-setup.tar.gz</code>
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleGenerateScript}
                  disabled={!scanData.trim() || isProcessing}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {isProcessing ? 'Generating...' : 'Generate Setup Script'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/export-setup')}
                >
                  Back
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8">
            <Card className="p-6 bg-muted/50">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• We'll parse your scan data to identify all installed tools and configurations</li>
                <li>• Generate a custom <code className="bg-background px-2 py-1 rounded">setup-new-mac.sh</code> script</li>
                <li>• Run the script on your new Mac to replicate your exact setup</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadScan;
