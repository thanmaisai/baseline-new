/**
 * Homebrew API Service
 * Fetches real-time data from Homebrew's official API
 */

export interface BrewFormula {
  name: string;
  full_name: string;
  tap: string;
  oldname?: string;
  aliases: string[];
  versioned_formulae: string[];
  desc: string;
  license?: string;
  homepage: string; // Homebrew API returns 'homepage'
  versions: {
    stable: string;
    head?: string;
    bottle: boolean;
  };
  urls: {
    stable?: {
      url: string;
      tag?: string;
      revision?: string;
    };
  };
  revision: number;
  version_scheme: number;
  bottle: {
    stable: {
      rebuild: number;
      root_url: string;
      files: Record<string, any>;
    };
  };
  keg_only: boolean;
  keg_only_reason?: {
    reason: string;
    explanation: string;
  };
  options: any[];
  build_dependencies: string[];
  dependencies: string[];
  test_dependencies: string[];
  recommended_dependencies: string[];
  optional_dependencies: string[];
  uses_from_macos: string[];
  requirements: any[];
  conflicts_with: string[];
  conflicts_with_reasons: string[];
  link_overwrite: string[];
  caveats?: string;
  installed: any[];
  linked_keg?: string;
  pinned: boolean;
  outdated: boolean;
  deprecated: boolean;
  deprecation_date?: string;
  deprecation_reason?: string;
  disabled: boolean;
  disable_date?: string;
  disable_reason?: string;
  analytics: {
    install: Record<string, number>;
    install_on_request: Record<string, number>;
    build_error: Record<string, number>;
  };
}

export interface BrewCask {
  token: string;
  full_token: string;
  tap: string;
  name: string[];
  desc: string;
  homepage: string; // Homebrew API returns 'homepage'
  url: string;
  url_specs?: Record<string, any>;
  appcast?: string;
  version: string;
  versions?: Record<string, any>;
  installed?: string;
  outdated: boolean;
  sha256: string;
  artifacts: any[];
  caveats?: string;
  depends_on: Record<string, any>;
  conflicts_with?: {
    cask?: string[];
    formula?: string[];
  };
  container?: any;
  auto_updates: boolean;
  deprecated: boolean;
  deprecation_date?: string;
  deprecation_reason?: string;
  disabled: boolean;
  disable_date?: string;
  disable_reason?: string;
  analytics?: {
    install: Record<string, number>;
    install_on_request?: Record<string, number>;
  };
}

export interface BrewPackage {
  id: string;
  name: string;
  description: string;
  url: string;
  version: string;
  type: 'formula' | 'cask';
  category: string;
  deprecated: boolean;
  disabled: boolean;
  popular: boolean;
  installCommand: string;
}

// Cache for API responses with separate timestamps
let formulaCache: BrewFormula[] | null = null;
let caskCache: BrewCask[] | null = null;
let lastFormulaFetchTime = 0;
let lastCaskFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// In-flight request tracking to prevent duplicate requests
let formulaFetchPromise: Promise<BrewFormula[]> | null = null;
let caskFetchPromise: Promise<BrewCask[]> | null = null;

/**
 * Fetch all Homebrew formulas with optimized caching
 */
