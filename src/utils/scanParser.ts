export const generateSetupFromScan = (scanData: string): string => {
  const sections = parseScanData(scanData);
  
  let script = `#!/bin/bash

# macOS Development Environment Setup Script
# Generated from Mac Scan by DevEnv Setup Tool
# Date: ${new Date().toISOString().split('T')[0]}

set -e

echo "🚀 Setting up your new Mac based on scanned configuration..."
echo ""

# Check if running on macOS
if [[ ! "$OSTYPE" == "darwin"* ]]; then
  echo "❌ This script is designed for macOS only."
  exit 1
fi

# Install Homebrew if not present
if ! command -v brew &> /dev/null; then
  echo "📦 Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  
  # Add Homebrew to PATH
  if [[ $(uname -m) == 'arm64' ]]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
  else
    echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/usr/local/bin/brew shellenv)"
  fi
else
  echo "✅ Homebrew already installed"
fi

echo ""
`;

  // Install Homebrew taps
  if (sections.taps && sections.taps.length > 0) {
    script += `# Add Homebrew taps\n`;
    script += `echo "📦 Adding Homebrew taps..."\n`;
    sections.taps.forEach(tap => {
      script += `brew tap ${tap}\n`;
    });
    script += `\n`;
  }

  // Install Homebrew formulae
  if (sections.formulae && sections.formulae.length > 0) {
    script += `# Install Homebrew formulae\n`;
    script += `echo "📦 Installing Homebrew formulae..."\n`;
    script += `brew install \\\n`;
    script += sections.formulae.map(f => `  ${f}`).join(' \\\n');
    script += `\n\n`;
  }

  // Install Homebrew casks
  if (sections.casks && sections.casks.length > 0) {
    script += `# Install Homebrew casks\n`;
    script += `echo "📦 Installing applications..."\n`;
    sections.casks.forEach(cask => {
      script += `brew install --cask ${cask}\n`;
    });
    script += `\n`;
  }

  // Install nvm and Node versions
  if (sections.nodeVersions && sections.nodeVersions.length > 0) {
    script += `# Install nvm and Node.js versions\n`;
    script += `echo "📦 Installing Node.js..."\n`;
    script += `if ! command -v nvm &> /dev/null; then\n`;
    script += `  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\n`;
    script += `  export NVM_DIR="$HOME/.nvm"\n`;
    script += `  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\n`;
    script += `fi\n\n`;
    sections.nodeVersions.forEach(version => {
      script += `nvm install ${version}\n`;
    });
    script += `\n`;
  }

  // Install pyenv and Python versions
  if (sections.pythonVersions && sections.pythonVersions.length > 0) {
    script += `# Install pyenv and Python versions\n`;
    script += `echo "📦 Installing Python..."\n`;
    script += `if ! command -v pyenv &> /dev/null; then\n`;
    script += `  brew install pyenv\n`;
    script += `fi\n\n`;
    sections.pythonVersions.forEach(version => {
      script += `pyenv install ${version}\n`;
    });
    script += `\n`;
  }

  // Install global npm packages
  if (sections.npmGlobal && sections.npmGlobal.length > 0) {
    script += `# Install global npm packages\n`;
    script += `echo "📦 Installing global npm packages..."\n`;
    sections.npmGlobal.forEach(pkg => {
      script += `npm install -g ${pkg}\n`;
    });
    script += `\n`;
  }

  // Install VS Code extensions
  if (sections.vscodeExtensions && sections.vscodeExtensions.length > 0) {
    script += `# Install VS Code extensions\n`;
    script += `echo "📦 Installing VS Code extensions..."\n`;
    script += `if command -v code &> /dev/null; then\n`;
    sections.vscodeExtensions.forEach(ext => {
      script += `  code --install-extension ${ext}\n`;
    });
    script += `fi\n\n`;
  }

  // Restore Git config
  if (sections.gitConfig && sections.gitConfig.length > 0) {
    script += `# Configure Git\n`;
    script += `echo "📦 Configuring Git..."\n`;
    sections.gitConfig.forEach(config => {
      const match = config.match(/^(.+?)=(.+)$/);
      if (match) {
        script += `git config --global "${match[1]}" "${match[2]}"\n`;
      }
    });
    script += `\n`;
  }

  // Restore shell config
  if (sections.zshrc) {
    script += `# Restore .zshrc configuration\n`;
    script += `echo "📦 Restoring shell configuration..."\n`;
    script += `cat >> ~/.zshrc << 'EOF'\n${sections.zshrc}\nEOF\n\n`;
  }

  script += `echo ""
echo "✨ Setup complete!"
echo ""
echo "Please restart your terminal or run 'source ~/.zshrc' to apply changes."
`;

  return script;
};

