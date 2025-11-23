#!/bin/sh

# ============================================================================
#  ____                  _ _            
# | __ )  __ _ ___  ___| (_)_ __   ___ 
# |  _ \ / _` / __|/ _ \ | | '_ \ / _ \
# | |_) | (_| \__ \  __/ | | | | |  __/
# |____/ \__,_|___/\___|_|_|_| |_|\___|
#                                        
# macOS Configuration Scanner
# Captures complete system state for replication
# ============================================================================

set -e
# Disable pipefail for sh compatibility - handle errors manually
# set -o pipefail only works in bash/zsh
if [ -n "$BASH_VERSION" ] || [ -n "$ZSH_VERSION" ]; then
  set -o pipefail 2>/dev/null || true
fi

# Configuration
OUTPUT_JSON="baseline-scan.json"
OUTPUT_ARCHIVE="baseline-scan.tar.gz"
SCAN_VERSION="2.0.0"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Parse command line arguments
INCLUDE_SSH_KEYS="false"
for arg in "$@"; do
  case $arg in
    --include-ssh-keys)
      INCLUDE_SSH_KEYS="true"
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --include-ssh-keys    Include SSH private keys in the scan (use with caution)"
      echo "  --help, -h            Show this help message"
      echo ""
      echo "Note: SSH private keys are excluded by default for security."
      echo "Only use --include-ssh-keys if you understand the security implications."
      exit 0
      ;;
  esac
done

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Progress tracking
TOTAL_STAGES=9
CURRENT_STAGE=0

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
  printf "${CYAN}${BOLD}"
  cat << 'EOF'
 ____                  _ _            