export async function fetchFormulas(): Promise<BrewFormula[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (formulaCache && (now - lastFormulaFetchTime) < CACHE_DURATION) {
    return formulaCache;
  }

  // Return in-flight request if one exists
  if (formulaFetchPromise) {
    return formulaFetchPromise;
  }

  // Create new fetch promise
  formulaFetchPromise = (async () => {
    try {
      const response = await fetch('https://formulae.brew.sh/api/formula.json', {
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BrewFormula[] = await response.json();
      
      // Update cache
      formulaCache = data;
      lastFormulaFetchTime = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching Homebrew formulas:', error);
      // Return cached data if available, otherwise empty array
      return formulaCache || [];
    } finally {
      // Clear in-flight promise
      formulaFetchPromise = null;
    }
  })();

  return formulaFetchPromise;
}

/**
 * Fetch all Homebrew casks with optimized caching
 */
export async function fetchCasks(): Promise<BrewCask[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (caskCache && (now - lastCaskFetchTime) < CACHE_DURATION) {
    return caskCache;
  }

  // Return in-flight request if one exists
  if (caskFetchPromise) {
    return caskFetchPromise;
  }

  // Create new fetch promise
  caskFetchPromise = (async () => {
    try {
      const response = await fetch('https://formulae.brew.sh/api/cask.json', {
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BrewCask[] = await response.json();
      
      // Update cache
      caskCache = data;
      lastCaskFetchTime = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching Homebrew casks:', error);
      // Return cached data if available, otherwise empty array
      return caskCache || [];
    } finally {
      // Clear in-flight promise
      caskFetchPromise = null;
    }
  })();

  return caskFetchPromise;
}

/**
 * Categorize packages based on their description and metadata
 */
function categorizePackage(name: string, desc: string | null | undefined, type: 'formula' | 'cask'): string {
  const lowerName = name.toLowerCase();
  const lowerDesc = (desc || '').toLowerCase();
  
  // Browsers
  if (lowerName.match(/chrome|firefox|safari|edge|brave|opera|arc|vivaldi/) ||
      lowerDesc.includes('web browser') || lowerDesc.includes('browser')) {
    return 'browsers';
  }
  
  // Development Tools (Editors, IDEs, API tools)
  if (lowerName.match(/vscode|visual-studio|sublime|atom|webstorm|pycharm|intellij|code|cursor|zed/) ||
      lowerName.match(/postman|insomnia|bruno|hoppscotch|paw/) ||
      lowerDesc.includes('code editor') || lowerDesc.includes('ide') || 
      lowerDesc.includes('api client') || lowerDesc.includes('api testing')) {
    return 'dev-tools';
  }
  
  // Design Tools
  if (lowerName.match(/figma|sketch|adobe|photoshop|illustrator|affinity|canva/) ||
      lowerDesc.includes('design') || lowerDesc.includes('graphics') ||
      lowerDesc.includes('illustration') || lowerDesc.includes('photo edit')) {
    return 'design-tools';
  }
  
  // Communication (Chat, Email, Video)
  if (lowerName.match(/slack|discord|teams|zoom|skype|telegram|whatsapp|signal/) ||
      lowerName.match(/outlook|thunderbird|spark|airmail/) ||
      lowerDesc.includes('messaging') || lowerDesc.includes('chat') ||
      lowerDesc.includes('video conferenc') || lowerDesc.includes('email client')) {
    return 'communication';
  }
  
  // Productivity (Note-taking, Task management, Office)
  if (lowerName.match(/notion|obsidian|evernote|onenote|bear|simplenote/) ||
      lowerName.match(/todoist|things|omnifocus|taskwarrior/) ||
      lowerName.match(/office|word|excel|pages|numbers|keynote/) ||
      lowerDesc.includes('note') || lowerDesc.includes('task') ||
      lowerDesc.includes('productivity') || lowerDesc.includes('office suite')) {
    return 'productivity';
  }
  
  // Programming Languages & Runtimes
  if (lowerName.match(/^(node|python|ruby|go|golang|rust|java|openjdk|php|perl|scala|kotlin|swift)$/) ||
      lowerName.match(/nvm|pyenv|rbenv|jenv|goenv|rustup/) ||
      lowerDesc.includes('programming language') || lowerDesc.includes('runtime') ||
      lowerDesc.includes('version manager')) {
    return 'languages';
  }
  
  // DevOps & Cloud Tools
  if (lowerName.match(/docker|kubernetes|kubectl|helm|terraform|ansible|vagrant|packer/) ||
      lowerName.match(/aws|gcloud|azure|heroku/) ||
      lowerDesc.includes('container') || lowerDesc.includes('orchestration') ||
      lowerDesc.includes('infrastructure') || lowerDesc.includes('deployment') ||
      lowerDesc.includes('cloud')) {
    return 'devops';
  }
  
  // Databases
  if (lowerName.match(/postgres|mysql|mongodb|redis|sqlite|mariadb|cassandra/) ||
      lowerDesc.includes('database') || lowerDesc.includes('data store')) {
    return 'databases';
  }
  
  // Terminal & CLI Tools
  if (type === 'formula' && !lowerDesc.includes('library')) {
    if (lowerName.match(/zsh|bash|fish|tmux|screen|iterm|alacritty|kitty|warp/) ||
        lowerDesc.includes('terminal') || lowerDesc.includes('shell')) {
      return 'terminal';
    }
    return 'cli-tools';
  }
  
  // Media & Entertainment
  if (lowerName.match(/spotify|vlc|mpv|iina|plex|kodi/) ||
      lowerDesc.includes('music') || lowerDesc.includes('video player') ||
      lowerDesc.includes('media player') || lowerDesc.includes('streaming')) {
    return 'media';
  }
  
  // Security & Privacy
  if (lowerName.match(/1password|bitwarden|keepass|lastpass|nordvpn|expressvpn/) ||
      lowerDesc.includes('password') || lowerDesc.includes('vpn') ||
      lowerDesc.includes('security') || lowerDesc.includes('encryption')) {
    return 'security';
  }
  
  // Utilities
  if (type === 'cask') {
    return 'utilities';
  }
  
  // Default for formulas
  return 'cli-tools';
}

/**
 * Check if a package is popular based on analytics
 */
function isPopular(analytics?: Record<string, any>): boolean {
  if (!analytics || !analytics.install) return false;
  
  // Get most recent 30 day install count
  const installCounts = Object.values(analytics.install) as number[];
  const recentInstalls = installCounts.slice(-1)[0] || 0;
  
  // Consider popular if > 1k installs in last 30 days
  return recentInstalls > 1000;
}

/**
 * Convert Homebrew formula to our package format
 */
function formulaToPackage(formula: BrewFormula): BrewPackage {
  const description = formula.desc || 'No description available';
  const lowerName = formula.name.toLowerCase();
  
  // Well-known tools should always be marked as popular
  const wellKnownTools = /^(git|node|python|go|rust|docker|kubernetes|kubectl|terraform|ansible|postgres|mysql|mongodb|redis|nginx|apache|vim|neovim|tmux|wget|curl|jq|tree|htop|ffmpeg)$/;
  const isWellKnown = wellKnownTools.test(lowerName);
  
  return {
    id: `formula-${formula.name}`,
    name: formula.name,
    description,
    url: formula.homepage || '',  // Map Homebrew's homepage to our url field
    version: formula.versions?.stable || 'unknown',
    type: 'formula',
    category: categorizePackage(formula.name, description, 'formula'),
    deprecated: formula.deprecated || false,
    disabled: formula.disabled || false,
    popular: isWellKnown || isPopular(formula.analytics),
    installCommand: `brew install ${formula.name}`,
  };
}

/**
 * Convert Homebrew cask to our package format
 */
function caskToPackage(cask: BrewCask): BrewPackage {
  const description = cask.desc || 'No description available';
  const name = (cask.name && cask.name[0]) || cask.token;
  const lowerToken = cask.token.toLowerCase();
  
  // Well-known applications should always be marked as popular
  const wellKnownApps = /^(visual-studio-code|google-chrome|firefox|brave-browser|arc|slack|discord|zoom|docker|figma|notion|obsidian|1password|postman|insomnia|bruno|iterm2|warp|sublime-text|spotify|vlc|iina|whatsapp|telegram|signal)$/;
  const isWellKnown = wellKnownApps.test(lowerToken);
  
  return {
    id: `cask-${cask.token}`,
    name,
    description,
    url: cask.homepage || '',  // Map Homebrew's homepage to our url field
    version: cask.version || 'latest',
    type: 'cask',
    category: categorizePackage(cask.token, description, 'cask'),
    deprecated: cask.deprecated || false,
    disabled: cask.disabled || false,
    popular: isWellKnown || isPopular(cask.analytics),
    installCommand: `brew install --cask ${cask.token}`,
  };
}

/**
 * Get all packages (formulas + casks)
 */
export async function getAllPackages(): Promise<BrewPackage[]> {
  const [formulas, casks] = await Promise.all([
    fetchFormulas(),
    fetchCasks(),
  ]);

  const formulaPackages = formulas
    .filter(f => !f.deprecated && !f.disabled)
    .map(f => {
      try {
        return formulaToPackage(f);
      } catch (error) {
        console.warn(`Error processing formula ${f.name}:`, error);
        return null;
      }
    })
    .filter((pkg): pkg is BrewPackage => pkg !== null);
    
  const caskPackages = casks
    .filter(c => !c.deprecated && !c.disabled)
    .map(c => {
      try {
        return caskToPackage(c);
      } catch (error) {
        console.warn(`Error processing cask ${c.token}:`, error);
        return null;
      }
    })
    .filter((pkg): pkg is BrewPackage => pkg !== null);

  return [...formulaPackages, ...caskPackages];
}

/**
 * Search packages by query
 */
export async function searchPackages(query: string, category?: string): Promise<BrewPackage[]> {
  const allPackages = await getAllPackages();
  const lowerQuery = query.toLowerCase();

  let filtered = allPackages.filter(pkg => 
    pkg.name.toLowerCase().includes(lowerQuery) ||
    pkg.description.toLowerCase().includes(lowerQuery)
  );

  if (category) {
    filtered = filtered.filter(pkg => pkg.category === category);
  }

  // Sort by relevance (exact match first, then popular, then alphabetical)
  return filtered.sort((a, b) => {
    const aExact = a.name.toLowerCase() === lowerQuery;
    const bExact = b.name.toLowerCase() === lowerQuery;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get packages by category
 */
export async function getPackagesByCategory(category: string): Promise<BrewPackage[]> {
  const allPackages = await getAllPackages();
  return allPackages
    .filter(pkg => pkg.category === category)
    .sort((a, b) => {
      // Popular first
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Get popular packages across all categories
 */
export async function getPopularPackages(limit: number = 50): Promise<BrewPackage[]> {
  const allPackages = await getAllPackages();
  return allPackages
    .filter(pkg => pkg.popular)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
}

/**
 * Clear cache (useful for forcing refresh)
 */
export function clearCache(): void {
  formulaCache = null;
  caskCache = null;
  lastFormulaFetchTime = 0;
  lastCaskFetchTime = 0;
  formulaFetchPromise = null;
  caskFetchPromise = null;
}
