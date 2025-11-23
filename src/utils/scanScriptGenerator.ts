export const generateScanScript = (): string => {
  return `#!/bin/bash

# ============================================================================
#  ____                  _ _            
# | __ )  __ _ ___  ___| (_)_ __   ___ 
# |  _ \\ / _\` / __|/ _ \\ | | '_ \\ / _ \\
# | |_) | (_| \\__ \\  __/ | | | | |  __/
# |____/ \\__,_|___/\\___|_|_|_| |_|\\___|
#                                        
# macOS Configuration Scanner
# Captures complete system state for replication
# ============================================================================

set -e
set -o pipefail

# Configuration
OUTPUT_JSON="baseline-scan.json"
OUTPUT_ARCHIVE="baseline-scan.tar.gz"
SCAN_VERSION="2.0.0"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Color codes for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
MAGENTA='\\033[0;35m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color
BOLD='\\033[1m'

# Progress tracking
TOTAL_STEPS=14
CURRENT_STEP=0

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
  echo -e "\${CYAN}\${BOLD}"
  cat << 'EOF'
 ____                  _ _            
| __ )  __ _ ___  ___| (_)_ __   ___ 
|  _ \\ / _\` / __|/ _ \\ | | '_ \\ / _ \\
| |_) | (_| \\__ \\  __/ | | | | |  __/
|____/ \\__,_|___/\\___|_|_|_| |_|\\___|
                                        
EOF
  echo -e "\${NC}"
  echo -e "\${BOLD}macOS Configuration Scanner v\${SCAN_VERSION}\${NC}"
  echo "Capturing complete system state..."
  echo ""
}

step() {
  CURRENT_STEP=$((CURRENT_STEP + 1))
  echo -e "\${BLUE}[\${CURRENT_STEP}/\${TOTAL_STEPS}]\${NC} \${BOLD}$1\${NC}"
}

success() {
  echo -e "\${GREEN}  ✓\${NC} $1"
}

warning() {
  echo -e "\${YELLOW}  ⚠\${NC} $1"
}

error() {
  echo -e "\${RED}  ✗\${NC} $1"
}

info() {
  echo -e "\${CYAN}  →\${NC} $1"
}

json_escape() {
  printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
}

# ============================================================================
# SCANNING FUNCTIONS
# ============================================================================

scan_system_info() {
  step "Scanning system information"
  
  HOSTNAME=$(hostname)
  MACOS_VERSION=$(sw_vers -productVersion)
  MACOS_BUILD=$(sw_vers -buildVersion)
  HARDWARE_MODEL=$(sysctl -n hw.model)
  ARCH=$(uname -m)
  
  info "Host: \${HOSTNAME}"
  info "macOS: \${MACOS_VERSION} (Build \${MACOS_BUILD})"
  info "Architecture: \${ARCH}"
  success "System info captured"
  echo ""
}

scan_homebrew() {
  step "Scanning Homebrew packages"
  
  if command -v brew &> /dev/null; then
    BREW_PREFIX=$(brew --prefix)
    BREW_VERSION=$(brew --version | head -n1 | awk '{print \$2}')
    
    # Get formulae
    BREW_FORMULAE=$(brew list --formula 2>/dev/null || echo "")
    FORMULAE_COUNT=$(echo "\$BREW_FORMULAE" | grep -v "^$" | wc -l | tr -d ' ')
    
    # Get casks
    BREW_CASKS=$(brew list --cask 2>/dev/null || echo "")
    CASKS_COUNT=$(echo "\$BREW_CASKS" | grep -v "^$" | wc -l | tr -d ' ')
    
    # Get taps
    BREW_TAPS=$(brew tap 2>/dev/null || echo "")
    TAPS_COUNT=$(echo "\$BREW_TAPS" | grep -v "^$" | wc -l | tr -d ' ')
    
    success "Found \${FORMULAE_COUNT} formulae, \${CASKS_COUNT} casks, \${TAPS_COUNT} taps"
  else
    warning "Homebrew not installed"
    BREW_PREFIX=""
    BREW_VERSION=""
    BREW_FORMULAE=""
    BREW_CASKS=""
    BREW_TAPS=""
  fi
  echo ""
}

scan_applications() {
  step "Scanning installed applications"
  
  # Scan /Applications
  APP_LIST=$(find /Applications -maxdepth 2 -name "*.app" -type d 2>/dev/null | sort)
  APP_COUNT=$(echo "\$APP_LIST" | grep -v "^$" | wc -l | tr -d ' ')
  
  # Get just app names (without .app extension and path)
  APP_NAMES=$(echo "\$APP_LIST" | sed 's|.*/||' | sed 's|.app$||' | sort)
  
  success "Found \${APP_COUNT} applications"
  echo ""
}

scan_vscode() {
  step "Scanning VS Code configuration"
  
  if command -v code &> /dev/null; then
    # Extensions
    VSCODE_EXTENSIONS=$(code --list-extensions 2>/dev/null || echo "")
    EXT_COUNT=$(echo "\$VSCODE_EXTENSIONS" | grep -v "^$" | wc -l | tr -d ' ')
    
    # Settings
    VSCODE_SETTINGS_PATH="$HOME/Library/Application Support/Code/User/settings.json"
    if [ -f "\$VSCODE_SETTINGS_PATH" ]; then
      VSCODE_SETTINGS=$(cat "\$VSCODE_SETTINGS_PATH" 2>/dev/null || echo "{}")
    else
      VSCODE_SETTINGS="{}"
    fi
    
    # Keybindings
    VSCODE_KEYBINDINGS_PATH="$HOME/Library/Application Support/Code/User/keybindings.json"
    if [ -f "\$VSCODE_KEYBINDINGS_PATH" ]; then
      VSCODE_KEYBINDINGS=$(cat "\$VSCODE_KEYBINDINGS_PATH" 2>/dev/null || echo "[]")
    else
      VSCODE_KEYBINDINGS="[]"
    fi
    
    # Snippets
    VSCODE_SNIPPETS_DIR="$HOME/Library/Application Support/Code/User/snippets"
    if [ -d "\$VSCODE_SNIPPETS_DIR" ]; then
      VSCODE_SNIPPETS_FILES=$(find "\$VSCODE_SNIPPETS_DIR" -name "*.json" 2>/dev/null || echo "")
    else
      VSCODE_SNIPPETS_FILES=""
    fi
    
    success "Found \${EXT_COUNT} extensions and configuration files"
  else
    warning "VS Code not installed"
    VSCODE_EXTENSIONS=""
    VSCODE_SETTINGS="{}"
    VSCODE_KEYBINDINGS="[]"
    VSCODE_SNIPPETS_FILES=""
  fi
  echo ""
}

scan_shell_configs() {
  step "Scanning shell configurations"
  
  SHELL_FILES=()
  
  # Zsh
  if [ -f "$HOME/.zshrc" ]; then
    ZSHRC_CONTENT=$(cat "$HOME/.zshrc")
    SHELL_FILES+=(".zshrc")
  else
    ZSHRC_CONTENT=""
  fi
  
  if [ -f "$HOME/.zprofile" ]; then
    ZPROFILE_CONTENT=$(cat "$HOME/.zprofile")
    SHELL_FILES+=(".zprofile")
  else
    ZPROFILE_CONTENT=""
  fi
  
  if [ -f "$HOME/.zshenv" ]; then
    ZSHENV_CONTENT=$(cat "$HOME/.zshenv")
    SHELL_FILES+=(".zshenv")
  else
    ZSHENV_CONTENT=""
  fi
  
  # Bash
  if [ -f "$HOME/.bashrc" ]; then
    BASHRC_CONTENT=$(cat "$HOME/.bashrc")
    SHELL_FILES+=(".bashrc")
  else
    BASHRC_CONTENT=""
  fi
  
  if [ -f "$HOME/.bash_profile" ]; then
    BASH_PROFILE_CONTENT=$(cat "$HOME/.bash_profile")
    SHELL_FILES+=(".bash_profile")
  else
    BASH_PROFILE_CONTENT=""
  fi
  
  # Other common configs
  if [ -f "$HOME/.profile" ]; then
    PROFILE_CONTENT=$(cat "$HOME/.profile")
    SHELL_FILES+=(".profile")
  else
    PROFILE_CONTENT=""
  fi
  
  success "Found \${#SHELL_FILES[@]} shell configuration files"
  echo ""
}

scan_bin_scripts() {
  step "Scanning custom scripts in ~/.bin"
  
  if [ -d "$HOME/.bin" ]; then
    BIN_SCRIPTS=$(find "$HOME/.bin" -type f -perm +111 2>/dev/null || echo "")
    if [ -n "\$BIN_SCRIPTS" ]; then
      SCRIPT_COUNT=$(echo "\$BIN_SCRIPTS" | wc -l | tr -d ' ')
      success "Found \${SCRIPT_COUNT} executable scripts"
    else
      warning "No executable scripts found"
    fi
  else
    warning "~/.bin directory not found"
    BIN_SCRIPTS=""
  fi
  echo ""
}

scan_git_config() {
  step "Scanning Git configuration"
  
  if command -v git &> /dev/null; then
    # Global config
    GIT_CONFIG=$(git config --list --global 2>/dev/null || echo "")
    
    # .gitconfig file
    if [ -f "$HOME/.gitconfig" ]; then
      GITCONFIG_CONTENT=$(cat "$HOME/.gitconfig")
    else
      GITCONFIG_CONTENT=""
    fi
    
    # .gitignore_global
    if [ -f "$HOME/.gitignore_global" ]; then
      GITIGNORE_GLOBAL=$(cat "$HOME/.gitignore_global")
    else
      GITIGNORE_GLOBAL=""
    fi
    
    success "Git configuration captured"
  else
    warning "Git not installed"
    GIT_CONFIG=""
    GITCONFIG_CONTENT=""
    GITIGNORE_GLOBAL=""
  fi
  echo ""
}

scan_ssh_config() {
  step "Scanning SSH configuration"
  
  if [ -d "$HOME/.ssh" ]; then
    # SSH config
    if [ -f "$HOME/.ssh/config" ]; then
      SSH_CONFIG=$(cat "$HOME/.ssh/config")
    else
      SSH_CONFIG=""
    fi
    
    # List key files (not their contents for security)
    SSH_KEYS=$(find "$HOME/.ssh" -type f \\( -name "id_*" -o -name "*.pub" \\) 2>/dev/null | sed "s|$HOME/.ssh/||" || echo "")
    
    # known_hosts entries count
    if [ -f "$HOME/.ssh/known_hosts" ]; then
      KNOWN_HOSTS_COUNT=$(wc -l < "$HOME/.ssh/known_hosts" | tr -d ' ')
    else
      KNOWN_HOSTS_COUNT=0
    fi
    
    success "SSH configuration captured (\${KNOWN_HOSTS_COUNT} known hosts)"
    info "Note: Key file names recorded, but private keys not copied for security"
  else
    warning "~/.ssh directory not found"
    SSH_CONFIG=""
    SSH_KEYS=""
    KNOWN_HOSTS_COUNT=0
  fi
  echo ""
}

scan_nvm() {
  step "Scanning Node.js versions (nvm)"
  
  if [ -d "$HOME/.nvm" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    
    if command -v nvm &> /dev/null; then
      NVM_VERSIONS=$(nvm list 2>/dev/null | grep -v "^->" | sed 's/[->*]//g' | sed 's/^[ \t]*//' | grep "^v" || echo "")
      NVM_CURRENT=$(nvm current 2>/dev/null || echo "")
      VERSION_COUNT=$(echo "\$NVM_VERSIONS" | grep -v "^$" | wc -l | tr -d ' ')
      
      success "Found \${VERSION_COUNT} Node.js versions"
    else
      warning "nvm not properly configured"
      NVM_VERSIONS=""
      NVM_CURRENT=""
    fi
  else
    info "nvm not installed"
    NVM_VERSIONS=""
    NVM_CURRENT=""
  fi
  echo ""
}

scan_npm_globals() {
  step "Scanning global npm packages"
  
  if command -v npm &> /dev/null; then
    NPM_GLOBALS=$(npm list -g --depth=0 --json 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    deps = data.get('dependencies', {})
    for pkg, info in deps.items():
        if pkg != 'npm':
            print(f'{pkg}@{info.get(\"version\", \"latest\")}')
except:
    pass
" || echo "")
    
    PKG_COUNT=$(echo "\$NPM_GLOBALS" | grep -v "^$" | wc -l | tr -d ' ')
    success "Found \${PKG_COUNT} global npm packages"
  else
    info "npm not installed"
    NPM_GLOBALS=""
  fi
  echo ""
}

scan_pyenv() {
  step "Scanning Python versions (pyenv)"
  
  if command -v pyenv &> /dev/null; then
    PYENV_VERSIONS=$(pyenv versions 2>/dev/null | sed 's/[*]//g' | sed 's/^[ \t]*//' | grep "^[0-9]" || echo "")
    PYENV_GLOBAL=$(pyenv global 2>/dev/null || echo "")
    VERSION_COUNT=$(echo "\$PYENV_VERSIONS" | grep -v "^$" | wc -l | tr -d ' ')
    
    success "Found \${VERSION_COUNT} Python versions"
  else
    info "pyenv not installed"
    PYENV_VERSIONS=""
    PYENV_GLOBAL=""
  fi
  echo ""
}

scan_rbenv() {
  step "Scanning Ruby versions (rbenv)"
  
  if command -v rbenv &> /dev/null; then
    RBENV_VERSIONS=$(rbenv versions 2>/dev/null | sed 's/[*]//g' | sed 's/^[ \t]*//' | grep "^[0-9]" || echo "")
    RBENV_GLOBAL=$(rbenv global 2>/dev/null || echo "")
    VERSION_COUNT=$(echo "\$RBENV_VERSIONS" | grep -v "^$" | wc -l | tr -d ' ')
    
    success "Found \${VERSION_COUNT} Ruby versions"
  else
    info "rbenv not installed"
    RBENV_VERSIONS=""
    RBENV_GLOBAL=""
  fi
  echo ""
}

scan_pip_packages() {
  step "Scanning pip packages"
  
  if command -v pip3 &> /dev/null; then
    PIP_PACKAGES=$(pip3 list --format=freeze 2>/dev/null || echo "")
    PKG_COUNT=$(echo "\$PIP_PACKAGES" | grep -v "^$" | wc -l | tr -d ' ')
    
    success "Found \${PKG_COUNT} pip packages"
  else
    info "pip3 not installed"
    PIP_PACKAGES=""
  fi
  echo ""
}

# ============================================================================
# JSON GENERATION
# ============================================================================

generate_json() {
  step "Generating JSON output"
  
  # Create JSON using Python for proper escaping
  python3 << EOF > "\$OUTPUT_JSON"
import json
from datetime import datetime

# System Info
system_info = {
    "hostname": $(json_escape "\$HOSTNAME"),
    "macos_version": $(json_escape "\$MACOS_VERSION"),
    "macos_build": $(json_escape "\$MACOS_BUILD"),
    "hardware_model": $(json_escape "\$HARDWARE_MODEL"),
    "architecture": $(json_escape "\$ARCH"),
    "scan_timestamp": "\$TIMESTAMP",
    "scan_version": "\$SCAN_VERSION"
}

# Homebrew
homebrew = {
    "installed": $([ -n "\$BREW_VERSION" ] && echo "true" || echo "false"),
    "version": $(json_escape "\$BREW_VERSION"),
    "prefix": $(json_escape "\$BREW_PREFIX"),
    "formulae": [x.strip() for x in '''
\$BREW_FORMULAE
'''.strip().split('\\n') if x.strip()],
    "casks": [x.strip() for x in '''
\$BREW_CASKS
'''.strip().split('\\n') if x.strip()],
    "taps": [x.strip() for x in '''
\$BREW_TAPS
'''.strip().split('\\n') if x.strip()]
}

# Applications
applications = [x.strip() for x in '''
\$APP_NAMES
'''.strip().split('\\n') if x.strip()]

# VS Code
vscode_snippets = {}
$(if [ -n "\$VSCODE_SNIPPETS_FILES" ]; then
  for snippet_file in \$VSCODE_SNIPPETS_FILES; do
    snippet_name=$(basename "\$snippet_file" .json)
    echo "vscode_snippets['$snippet_name'] = $(cat "\$snippet_file" | python3 -c 'import json,sys; print(json.dumps(json.load(sys.stdin)))')"
  done
fi)

vscode = {
    "installed": $(command -v code &> /dev/null && echo "true" || echo "false"),
    "extensions": [x.strip() for x in '''
\$VSCODE_EXTENSIONS
'''.strip().split('\\n') if x.strip()],
    "settings": \$VSCODE_SETTINGS,
    "keybindings": \$VSCODE_KEYBINDINGS,
    "snippets": vscode_snippets
}

# Shell Configs
shell_configs = {
    "zshrc": $(json_escape "\$ZSHRC_CONTENT"),
    "zprofile": $(json_escape "\$ZPROFILE_CONTENT"),
    "zshenv": $(json_escape "\$ZSHENV_CONTENT"),
    "bashrc": $(json_escape "\$BASHRC_CONTENT"),
    "bash_profile": $(json_escape "\$BASH_PROFILE_CONTENT"),
    "profile": $(json_escape "\$PROFILE_CONTENT")
}

# Bin Scripts
bin_scripts = {}
$(if [ -n "\$BIN_SCRIPTS" ]; then
  for script in \$BIN_SCRIPTS; do
    script_name=$(basename "\$script")
    echo "bin_scripts['$script_name'] = $(cat "\$script" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')"
  done
fi)

# Git Config
git_config = {
    "installed": $(command -v git &> /dev/null && echo "true" || echo "false"),
    "config_list": [x.strip() for x in '''
\$GIT_CONFIG
'''.strip().split('\\n') if x.strip()],
    "gitconfig_file": $(json_escape "\$GITCONFIG_CONTENT"),
    "gitignore_global": $(json_escape "\$GITIGNORE_GLOBAL")
}

# SSH Config
ssh_config = {
    "config_file": $(json_escape "\$SSH_CONFIG"),
    "key_files": [x.strip() for x in '''
\$SSH_KEYS
'''.strip().split('\\n') if x.strip()],
    "known_hosts_count": \$KNOWN_HOSTS_COUNT,
    "note": "Private key contents not included for security. Only file names are listed."
}

# Node.js / nvm
nodejs = {
    "nvm_installed": $([ -d "$HOME/.nvm" ] && echo "true" || echo "false"),
    "versions": [x.strip() for x in '''
\$NVM_VERSIONS
'''.strip().split('\\n') if x.strip()],
    "current": $(json_escape "\$NVM_CURRENT"),
    "global_packages": [x.strip() for x in '''
\$NPM_GLOBALS
'''.strip().split('\\n') if x.strip()]
}

# Python / pyenv
python = {
    "pyenv_installed": $(command -v pyenv &> /dev/null && echo "true" || echo "false"),
    "versions": [x.strip() for x in '''
\$PYENV_VERSIONS
'''.strip().split('\\n') if x.strip()],
    "global": $(json_escape "\$PYENV_GLOBAL"),
    "pip_packages": [x.strip() for x in '''
\$PIP_PACKAGES
'''.strip().split('\\n') if x.strip()]
}

# Ruby / rbenv
ruby = {
    "rbenv_installed": $(command -v rbenv &> /dev/null && echo "true" || echo "false"),
    "versions": [x.strip() for x in '''
\$RBENV_VERSIONS
'''.strip().split('\\n') if x.strip()],
    "global": $(json_escape "\$RBENV_GLOBAL")
}

# Build final JSON
scan_data = {
    "baseline_scan_version": "\$SCAN_VERSION",
    "system": system_info,
    "homebrew": homebrew,
    "applications": applications,
    "vscode": vscode,
    "shell_configs": shell_configs,
    "bin_scripts": bin_scripts,
    "git": git_config,
    "ssh": ssh_config,
    "nodejs": nodejs,
    "python": python,
    "ruby": ruby
}

print(json.dumps(scan_data, indent=2, ensure_ascii=False))
EOF
  
  success "JSON file created: \$OUTPUT_JSON"
  echo ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  print_header
  
  # Run all scans
  scan_system_info
  scan_homebrew
  scan_applications
  scan_vscode
  scan_shell_configs
  scan_bin_scripts
  scan_git_config
  scan_ssh_config
  scan_nvm
  scan_npm_globals
  scan_pyenv
  scan_rbenv
  scan_pip_packages
  
  # Generate JSON
  generate_json
  
  # Create archive
  step "Creating archive"
  tar -czf "\$OUTPUT_ARCHIVE" "\$OUTPUT_JSON" 2>/dev/null
  success "Archive created: \$OUTPUT_ARCHIVE"
  echo ""
  
  # Summary
  echo -e "\${GREEN}\${BOLD}========================================\${NC}"
  echo -e "\${GREEN}\${BOLD}Scan Complete!\${NC}"
  echo -e "\${GREEN}\${BOLD}========================================\${NC}"
  echo ""
  echo -e "\${BOLD}Output Files:\${NC}"
  echo -e "  • JSON:    \${CYAN}\$OUTPUT_JSON\${NC}"
  echo -e "  • Archive: \${CYAN}\$OUTPUT_ARCHIVE\${NC}"
  echo ""
  echo -e "\${BOLD}File Size:\${NC}"
  ls -lh "\$OUTPUT_JSON" | awk '{print "  • " \$5 " (" \$9 ")"}'
  echo ""
  echo -e "\${BOLD}Next Steps:\${NC}"
  echo -e "  1. Review the JSON file to verify captured data"
  echo -e "  2. Upload to Baseline to generate restore script"
  echo -e "  3. Keep the archive in a safe location"
  echo ""
  echo -e "\${YELLOW}Note:\${NC} SSH private keys are not included for security."
  echo -e "You'll need to manually copy them or regenerate keys."
  echo ""
}

# Check for Python 3 (required for JSON generation)
if ! command -v python3 &> /dev/null; then
  echo -e "\${RED}Error: Python 3 is required but not installed.\${NC}"
  echo "Please install Python 3 and try again."
  exit 1
fi

# Run main function
main
`;
};