| __ )  __ _ ___  ___| (_)_ __   ___ 
|  _ \ / _` / __|/ _ \ | | '_ \ / _ \
| |_) | (_| \__ \  __/ | | | | |  __/
|____/ \__,_|___/\___|_|_|_| |_|\___|
                                        
EOF
  printf "${NC}\n"
  printf "${BOLD}macOS Configuration Scanner v${SCAN_VERSION}${NC}\n"
  echo "Capturing complete system state..."
  echo ""
}

stage() {
  CURRENT_STAGE=$((CURRENT_STAGE + 1))
  echo ""
  printf "${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${MAGENTA}${BOLD}[STAGE ${CURRENT_STAGE}/${TOTAL_STAGES}] %s${NC}\n" "$1"
  printf "${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

step() {
  printf "${BLUE}  →${NC} %s\n" "$1"
}

success() {
  printf "${GREEN}    ✓${NC} %s\n" "$1"
}

warning() {
  printf "${YELLOW}    ⚠${NC} %s\n" "$1"
}

error() {
  printf "${RED}    ✗${NC} %s\n" "$1"
}

info() {
  printf "${CYAN}    •${NC} %s\n" "$1"
}

json_escape() {
  printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
}

# ============================================================================
# SCANNING FUNCTIONS
# ============================================================================

scan_system_info() {
  HOSTNAME=$(hostname)
  MACOS_VERSION=$(sw_vers -productVersion)
  MACOS_BUILD=$(sw_vers -buildVersion)
  HARDWARE_MODEL=$(sysctl -n hw.model)
  ARCH=$(uname -m)
  
  info "Hostname: ${HOSTNAME}"
  info "macOS: ${MACOS_VERSION} (Build ${MACOS_BUILD})"
  info "Hardware: ${HARDWARE_MODEL}"
  info "Architecture: ${ARCH}"
  success "System metadata captured"
}

scan_homebrew() {
  if command -v brew >/dev/null 2>&1; then
    step "Scanning Homebrew package manager"
    BREW_PREFIX=$(brew --prefix 2>/dev/null || echo "")
    BREW_VERSION=$(brew --version 2>/dev/null | head -n1 | awk '{print $2}' || echo "")
    
    # Get formulae
    BREW_FORMULAE=$(brew list --formula 2>/dev/null || echo "")
    if [ -n "$BREW_FORMULAE" ]; then
      FORMULAE_COUNT=$(echo "$BREW_FORMULAE" | grep -c . 2>/dev/null || echo "0")
    else
      FORMULAE_COUNT=0
    fi
    
    # Get casks
    BREW_CASKS=$(brew list --cask 2>/dev/null || echo "")
    if [ -n "$BREW_CASKS" ]; then
      CASKS_COUNT=$(echo "$BREW_CASKS" | grep -c . 2>/dev/null || echo "0")
    else
      CASKS_COUNT=0
    fi
    
    # Get taps
    BREW_TAPS=$(brew tap 2>/dev/null || echo "")
    if [ -n "$BREW_TAPS" ]; then
      TAPS_COUNT=$(echo "$BREW_TAPS" | grep -c . 2>/dev/null || echo "0")
    else
      TAPS_COUNT=0
    fi
    
    success "Found Homebrew: ${FORMULAE_COUNT} formulae, ${CASKS_COUNT} casks, ${TAPS_COUNT} taps"
  else
    BREW_PREFIX=""
    BREW_VERSION=""
    BREW_FORMULAE=""
    BREW_CASKS=""
    BREW_TAPS=""
  fi
}

scan_applications() {
  step "Scanning installed applications"
  # Scan /Applications
  APP_LIST=$(find /Applications -maxdepth 2 -name "*.app" -type d 2>/dev/null | sort || echo "")
  if [ -n "$APP_LIST" ]; then
    APP_COUNT=$(echo "$APP_LIST" | grep -c . 2>/dev/null || echo "0")
  else
    APP_COUNT=0
  fi
  
  # Get just app names (without .app extension and path)
  APP_NAMES=$(echo "$APP_LIST" | sed 's|.*/||' | sed 's|.app$||' | sort)
  
  success "Found ${APP_COUNT} applications"
  echo ""
}

scan_vscode() {
  if command -v code >/dev/null 2>&1; then
    step "Scanning VS Code configuration"
    # Extensions
    VSCODE_EXTENSIONS=$(code --list-extensions 2>/dev/null || echo "")
    if [ -n "$VSCODE_EXTENSIONS" ]; then
      EXT_COUNT=$(echo "$VSCODE_EXTENSIONS" | grep -c . 2>/dev/null || echo "0")
    else
      EXT_COUNT=0
    fi
    
    # Settings
    VSCODE_SETTINGS_PATH="$HOME/Library/Application Support/Code/User/settings.json"
    if [ -f "$VSCODE_SETTINGS_PATH" ]; then
      VSCODE_SETTINGS=$(cat "$VSCODE_SETTINGS_PATH" 2>/dev/null || echo "{}")
    else
      VSCODE_SETTINGS="{}"
    fi
    
    # Keybindings
    VSCODE_KEYBINDINGS_PATH="$HOME/Library/Application Support/Code/User/keybindings.json"
    if [ -f "$VSCODE_KEYBINDINGS_PATH" ]; then
      VSCODE_KEYBINDINGS=$(cat "$VSCODE_KEYBINDINGS_PATH" 2>/dev/null || echo "[]")
    else
      VSCODE_KEYBINDINGS="[]"
    fi
    
    # Snippets
    VSCODE_SNIPPETS_DIR="$HOME/Library/Application Support/Code/User/snippets"
    if [ -d "$VSCODE_SNIPPETS_DIR" ]; then
      VSCODE_SNIPPETS_FILES=$(find "$VSCODE_SNIPPETS_DIR" -name "*.json" 2>/dev/null || echo "")
    else
      VSCODE_SNIPPETS_FILES=""
    fi
    
    success "Found VS Code: ${EXT_COUNT} extensions + settings"
  else
    # Silently skip - not installed
    VSCODE_EXTENSIONS=""
    VSCODE_SETTINGS="{}"
    VSCODE_KEYBINDINGS="[]"
    VSCODE_SNIPPETS_FILES=""
  fi
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
  
  if [ ${#SHELL_FILES[@]} -gt 0 ]; then
    success "Found shell configs: ${SHELL_FILES[*]}"
  fi
  echo ""
}

scan_bin_scripts() {
  if [ -d "$HOME/.bin" ]; then
    step "Scanning custom scripts in ~/.bin"
    BIN_SCRIPTS=$(find "$HOME/.bin" -type f -perm +111 2>/dev/null || echo "")
    if [ -n "$BIN_SCRIPTS" ]; then
      SCRIPT_COUNT=$(echo "$BIN_SCRIPTS" | grep -c . 2>/dev/null || echo "0")
      success "Found ${SCRIPT_COUNT} executable scripts"
    fi
  else
    # Silently skip - not found
    BIN_SCRIPTS=""
  fi
}

scan_git_config() {
  if command -v git >/dev/null 2>&1; then
    step "Scanning Git configuration"
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
    
    success "Found Git configuration"
  else
    # Silently skip - not installed
    GIT_CONFIG=""
    GITCONFIG_CONTENT=""
    GITIGNORE_GLOBAL=""
  fi
  echo ""
}

scan_ssh_config() {
  if [ -d "$HOME/.ssh" ]; then
    step "Scanning SSH configuration"
    # SSH config
    if [ -f "$HOME/.ssh/config" ]; then
      SSH_CONFIG=$(cat "$HOME/.ssh/config")
    else
      SSH_CONFIG=""
    fi
    
    # List key files
    SSH_KEYS=$(find "$HOME/.ssh" -type f \( -name "id_*" -o -name "*.pub" \) 2>/dev/null | sed "s|$HOME/.ssh/||" || echo "")
    
    # Read private key contents if flag is set
    if [ "$INCLUDE_SSH_KEYS" = "true" ]; then
      SSH_PRIVATE_KEYS="{}"
      # Find private key files (exclude .pub files)
      PRIVATE_KEY_FILES=$(find "$HOME/.ssh" -type f -name "id_*" ! -name "*.pub" 2>/dev/null || echo "")
      if [ -n "$PRIVATE_KEY_FILES" ]; then
        # Export for Python to read
        export SSH_PRIVATE_KEY_FILES="$PRIVATE_KEY_FILES"
      fi
    else
      SSH_PRIVATE_KEYS=""
    fi
    
    # known_hosts entries count
    if [ -f "$HOME/.ssh/known_hosts" ]; then
      KNOWN_HOSTS_COUNT=$(grep -c . "$HOME/.ssh/known_hosts" 2>/dev/null || echo "0")
      [ -z "$KNOWN_HOSTS_COUNT" ] && KNOWN_HOSTS_COUNT=0
    else
      KNOWN_HOSTS_COUNT=0
    fi
    
    if [ "$INCLUDE_SSH_KEYS" = "true" ]; then
      success "Found SSH config (${KNOWN_HOSTS_COUNT} known hosts, keys listed)"
      warning "Private keys INCLUDED in scan (--include-ssh-keys flag used)"
    else
      success "Found SSH config (${KNOWN_HOSTS_COUNT} known hosts, keys listed)"
      info "Private keys not included for security"
    fi
  else
    # Silently skip - not found
    SSH_CONFIG=""
    SSH_KEYS=""
    KNOWN_HOSTS_COUNT=0
  fi
  echo ""
}

scan_nvm() {
  if [ -d "$HOME/.nvm" ]; then
    step "Scanning nvm (Node Version Manager)"
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" 2>/dev/null
    
    if command -v nvm >/dev/null 2>&1; then
      NVM_VERSIONS=$(nvm list 2>/dev/null | grep -v "^->" | sed 's/[->*]//g' | sed 's/^[ \t]*//' | grep "^v" || echo "")
      NVM_CURRENT=$(nvm current 2>/dev/null || echo "")
      if [ -n "$NVM_VERSIONS" ]; then
        VERSION_COUNT=$(echo "$NVM_VERSIONS" | grep -c . 2>/dev/null || echo "0")
      else
        VERSION_COUNT=0
      fi
      
      success "Found ${VERSION_COUNT} Node.js versions (current: ${NVM_CURRENT})"
    else
      NVM_VERSIONS=""
      NVM_CURRENT=""
    fi
  else
    # Silently skip - not installed
    NVM_VERSIONS=""
    NVM_CURRENT=""
  fi
}

scan_npm_globals() {
  if command -v npm >/dev/null 2>&1; then
    step "Scanning global npm packages"
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
    
    if [ -n "$NPM_GLOBALS" ]; then
      PKG_COUNT=$(echo "$NPM_GLOBALS" | grep -c . 2>/dev/null || echo "0")
    else
      PKG_COUNT=0
    fi
    if [ "$PKG_COUNT" -gt 0 ]; then
      success "Found ${PKG_COUNT} global npm packages"
    fi
  else
    # Silently skip - not installed
    NPM_GLOBALS=""
  fi
  echo ""
}

scan_pyenv() {
  if command -v pyenv >/dev/null 2>&1; then
    step "Scanning pyenv (Python Version Manager)"
    PYENV_VERSIONS=$(pyenv versions 2>/dev/null | sed 's/[*]//g' | sed 's/^[ \t]*//' | grep "^[0-9]" || echo "")
    PYENV_GLOBAL=$(pyenv global 2>/dev/null || echo "")
    if [ -n "$PYENV_VERSIONS" ]; then
      VERSION_COUNT=$(echo "$PYENV_VERSIONS" | grep -c . 2>/dev/null || echo "0")
    else
      VERSION_COUNT=0
    fi
    
    if [ "$VERSION_COUNT" -gt 0 ]; then
      success "Found ${VERSION_COUNT} Python versions (global: ${PYENV_GLOBAL})"
    fi
  else
    # Silently skip - not installed
    PYENV_VERSIONS=""
    PYENV_GLOBAL=""
  fi
}

scan_rbenv() {
  if command -v rbenv >/dev/null 2>&1; then
    step "Scanning rbenv (Ruby Version Manager)"
    RBENV_VERSIONS=$(rbenv versions 2>/dev/null | sed 's/[*]//g' | sed 's/^[ \t]*//' | grep "^[0-9]" || echo "")
    RBENV_GLOBAL=$(rbenv global 2>/dev/null || echo "")
    if [ -n "$RBENV_VERSIONS" ]; then
      VERSION_COUNT=$(echo "$RBENV_VERSIONS" | grep -c . 2>/dev/null || echo "0")
    else
      VERSION_COUNT=0
    fi
    
    if [ "$VERSION_COUNT" -gt 0 ]; then
      success "Found ${VERSION_COUNT} Ruby versions (global: ${RBENV_GLOBAL})"
    fi
  else
    # Silently skip - not installed
    RBENV_VERSIONS=""
    RBENV_GLOBAL=""
  fi
}

scan_pip_packages() {
  if command -v pip3 >/dev/null 2>&1; then
    step "Scanning Python pip packages"
    PIP_PACKAGES=$(pip3 list --format=freeze 2>/dev/null || echo "")
    if [ -n "$PIP_PACKAGES" ]; then
      PKG_COUNT=$(echo "$PIP_PACKAGES" | grep -c . 2>/dev/null || echo "0")
      success "Found ${PKG_COUNT} pip packages"
    else
      PKG_COUNT=0
      PIP_PACKAGES=""
    fi
  else
    PIP_PACKAGES=""
  fi
}

scan_conda() {
  if command -v conda >/dev/null 2>&1; then
    step "Scanning conda environments"
    CONDA_VERSION=$(conda --version 2>/dev/null | awk '{print $2}' || echo "")
    CONDA_ENVS=$(conda env list 2>/dev/null | grep -v "^#" | awk '{print $1}' | grep -v "^$" || echo "")
    if [ -n "$CONDA_ENVS" ]; then
      ENV_COUNT=$(echo "$CONDA_ENVS" | grep -c . 2>/dev/null || echo "0")
    else
      ENV_COUNT=0
    fi
    
    # Get conda config
    CONDA_CONFIG=$(conda config --show 2>/dev/null || echo "")
    
    if [ "$ENV_COUNT" -gt 0 ]; then
      success "Found ${ENV_COUNT} conda environments"
    fi
  else
    # Silently skip - not installed
    CONDA_VERSION=""
    CONDA_ENVS=""
    CONDA_CONFIG=""
  fi
}

scan_yarn() {
  if command -v yarn >/dev/null 2>&1; then
    step "Scanning Yarn package manager"
    YARN_VERSION=$(yarn --version 2>/dev/null || echo "")
    YARN_GLOBAL=$(yarn global list 2>/dev/null | grep -v "^yarn" | grep -v "^info" | grep -v "^Done" || echo "")
    
    # Yarn config
    YARN_CONFIG=$(yarn config list 2>/dev/null || echo "")
    
    success "Found Yarn v${YARN_VERSION}"
  else
    # Silently skip - not installed
    YARN_VERSION=""
    YARN_GLOBAL=""
    YARN_CONFIG=""
  fi
}

scan_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    step "Scanning pnpm package manager"
    PNPM_VERSION=$(pnpm --version 2>/dev/null || echo "")
    PNPM_GLOBAL=$(pnpm list -g --depth 0 2>/dev/null | grep -v "^Legend" | grep -v "^$" || echo "")
    
    success "Found pnpm v${PNPM_VERSION}"
  else
    # Silently skip - not installed
    PNPM_VERSION=""
    PNPM_GLOBAL=""
  fi
}

scan_bun() {
  if command -v bun >/dev/null 2>&1; then
    step "Scanning Bun runtime"
    BUN_VERSION=$(bun --version 2>/dev/null || echo "")
    
    success "Found Bun v${BUN_VERSION}"
  else
    # Silently skip - not installed
    BUN_VERSION=""
  fi
}

scan_docker() {
  if command -v docker >/dev/null 2>&1; then
    step "Scanning Docker configuration"
    DOCKER_VERSION=$(docker --version 2>/dev/null | awk '{print $3}' | tr -d ',' || echo "")
    
    # Docker images
    DOCKER_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" 2>/dev/null || echo "")
    if [ -n "$DOCKER_IMAGES" ]; then
      IMAGE_COUNT=$(echo "$DOCKER_IMAGES" | grep -c . 2>/dev/null || echo "0")
    else
      IMAGE_COUNT=0
    fi
    
    # Docker compose files in common locations
    DOCKER_COMPOSE_FILES=$(find "$HOME" -maxdepth 3 -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null || echo "")
    
    success "Found Docker v${DOCKER_VERSION} with ${IMAGE_COUNT} images"
  else
    # Silently skip - not installed
    DOCKER_VERSION=""
    DOCKER_IMAGES=""
    DOCKER_COMPOSE_FILES=""
  fi
}

scan_aws_cli() {
  if command -v aws >/dev/null 2>&1; then
    step "Scanning AWS CLI configuration"
    AWS_VERSION=$(aws --version 2>&1 | awk '{print $1}' | cut -d'/' -f2 || echo "")
    
    # AWS profiles
    if [ -f "$HOME/.aws/config" ]; then
      AWS_PROFILES=$(grep "^\[profile" "$HOME/.aws/config" | sed 's/\[profile //g' | sed 's/\]//g' || echo "")
      AWS_CONFIG=$(cat "$HOME/.aws/config" 2>/dev/null || echo "")
    else
      AWS_PROFILES=""
      AWS_CONFIG=""
    fi
    
    success "Found AWS CLI v${AWS_VERSION}"
  else
    # Silently skip - not installed
    AWS_VERSION=""
    AWS_PROFILES=""
    AWS_CONFIG=""
  fi
}

scan_gcloud() {
  if command -v gcloud >/dev/null 2>&1; then
    step "Scanning Google Cloud SDK"
    GCLOUD_VERSION=$(gcloud --version 2>/dev/null | head -n1 | awk '{print $4}' || echo "")
    GCLOUD_CONFIGS=$(gcloud config configurations list 2>/dev/null | tail -n +2 | awk '{print $1}' || echo "")
    
    success "Found Google Cloud SDK v${GCLOUD_VERSION}"
  else
    # Silently skip - not installed
    GCLOUD_VERSION=""
    GCLOUD_CONFIGS=""
  fi
}

scan_iterm2() {
  if [ -d "$HOME/Library/Preferences" ]; then
    if [ -f "$HOME/Library/Preferences/com.googlecode.iterm2.plist" ]; then
      step "Scanning iTerm2 configuration"
      ITERM2_INSTALLED="true"
      success "Found iTerm2 configuration"
    else
      ITERM2_INSTALLED="false"
      # Silently skip - not configured
      :
    fi
  else
    ITERM2_INSTALLED="false"
  fi
}

scan_jetbrains() {
  JETBRAINS_IDES=""
  
  # Check for common JetBrains IDEs
  for ide in IntelliJIdea PyCharm WebStorm PhpStorm GoLand RubyMine CLion DataGrip Rider AndroidStudio; do
    if ls -d "$HOME/Library/Application Support/JetBrains/${ide}"* >/dev/null 2>&1; then
      JETBRAINS_IDES="${JETBRAINS_IDES}${ide} "
    fi
  done
  
  if [ -n "$JETBRAINS_IDES" ]; then
    step "Scanning JetBrains IDEs"
    success "Found: ${JETBRAINS_IDES}"
  else
    # Silently skip
    :
  fi
}

scan_vim() {
  VIM_CONFIG=""
  NVIM_CONFIG=""
  
  # Vim
  if [ -f "$HOME/.vimrc" ]; then
    step "Scanning Vim configuration"
    VIM_CONFIG=$(cat "$HOME/.vimrc" 2>/dev/null || echo "")
    success "Found Vim configuration"
  else
    # Silently skip
    :
  fi
  
  # Neovim
  if [ -d "$HOME/.config/nvim" ]; then
    step "Scanning Neovim configuration"
    NVIM_CONFIG="configured"
    success "Found Neovim configuration"
  else
    # Silently skip
    :
  fi
}

scan_databases() {
  DB_TOOLS=""
  
  # PostgreSQL
  if command -v psql >/dev/null 2>&1; then
    POSTGRES_VERSION=$(psql --version 2>/dev/null | awk '{print $3}' || echo "")
    DB_TOOLS="${DB_TOOLS}PostgreSQL:${POSTGRES_VERSION} "
  fi
  
  # MySQL
  if command -v mysql >/dev/null 2>&1; then
    MYSQL_VERSION=$(mysql --version 2>/dev/null | awk '{print $5}' | cut -d',' -f1 || echo "")
    DB_TOOLS="${DB_TOOLS}MySQL:${MYSQL_VERSION} "
  fi
  
  # MongoDB
  if command -v mongod >/dev/null 2>&1; then
    MONGO_VERSION=$(mongod --version 2>/dev/null | head -n1 | awk '{print $3}' || echo "")
    DB_TOOLS="${DB_TOOLS}MongoDB:${MONGO_VERSION} "
  fi
  
  # Redis
  if command -v redis-cli >/dev/null 2>&1; then
    REDIS_VERSION=$(redis-cli --version 2>/dev/null | awk '{print $2}' || echo "")
    DB_TOOLS="${DB_TOOLS}Redis:${REDIS_VERSION} "
  fi
  
  if [ -n "$DB_TOOLS" ]; then
    step "Scanning database tools"
    success "Found: ${DB_TOOLS}"
  fi
}

scan_terraform() {
  if command -v terraform >/dev/null 2>&1; then
    step "Scanning Terraform"
    TERRAFORM_VERSION=$(terraform version 2>/dev/null | head -n1 | awk '{print $2}' || echo "")
    success "Found Terraform ${TERRAFORM_VERSION}"
  else
    # Silently skip - not installed
    TERRAFORM_VERSION=""
  fi
}

scan_kubernetes() {
  K8S_TOOLS=""
  
  # kubectl
  if command -v kubectl >/dev/null 2>&1; then
    step "Scanning Kubernetes tools"
    KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null | awk '{print $3}' || echo "")
    K8S_TOOLS="${K8S_TOOLS}kubectl:${KUBECTL_VERSION} "
    
    # kubeconfig
    if [ -f "$HOME/.kube/config" ]; then
      KUBE_CONTEXTS=$(kubectl config get-contexts -o name 2>/dev/null | tr '\n' ',' || echo "")
    else
      KUBE_CONTEXTS=""
    fi
  fi
  
  # helm
  if command -v helm >/dev/null 2>&1; then
    HELM_VERSION=$(helm version --short 2>/dev/null | awk '{print $1}' || echo "")
    K8S_TOOLS="${K8S_TOOLS}helm:${HELM_VERSION} "
  fi
  
  if [ -n "$K8S_TOOLS" ]; then
    success "Found: ${K8S_TOOLS}"
  else
    # Silently skip
    KUBECTL_VERSION=""
    KUBE_CONTEXTS=""
  fi
}

scan_sdks() {
  step "Scanning language SDKs & runtimes"
  SDKS_FOUND=""
  
  # jenv (Java)
  if command -v jenv >/dev/null 2>&1; then
    JENV_VERSION=$(jenv version 2>/dev/null | awk '{print $1}' || echo "")
    SDKS_FOUND="${SDKS_FOUND}jenv:${JENV_VERSION} "
  fi
  
  # sdkman
  if [ -d "$HOME/.sdkman" ]; then
    SDKMAN_INSTALLED="true"
    SDKS_FOUND="${SDKS_FOUND}sdkman "
  else
    SDKMAN_INSTALLED="false"
  fi
  
  # rustup
  if command -v rustup >/dev/null 2>&1; then
    RUST_VERSION=$(rustc --version 2>/dev/null | awk '{print $2}' || echo "")
    SDKS_FOUND="${SDKS_FOUND}rust:${RUST_VERSION} "
  fi
  
  # go
  if command -v go >/dev/null 2>&1; then
    GO_VERSION=$(go version 2>/dev/null | awk '{print $3}' | sed 's/go//g' || echo "")
    GOPATH_VAL=$(go env GOPATH 2>/dev/null || echo "")
    SDKS_FOUND="${SDKS_FOUND}go:${GO_VERSION} "
  else
    GO_VERSION=""
    GOPATH_VAL=""
  fi
  
  # deno
  if command -v deno >/dev/null 2>&1; then
    DENO_VERSION=$(deno --version 2>/dev/null | head -n1 | awk '{print $2}' || echo "")
    SDKS_FOUND="${SDKS_FOUND}deno:${DENO_VERSION} "
  else
    DENO_VERSION=""
  fi
  
  if [ -n "$SDKS_FOUND" ]; then
    success "Found: ${SDKS_FOUND}"
  fi
}

# ============================================================================
# JSON GENERATION
# ============================================================================

generate_json() {
  # Create JSON using Python for proper escaping
  python3 << 'PYTHON_EOF' > "$OUTPUT_JSON"
import json
import os
import base64

def safe_json_parse(content, default=None):
    """Safely parse JSON content"""
    if not content or content.strip() == "":
        return default
    try:
        return json.loads(content)
    except:
        return default

# Read environment variables
hostname = os.environ.get('HOSTNAME', '')
macos_version = os.environ.get('MACOS_VERSION', '')
macos_build = os.environ.get('MACOS_BUILD', '')
hardware_model = os.environ.get('HARDWARE_MODEL', '')
arch = os.environ.get('ARCH', '')
timestamp = os.environ.get('TIMESTAMP', '')
scan_version = os.environ.get('SCAN_VERSION', '')

brew_version = os.environ.get('BREW_VERSION', '')
brew_prefix = os.environ.get('BREW_PREFIX', '')
brew_formulae = os.environ.get('BREW_FORMULAE', '').strip().split('\n') if os.environ.get('BREW_FORMULAE', '').strip() else []
brew_casks = os.environ.get('BREW_CASKS', '').strip().split('\n') if os.environ.get('BREW_CASKS', '').strip() else []
brew_taps = os.environ.get('BREW_TAPS', '').strip().split('\n') if os.environ.get('BREW_TAPS', '').strip() else []

app_names = os.environ.get('APP_NAMES', '').strip().split('\n') if os.environ.get('APP_NAMES', '').strip() else []

vscode_extensions = os.environ.get('VSCODE_EXTENSIONS', '').strip().split('\n') if os.environ.get('VSCODE_EXTENSIONS', '').strip() else []
vscode_settings = safe_json_parse(os.environ.get('VSCODE_SETTINGS', ''), {})
vscode_keybindings = safe_json_parse(os.environ.get('VSCODE_KEYBINDINGS', ''), [])

# Shell configs
shell_configs = {}
for key in ['ZSHRC_CONTENT', 'ZPROFILE_CONTENT', 'ZSHENV_CONTENT', 'BASHRC_CONTENT', 'BASH_PROFILE_CONTENT', 'PROFILE_CONTENT']:
    content = os.environ.get(key, '')
    if content:
        filename = key.replace('_CONTENT', '').lower()
        if filename.startswith('zsh'):
            filename = '.' + filename.replace('zsh', 'zsh')
        elif filename.startswith('bash'):
            filename = '.' + filename.replace('bash', 'bash_')
        else:
            filename = '.' + filename
        filename = filename.replace('_', '')
        if filename == '.zshzprofile':
            filename = '.zprofile'
        elif filename == '.zshzenv':
            filename = '.zshenv'
        elif filename == '.bashbashprofile':
            filename = '.bash_profile'
        shell_configs[filename] = content

# Bin scripts
bin_scripts_list = os.environ.get('BIN_SCRIPTS', '').strip().split('\n') if os.environ.get('BIN_SCRIPTS', '').strip() else []
bin_scripts = {script.replace(os.environ.get('HOME', '~') + '/.bin/', ''): '' for script in bin_scripts_list if script.strip()}

# Git
git_config = os.environ.get('GIT_CONFIG', '')
gitconfig_content = os.environ.get('GITCONFIG_CONTENT', '')
gitignore_global = os.environ.get('GITIGNORE_GLOBAL', '')

# SSH
ssh_config = os.environ.get('SSH_CONFIG', '')
ssh_keys_list = os.environ.get('SSH_KEYS', '').strip().split('\n') if os.environ.get('SSH_KEYS', '').strip() else []
known_hosts_count = int(os.environ.get('KNOWN_HOSTS_COUNT', '0'))
include_ssh_keys = os.environ.get('INCLUDE_SSH_KEYS', 'false') == 'true'

# Read private keys if flag is set
ssh_private_keys = {}
if include_ssh_keys:
    private_key_files = os.environ.get('SSH_PRIVATE_KEY_FILES', '').strip().split('\n') if os.environ.get('SSH_PRIVATE_KEY_FILES', '').strip() else []
    for key_file in private_key_files:
        if key_file and os.path.isfile(key_file):
            key_name = os.path.basename(key_file)
            try:
                with open(key_file, 'r') as f:
                    ssh_private_keys[key_name] = f.read()
            except:
                pass

# Node.js
nvm_versions_list = os.environ.get('NVM_VERSIONS', '').strip().split('\n') if os.environ.get('NVM_VERSIONS', '').strip() else []
nvm_current = os.environ.get('NVM_CURRENT', '')
npm_globals_list = os.environ.get('NPM_GLOBALS', '').strip().split('\n') if os.environ.get('NPM_GLOBALS', '').strip() else []

# Python
pyenv_versions_list = os.environ.get('PYENV_VERSIONS', '').strip().split('\n') if os.environ.get('PYENV_VERSIONS', '').strip() else []
pyenv_global = os.environ.get('PYENV_GLOBAL', '')
pip_packages_list = os.environ.get('PIP_PACKAGES', '').strip().split('\n') if os.environ.get('PIP_PACKAGES', '').strip() else []

# Ruby
rbenv_versions_list = os.environ.get('RBENV_VERSIONS', '').strip().split('\n') if os.environ.get('RBENV_VERSIONS', '').strip() else []
rbenv_global = os.environ.get('RBENV_GLOBAL', '')

# Conda
conda_version = os.environ.get('CONDA_VERSION', '')
conda_envs_list = os.environ.get('CONDA_ENVS', '').strip().split('\n') if os.environ.get('CONDA_ENVS', '').strip() else []
conda_config = os.environ.get('CONDA_CONFIG', '')

# Package managers
yarn_version = os.environ.get('YARN_VERSION', '')
yarn_global = os.environ.get('YARN_GLOBAL', '')
yarn_config = os.environ.get('YARN_CONFIG', '')
pnpm_version = os.environ.get('PNPM_VERSION', '')
pnpm_global = os.environ.get('PNPM_GLOBAL', '')
bun_version = os.environ.get('BUN_VERSION', '')

# Docker
docker_version = os.environ.get('DOCKER_VERSION', '')
docker_images_list = os.environ.get('DOCKER_IMAGES', '').strip().split('\n') if os.environ.get('DOCKER_IMAGES', '').strip() else []
docker_compose_files = os.environ.get('DOCKER_COMPOSE_FILES', '').strip().split('\n') if os.environ.get('DOCKER_COMPOSE_FILES', '').strip() else []

# Cloud CLIs
aws_version = os.environ.get('AWS_VERSION', '')
aws_profiles_list = os.environ.get('AWS_PROFILES', '').strip().split('\n') if os.environ.get('AWS_PROFILES', '').strip() else []
aws_config = os.environ.get('AWS_CONFIG', '')
gcloud_version = os.environ.get('GCLOUD_VERSION', '')
gcloud_configs_list = os.environ.get('GCLOUD_CONFIGS', '').strip().split('\n') if os.environ.get('GCLOUD_CONFIGS', '').strip() else []

# Terminal & Editors
iterm2_installed = os.environ.get('ITERM2_INSTALLED', 'false') == 'true'
jetbrains_ides = os.environ.get('JETBRAINS_IDES', '').strip()
vim_config = os.environ.get('VIM_CONFIG', '')
nvim_config = os.environ.get('NVIM_CONFIG', '')

# Databases
db_tools = os.environ.get('DB_TOOLS', '')

# Infrastructure
terraform_version = os.environ.get('TERRAFORM_VERSION', '')
kubectl_version = os.environ.get('KUBECTL_VERSION', '')
kube_contexts = os.environ.get('KUBE_CONTEXTS', '')

# Other SDKs
jenv_version = os.environ.get('JENV_VERSION', '')
sdkman_installed = os.environ.get('SDKMAN_INSTALLED', 'false') == 'true'
rust_version = os.environ.get('RUST_VERSION', '')
go_version = os.environ.get('GO_VERSION', '')
gopath_val = os.environ.get('GOPATH_VAL', '')
deno_version = os.environ.get('DENO_VERSION', '')

# Build JSON structure
scan_data = {
    "baseline_scan_version": scan_version,
    "system": {
        "hostname": hostname,
        "macos_version": macos_version,
        "macos_build": macos_build,
        "hardware_model": hardware_model,
        "architecture": arch,
        "scan_timestamp": timestamp,
        "scan_version": scan_version
    }
}

# Package Managers section
package_managers = {}
if brew_version:
    package_managers["homebrew"] = {
        "version": brew_version,
        "prefix": brew_prefix,
        "formulae": [x.strip() for x in brew_formulae if x.strip()],
        "casks": [x.strip() for x in brew_casks if x.strip()],
        "taps": [x.strip() for x in brew_taps if x.strip()]
    }

if yarn_version:
    package_managers["yarn"] = {
        "version": yarn_version,
        "global_packages": yarn_global,
        "config": yarn_config
    }

if pnpm_version:
    package_managers["pnpm"] = {
        "version": pnpm_version,
        "global_packages": pnpm_global
    }

if bun_version:
    package_managers["bun"] = {
        "version": bun_version
    }

if conda_version:
    package_managers["conda"] = {
        "version": conda_version,
        "environments": [x.strip() for x in conda_envs_list if x.strip()],
        "config": conda_config
    }

if package_managers:
    scan_data["package_managers"] = package_managers

# Applications
apps = [x.strip() for x in app_names if x.strip()]
if apps:
    scan_data["applications"] = apps

# Development Environments
dev_environments = {}

# VS Code
if vscode_extensions:
    dev_environments["vscode"] = {
        "extensions": [x.strip() for x in vscode_extensions if x.strip()],
        "settings": vscode_settings,
        "keybindings": vscode_keybindings,
        "snippets": {}
    }

# JetBrains
if jetbrains_ides:
    dev_environments["jetbrains_ides"] = jetbrains_ides.strip()

# Vim
if vim_config:
    dev_environments["vim"] = {
        "config": vim_config
    }

# Neovim
if nvim_config:
    dev_environments["neovim"] = {
        "configured": True
    }

if dev_environments:
    scan_data["development_environments"] = dev_environments

# Terminal Configurations
terminal_config = {}

if iterm2_installed:
    terminal_config["iterm2"] = {
        "installed": True
    }

# Shell configs
shell_configs = {}
for key in ['ZSHRC_CONTENT', 'ZPROFILE_CONTENT', 'ZSHENV_CONTENT', 'BASHRC_CONTENT', 'BASH_PROFILE_CONTENT', 'PROFILE_CONTENT']:
    content = os.environ.get(key, '')
    if content:
        filename = key.replace('_CONTENT', '').lower()
        if filename.startswith('zsh'):
            filename = '.' + filename.replace('zsh', 'zsh')
        elif filename.startswith('bash'):
            filename = '.' + filename.replace('bash', 'bash_')
        else:
            filename = '.' + filename
        filename = filename.replace('_', '')
        if filename == '.zshzprofile':
            filename = '.zprofile'
        elif filename == '.zshzenv':
            filename = '.zshenv'
        elif filename == '.bashbashprofile':
            filename = '.bash_profile'
        shell_configs[filename] = content

if shell_configs:
    terminal_config["shell_configs"] = shell_configs

if terminal_config:
    scan_data["terminal"] = terminal_config

# Version Managers & Language Runtimes
version_managers = {}

# Node.js
nodejs_data = {}
if nvm_versions_list:
    nodejs_data["nvm"] = {
        "versions": [x.strip() for x in nvm_versions_list if x.strip()],
        "current": nvm_current
    }
npm_globals = [x.strip() for x in npm_globals_list if x.strip()]
if npm_globals:
    nodejs_data["npm_global_packages"] = npm_globals

if nodejs_data:
    version_managers["nodejs"] = nodejs_data

# Python
python_data = {}
if pyenv_versions_list:
    python_data["pyenv"] = {
        "versions": [x.strip() for x in pyenv_versions_list if x.strip()],
        "global": pyenv_global
    }
pip_pkgs = [x.strip() for x in pip_packages_list if x.strip()]
if pip_pkgs:
    python_data["pip_packages"] = pip_pkgs

if python_data:
    version_managers["python"] = python_data

# Ruby
if rbenv_versions_list:
    version_managers["ruby"] = {
        "rbenv": {
            "versions": [x.strip() for x in rbenv_versions_list if x.strip()],
            "global": rbenv_global
        }
    }

# Go
if go_version:
    version_managers["go"] = {
        "version": go_version,
        "gopath": gopath_val
    }

# Rust
if rust_version:
    version_managers["rust"] = {
        "version": rust_version
    }

# Deno
if deno_version:
    version_managers["deno"] = {
        "version": deno_version
    }

# Java
if jenv_version:
    version_managers["java"] = {
        "jenv_version": jenv_version
    }

# SDKMAN
if sdkman_installed:
    version_managers["sdkman"] = {
        "installed": True
    }

if version_managers:
    scan_data["version_managers"] = version_managers

# Source Control
source_control = {}
if git_config or gitconfig_content:
    source_control["git"] = {
        "config": git_config,
        "gitconfig": gitconfig_content,
        "gitignore_global": gitignore_global
    }

if source_control:
    scan_data["source_control"] = source_control

# SSH Configuration
if ssh_config or ssh_keys_list:
    ssh_data = {
        "config": ssh_config,
        "keys": [x.strip() for x in ssh_keys_list if x.strip()],
        "known_hosts_count": known_hosts_count
    }
    if ssh_private_keys:
        ssh_data["private_keys"] = ssh_private_keys
        ssh_data["private_keys_included"] = True
    else:
        ssh_data["private_keys_included"] = False
    scan_data["ssh"] = ssh_data

# Custom Scripts
bin_scripts_list_filtered = [script.replace(os.environ.get('HOME', '~') + '/.bin/', '') for script in (os.environ.get('BIN_SCRIPTS', '').strip().split('\n') if os.environ.get('BIN_SCRIPTS', '').strip() else []) if script.strip()]
if bin_scripts_list_filtered:
    scan_data["custom_scripts"] = {
        "bin_directory": bin_scripts_list_filtered
    }

# Containerization & Orchestration
containers = {}
if docker_version:
    containers["docker"] = {
        "version": docker_version,
        "images": [x.strip() for x in docker_images_list if x.strip()],
        "compose_files": [x.strip() for x in docker_compose_files if x.strip()]
    }

if kubectl_version:
    containers["kubernetes"] = {
        "kubectl_version": kubectl_version,
        "contexts": kube_contexts
    }

if containers:
    scan_data["containerization"] = containers

# Cloud Platforms
cloud_platforms = {}
if aws_version:
    cloud_platforms["aws"] = {
        "version": aws_version,
        "profiles": [x.strip() for x in aws_profiles_list if x.strip()],
        "config": aws_config
    }

if gcloud_version:
    cloud_platforms["gcloud"] = {
        "version": gcloud_version,
        "configs": [x.strip() for x in gcloud_configs_list if x.strip()]
    }

if cloud_platforms:
    scan_data["cloud_platforms"] = cloud_platforms

# Infrastructure as Code
if terraform_version:
    scan_data["infrastructure_as_code"] = {
        "terraform": {
            "version": terraform_version
        }
    }

# Databases
if db_tools:
    scan_data["databases"] = {
        "tools": db_tools
    }

print(json.dumps(scan_data, indent=2, ensure_ascii=False))
PYTHON_EOF
  
  success "JSON file created"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  print_header
  
  # STAGE 1: System Information
  stage "SYSTEM METADATA"
  scan_system_info
  
  # STAGE 2: Package Managers
  HAS_PKG_MGR="false"
  [ -n "$(command -v brew 2>/dev/null)" ] && HAS_PKG_MGR="true"
  [ -n "$(command -v yarn 2>/dev/null)" ] && HAS_PKG_MGR="true"
  [ -n "$(command -v pnpm 2>/dev/null)" ] && HAS_PKG_MGR="true"
  [ -n "$(command -v bun 2>/dev/null)" ] && HAS_PKG_MGR="true"
  [ -n "$(command -v conda 2>/dev/null)" ] && HAS_PKG_MGR="true"
  
  if [ "$HAS_PKG_MGR" = "true" ]; then
    stage "PACKAGE MANAGERS"
    scan_homebrew
    scan_yarn
    scan_pnpm
    scan_bun
    scan_conda
  fi
  
  # STAGE 3: Applications
  stage "APPLICATIONS"
  scan_applications
  
  # STAGE 4: Development Environments
  HAS_IDE="false"
  [ -n "$(command -v code 2>/dev/null)" ] && HAS_IDE="true"
  [ -f "$HOME/.vimrc" ] && HAS_IDE="true"
  [ -d "$HOME/.config/nvim" ] && HAS_IDE="true"
  ls -d "$HOME/Library/Application Support/JetBrains"/* >/dev/null 2>&1 && HAS_IDE="true"
  
  if [ "$HAS_IDE" = "true" ]; then
    stage "DEVELOPMENT ENVIRONMENTS"
    scan_vscode
    scan_jetbrains
    scan_vim
  fi
  
  # STAGE 5: Terminal Configuration
  HAS_TERMINAL_CONFIG="false"
  [ -f "$HOME/.zshrc" ] || [ -f "$HOME/.bashrc" ] || [ -f "$HOME/.zprofile" ] && HAS_TERMINAL_CONFIG="true"
  [ -f "$HOME/Library/Preferences/com.googlecode.iterm2.plist" ] && HAS_TERMINAL_CONFIG="true"
  [ -d "$HOME/.bin" ] && HAS_TERMINAL_CONFIG="true"
  
  if [ "$HAS_TERMINAL_CONFIG" = "true" ]; then
    stage "TERMINAL CONFIGURATION"
    scan_shell_configs
    scan_iterm2
    scan_bin_scripts
  fi
  
  # STAGE 6: Version Managers & Runtimes
  HAS_VERSION_MGR="false"
  [ -d "$HOME/.nvm" ] && HAS_VERSION_MGR="true"
  [ -n "$(command -v npm 2>/dev/null)" ] && HAS_VERSION_MGR="true"
  [ -n "$(command -v pyenv 2>/dev/null)" ] && HAS_VERSION_MGR="true"
  [ -n "$(command -v pip3 2>/dev/null)" ] && HAS_VERSION_MGR="true"
  [ -n "$(command -v rbenv 2>/dev/null)" ] && HAS_VERSION_MGR="true"
  [ -n "$(command -v go 2>/dev/null)" ] && HAS_VERSION_MGR="true"
  [ -n "$(command -v rustc 2>/dev/null)" ] && HAS_VERSION_MGR="true"
  [ -n "$(command -v deno 2>/dev/null)" ] && HAS_VERSION_MGR="true"
  [ -d "$HOME/.sdkman" ] && HAS_VERSION_MGR="true"
  
  if [ "$HAS_VERSION_MGR" = "true" ]; then
    stage "VERSION MANAGERS & LANGUAGE RUNTIMES"
    scan_nvm
    scan_npm_globals
    scan_pyenv
    scan_pip_packages
    scan_rbenv
    scan_sdks
  fi
  
  # STAGE 7: Infrastructure & DevOps Tools
  HAS_DEVOPS="false"
  [ -n "$(command -v git 2>/dev/null)" ] && HAS_DEVOPS="true"
  [ -d "$HOME/.ssh" ] && HAS_DEVOPS="true"
  [ -n "$(command -v docker 2>/dev/null)" ] && HAS_DEVOPS="true"
  [ -n "$(command -v kubectl 2>/dev/null)" ] && HAS_DEVOPS="true"
  [ -n "$(command -v terraform 2>/dev/null)" ] && HAS_DEVOPS="true"
  [ -n "$(command -v aws 2>/dev/null)" ] && HAS_DEVOPS="true"
  [ -n "$(command -v gcloud 2>/dev/null)" ] && HAS_DEVOPS="true"
  
  if [ "$HAS_DEVOPS" = "true" ]; then
    stage "INFRASTRUCTURE & DEVOPS"
    scan_git_config
    scan_ssh_config
    scan_docker
    scan_kubernetes
    scan_terraform
    scan_aws_cli
    scan_gcloud
  fi
  
  # STAGE 8: Databases
  HAS_DB="false"
  [ -n "$(command -v psql 2>/dev/null)" ] && HAS_DB="true"
  [ -n "$(command -v mysql 2>/dev/null)" ] && HAS_DB="true"
  [ -n "$(command -v mongod 2>/dev/null)" ] && HAS_DB="true"
  [ -n "$(command -v redis-cli 2>/dev/null)" ] && HAS_DB="true"
  
  if [ "$HAS_DB" = "true" ]; then
    stage "DATABASES"
    scan_databases
  fi
  
  # Export variables for Python script
  export HOSTNAME MACOS_VERSION MACOS_BUILD HARDWARE_MODEL ARCH TIMESTAMP SCAN_VERSION
  export BREW_VERSION BREW_PREFIX BREW_FORMULAE BREW_CASKS BREW_TAPS
  export APP_NAMES
  export VSCODE_EXTENSIONS VSCODE_SETTINGS VSCODE_KEYBINDINGS
  export ZSHRC_CONTENT ZPROFILE_CONTENT ZSHENV_CONTENT
  export BASHRC_CONTENT BASH_PROFILE_CONTENT PROFILE_CONTENT
  export BIN_SCRIPTS
  export GIT_CONFIG GITCONFIG_CONTENT GITIGNORE_GLOBAL
  export SSH_CONFIG SSH_KEYS KNOWN_HOSTS_COUNT INCLUDE_SSH_KEYS SSH_PRIVATE_KEY_FILES
  export NVM_VERSIONS NVM_CURRENT NPM_GLOBALS
  export PYENV_VERSIONS PYENV_GLOBAL PIP_PACKAGES
  export RBENV_VERSIONS RBENV_GLOBAL
  export CONDA_VERSION CONDA_ENVS CONDA_CONFIG
  export YARN_VERSION YARN_GLOBAL YARN_CONFIG
  export PNPM_VERSION PNPM_GLOBAL
  export BUN_VERSION
  export DOCKER_VERSION DOCKER_IMAGES DOCKER_COMPOSE_FILES
  export AWS_VERSION AWS_PROFILES AWS_CONFIG
  export GCLOUD_VERSION GCLOUD_CONFIGS
  export ITERM2_INSTALLED
  export JETBRAINS_IDES
  export VIM_CONFIG NVIM_CONFIG
  export DB_TOOLS
  export TERRAFORM_VERSION
  export KUBECTL_VERSION KUBE_CONTEXTS
  export JENV_VERSION SDKMAN_INSTALLED RUST_VERSION GO_VERSION GOPATH_VAL DENO_VERSION
  
  # Generate JSON
  echo ""
  stage "GENERATING OUTPUT"
  step "Creating JSON file"
  generate_json
  
  # Create archive
  step "Creating archive"
  tar -czf "$OUTPUT_ARCHIVE" "$OUTPUT_JSON" 2>/dev/null
  success "Archive created: $OUTPUT_ARCHIVE"
  
  # Summary
  echo ""
  printf "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${GREEN}${BOLD}                        SCAN COMPLETE!${NC}\n"
  printf "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  echo ""
  printf "${BOLD}📄 Output Files:${NC}\n"
  printf "   • JSON:    ${CYAN}%s${NC}\n" "$OUTPUT_JSON"
  printf "   • Archive: ${CYAN}%s${NC}\n" "$OUTPUT_ARCHIVE"
  echo ""
  printf "${BOLD}📊 File Size:${NC}\n"
  ls -lh "$OUTPUT_JSON" | awk '{print "   • " $5 " (" $9 ")"}'
  echo ""
  printf "${BOLD}📋 Next Steps:${NC}\n"
  echo "   1. Review the JSON file to verify captured data"
  echo "   2. Upload to Baseline to generate restore script"
  echo "   3. Keep the archive in a safe location"
  echo ""
  if [ "$INCLUDE_SSH_KEYS" = "true" ]; then
    printf "${YELLOW}⚠  SECURITY WARNING:${NC} SSH private keys are INCLUDED in this scan!\n"
    echo "   Store this file securely and consider encrypting it."
    echo "   Do not share this file or upload it to untrusted locations."
  else
    printf "${YELLOW}⚠  Note:${NC} SSH private keys are not included for security.\n"
    echo "   You'll need to manually copy them or regenerate keys."
    echo "   Use --include-ssh-keys flag if you want to include them."
  fi
  echo ""
}

# Check for Python 3 (required for JSON generation)
if ! command -v python3 >/dev/null 2>&1; then
  printf "${RED}Error: Python 3 is required but not installed.${NC}\n"
  echo "Please install Python 3 and try again."
  exit 1
fi

# Run main function
main
