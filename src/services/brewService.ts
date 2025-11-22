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
  homepage: string;
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
  homepage: string;
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
  homepage: string;
  version: string;
  type: 'formula' | 'cask';
  category: string;
  deprecated: boolean;
  disabled: boolean;
  popular: boolean;
  installCommand: string;
}

// Cache for API responses
let formulaCache: BrewFormula[] | null = null;
let caskCache: BrewCask[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Fetch all Homebrew formulas
 */
export async function fetchFormulas(): Promise<BrewFormula[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (formulaCache && (now - lastFetchTime) < CACHE_DURATION) {
    return formulaCache;
  }

  try {
    const response = await fetch('https://formulae.brew.sh/api/formula.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: BrewFormula[] = await response.json();
    formulaCache = data;
    lastFetchTime = now;
    return data;
  } catch (error) {
    console.error('Error fetching Homebrew formulas:', error);
    return formulaCache || [];
  }
}

/**
 * Fetch all Homebrew casks
 */
export async function fetchCasks(): Promise<BrewCask[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (caskCache && (now - lastFetchTime) < CACHE_DURATION) {
    return caskCache;
  }

  try {
    const response = await fetch('https://formulae.brew.sh/api/cask.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: BrewCask[] = await response.json();
    caskCache = data;
    return data;
  } catch (error) {
    console.error('Error fetching Homebrew casks:', error);
    return caskCache || [];
  }
}

/**
 * Categorize packages based on their description and metadata
 */
function categorizePackage(name: string, desc: string | null | undefined, type: 'formula' | 'cask'): string {
  const lowerName = name.toLowerCase();
  const lowerDesc = (desc || '').toLowerCase();
  
  // Applications (GUI tools)
  if (type === 'cask' || 
      lowerDesc.includes('gui') || 
      lowerDesc.includes('application') ||
      lowerName.match(/^(vscode|chrome|firefox|slack|docker|postman|figma|sketch)/)) {
    return 'applications';
  }
  
  // Package managers and runtimes
  if (lowerName.match(/^(node|python|ruby|go|rust|java|php|perl)/) ||
      lowerDesc.includes('programming language') ||
      lowerDesc.includes('runtime') ||
      lowerDesc.includes('version manager') ||
      lowerName.includes('nvm') ||
      lowerName.includes('pyenv') ||
      lowerName.includes('rbenv')) {
    return 'package-managers';
  }
  
  // DevOps and infrastructure
  if (lowerDesc.includes('kubernetes') ||
      lowerDesc.includes('docker') ||
      lowerDesc.includes('container') ||
      lowerDesc.includes('cloud') ||
      lowerDesc.includes('deployment') ||
      lowerDesc.includes('infrastructure') ||
      lowerName.match(/^(kubectl|helm|terraform|ansible|vagrant)/)) {
    return 'devops';
  }
  
  // CLI tools (default)
  return 'cli-tools';
}

/**
 * Check if package is popular based on analytics
 */
function isPopular(analytics?: Record<string, any>): boolean {
  if (!analytics || !analytics.install) return false;
  
  // Get most recent 30 day install count
  const installCounts = Object.values(analytics.install) as number[];
  const recentInstalls = installCounts.slice(-1)[0] || 0;
  
  // Consider popular if > 10k installs in last 30 days
  return recentInstalls > 10000;
}

/**
 * Convert Homebrew formula to our package format
 */
function formulaToPackage(formula: BrewFormula): BrewPackage {
  const description = formula.desc || 'No description available';
  return {
    id: `formula-${formula.name}`,
    name: formula.name,
    description,
    homepage: formula.homepage || '',
    version: formula.versions?.stable || 'unknown',
    type: 'formula',
    category: categorizePackage(formula.name, description, 'formula'),
    deprecated: formula.deprecated || false,
    disabled: formula.disabled || false,
    popular: isPopular(formula.analytics),
    installCommand: `brew install ${formula.name}`,
  };
}

/**
 * Convert Homebrew cask to our package format
 */
function caskToPackage(cask: BrewCask): BrewPackage {
  const description = cask.desc || 'No description available';
  const name = (cask.name && cask.name[0]) || cask.token;
  return {
    id: `cask-${cask.token}`,
    name,
    description,
    homepage: cask.homepage || '',
    version: cask.version || 'latest',
    type: 'cask',
    category: categorizePackage(cask.token, description, 'cask'),
    deprecated: cask.deprecated || false,
    disabled: cask.disabled || false,
    popular: isPopular(cask.analytics),
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
  lastFetchTime = 0;
}