interface ScanSections {
  formulae?: string[];
  casks?: string[];
  taps?: string[];
  nodeVersions?: string[];
  pythonVersions?: string[];
  rubyVersions?: string[];
  npmGlobal?: string[];
  pipPackages?: string[];
  vscodeExtensions?: string[];
  zshrc?: string;
  bashrc?: string;
  gitConfig?: string[];
}

const parseScanData = (data: string): ScanSections => {
  const sections: ScanSections = {};
  
  // Parse Homebrew formulae
  const formulaeMatch = data.match(/## HOMEBREW_FORMULAE ##\n([\s\S]*?)(?=\n## |$)/);
  if (formulaeMatch) {
    sections.formulae = formulaeMatch[1]
      .trim()
      .split('\n')
      .filter(line => line && line !== 'None');
  }

  // Parse Homebrew casks
  const casksMatch = data.match(/## HOMEBREW_CASKS ##\n([\s\S]*?)(?=\n## |$)/);
  if (casksMatch) {
    sections.casks = casksMatch[1]
      .trim()
      .split('\n')
      .filter(line => line && line !== 'None');
  }

  // Parse Homebrew taps
  const tapsMatch = data.match(/## HOMEBREW_TAPS ##\n([\s\S]*?)(?=\n## |$)/);
  if (tapsMatch) {
    sections.taps = tapsMatch[1]
      .trim()
      .split('\n')
      .filter(line => line && line !== 'None');
  }

  // Parse Node versions
  const nodeMatch = data.match(/## NODE_VERSIONS ##\n([\s\S]*?)(?=\n## |$)/);
  if (nodeMatch) {
    sections.nodeVersions = nodeMatch[1]
      .trim()
      .split('\n')
      .filter(line => line && line !== 'None')
      .map(line => line.replace(/[->*\s]/g, '').trim())
      .filter(v => v && v.match(/^\d/));
  }

  // Parse Python versions
  const pythonMatch = data.match(/## PYTHON_VERSIONS ##\n([\s\S]*?)(?=\n## |$)/);
  if (pythonMatch) {
    sections.pythonVersions = pythonMatch[1]
      .trim()
      .split('\n')
      .filter(line => line && line !== 'None')
      .map(line => line.replace(/[*\s]/g, '').trim())
      .filter(v => v && v.match(/^\d/));
  }

  // Parse npm global packages
  const npmMatch = data.match(/## NPM_GLOBAL ##\n([\s\S]*?)(?=\n## |$)/);
  if (npmMatch) {
    sections.npmGlobal = npmMatch[1]
      .split('\n')
      .filter(line => line && !line.includes('npm@') && !line.startsWith('├') && !line.startsWith('└'))
      .map(line => {
        const pkgMatch = line.match(/([^@\s]+)@/);
        return pkgMatch ? pkgMatch[1] : null;
      })
      .filter((pkg): pkg is string => pkg !== null && pkg !== 'None');
  }

  // Parse VS Code extensions
  const vscodeMatch = data.match(/## VSCODE_EXTENSIONS ##\n([\s\S]*?)(?=\n## |$)/);
  if (vscodeMatch) {
    sections.vscodeExtensions = vscodeMatch[1]
      .trim()
      .split('\n')
      .filter(line => line && line !== 'None');
  }

  // Parse zshrc
  const zshrcMatch = data.match(/## ZSHRC ##\n([\s\S]*?)(?=\n## |$)/);
  if (zshrcMatch) {
    sections.zshrc = zshrcMatch[1].trim();
  }

  // Parse Git config
  const gitMatch = data.match(/## GIT_CONFIG ##\n([\s\S]*?)(?=\n## |$)/);
  if (gitMatch) {
    sections.gitConfig = gitMatch[1]
      .trim()
      .split('\n')
      .filter(line => line && line !== 'None');
  }

  return sections;
};
