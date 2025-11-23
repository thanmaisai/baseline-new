/**
 * Icon Service - Dynamically fetches application logos
 * Uses multiple CDN sources as fallbacks
 */

// Cache for successfully loaded icons
const iconCache = new Map<string, string>();

interface IconSource {
  name: string;
  getUrl: (appName: string) => string;
  priority: number;
}

// Map of common app names to their proper identifiers
const APP_NAME_MAPPINGS: Record<string, string> = {
  'vscode': 'visual-studio-code',
  'vs code': 'visual-studio-code',
  'visual studio code': 'visual-studio-code',
  'google chrome': 'google-chrome',
  'arc browser': 'arc',
  'brave browser': 'brave',
  'firefox': 'firefox',
  'safari': 'safari',
  'docker': 'docker',
  'figma': 'figma',
  'slack': 'slack',
  'notion': 'notion',
  'spotify': 'spotify',
  'postman': 'postman',
  'github': 'github',
  'git': 'git',
  'google chat': 'googlechat',
  'google-chat': 'googlechat',
  'chatgpt': 'openai',
  'chatgpt atlas': 'openai',
  'node': 'node-dot-js',
  'nodejs': 'node-dot-js',
  'python': 'python',
  'postgres': 'postgresql',
  'postgresql': 'postgresql',
  'mongodb': 'mongodb',
  'redis': 'redis',
  'mysql': 'mysql',
  'mariadb': 'mariadb',
  'clickhouse': 'clickhouse',
  'cockroachdb': 'cockroachdb',
  'elasticsearch': 'elasticsearch',
  'dynamodb': 'amazonaws',
  'cassandra': 'apachecassandra',
  'dbeaver': 'dbeaver',
  'github desktop': 'github',
  'lens': 'lens',
  'orbstack': 'orbstack',
  'podman': 'podman',
  'podman desktop': 'podman',
  'zoom': 'zoom',
  'discord': 'discord',
  'telegram': 'telegram',
  'whatsapp': 'whatsapp',
  'obsidian': 'obsidian',
  'raycast': 'raycast',
  'rectangle': 'rectangle',
  'iterm': 'iterm2',
  'iterm2': 'iterm2',
  'warp': 'warp',
  'homebrew': 'homebrew',
  '1password': '1password',
  'bitwarden': 'bitwarden',
  'vlc': 'vlc',
  'typescript': 'typescript',
  'javascript': 'javascript',
  'react': 'react',
  'vue': 'vue-dot-js',
  'angular': 'angular',
  'kubernetes': 'kubernetes',
  'terraform': 'terraform',
  'aws': 'amazon-aws',
  'intellij': 'intellij-idea',
  'pycharm': 'pycharm',
  'webstorm': 'webstorm',
  'android studio': 'android-studio',
  'xcode': 'xcode',
  'sublime text': 'sublime-text',
  'atom': 'atom',
  'vim': 'vim',
  'neovim': 'neovim',
  'tableplus': 'tableplus',
  'conda': 'anaconda',
  'miniconda': 'anaconda',
  'anaconda': 'anaconda',
  'bun': 'bun',
  'cargo': 'rust',
  'composer': 'composer',
  'npm': 'npm',
  'yarn': 'yarn',
  'pnpm': 'pnpm',
  'pip': 'pypi',
  'pipx': 'pypi',
  'poetry': 'poetry',
  'maven': 'apachemaven',
  'gradle': 'gradle',
  'go': 'go',
  'golang': 'go',
  'rust': 'rust',
  'ruby': 'ruby',
  'php': 'php',
  'java': 'openjdk',
  'openjdk': 'openjdk',
  'dotnet': 'dotnet',
  '.net': 'dotnet',
  'fnm': 'fnm',
  'conan': 'conan',
  'cocoapods': 'cocoapods',
  'rbenv': 'ruby',
  'pyenv': 'python',
  'jenv': 'openjdk',
  'gvm': 'go',
  'rvm': 'ruby',
  'asdf': 'asdf',
  'sdkman': 'openjdk',
};

// Tools that should use emoji fallback (no reliable logo sources)
const USE_EMOJI_FALLBACK: Set<string> = new Set([
  'duckdb',
  'kind',
]);

// Icon sources with fallback priority
const ICON_SOURCES: IconSource[] = [
  {
    name: 'Simple Icons',
    getUrl: (appName: string) => {
      const slug = normalizeAppName(appName);
      return `https://cdn.simpleicons.org/${slug}`;
    },
    priority: 1,
  },
  {
    name: 'DevIcon',
    getUrl: (appName: string) => {
      const slug = normalizeAppName(appName);
      return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;
    },
    priority: 2,
  },
  {
    name: 'Icon Horse',
    getUrl: (appName: string) => {
      const slug = normalizeAppName(appName);
      return `https://icon.horse/icon/${slug}`;
    },
    priority: 3,
  },
];

/**
 * Normalize app name to slug format
 */
function normalizeAppName(appName: string): string {
  const lower = appName.toLowerCase().trim();
  
  // Check if we have a mapping
  if (APP_NAME_MAPPINGS[lower]) {
    return APP_NAME_MAPPINGS[lower];
  }
  
  // Convert to slug format
  return lower
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get the icon URL for an application
 * This works for ANY application, not just hardcoded ones!
 */
export function getAppIcon(appName: string, url?: string): string {
  const slug = normalizeAppName(appName);
  
  // Primary: Simple Icons (2000+ logos)
  // Works for: Chrome, Firefox, Slack, VS Code, Docker, Figma, GitHub, etc.
  return `https://cdn.simpleicons.org/${slug}`;
}

/**
 * Get multiple fallback URLs for an icon
 * Tries multiple CDNs automatically for ANY app
 */
export function getAppIconFallbacks(appName: string, url?: string): string[] {
  // Check cache first
  const cacheKey = `${appName}-${url || ''}`;
  if (iconCache.has(cacheKey)) {
    return [iconCache.get(cacheKey)!];
  }
  
  const urls: string[] = [];
  const slug = normalizeAppName(appName);
  const lowerName = appName.toLowerCase();
  
  // If tool should use emoji fallback, return empty array to trigger emoji
  if (USE_EMOJI_FALLBACK.has(lowerName)) {
    return [];
  }
  
  // PRIORITY 1: Simple Icons - 2000+ brand logos (best for known brands)
  // This is reliable and not blocked by ad blockers
  urls.push(`https://cdn.simpleicons.org/${slug}`);
  
  // PRIORITY 2: DevIcon - excellent for developer tools and languages
  urls.push(`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`);
  urls.push(`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-plain.svg`);
  
  // PRIORITY 3: If URL is provided, try domain-based fallbacks (ad-blocker friendly)
  if (url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // Use Google's favicon service and icon.horse (not blocked by ad blockers)
      urls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
      urls.push(`https://icon.horse/icon/${domain}`);
      
      // Also try the root domain if it's a subdomain
      const parts = domain.split('.');
      if (parts.length > 2) {
        const rootDomain = parts.slice(-2).join('.');
        urls.push(`https://www.google.com/s2/favicons?domain=${rootDomain}&sz=256`);
        urls.push(`https://icon.horse/icon/${rootDomain}`);
      }
    } catch (e) {
      // Invalid URL, continue with other methods
    }
  }
  
  // PRIORITY 4: Try app name as domain guess (only if we have a mapping or URL)
  if (url || APP_NAME_MAPPINGS[lowerName]) {
    urls.push(`https://www.google.com/s2/favicons?domain=${slug}.com&sz=256`);
    urls.push(`https://icon.horse/icon/${slug}.com`);
  }
  
  return urls;
}

/**
 * Cache a working icon URL
 */
export function cacheIconUrl(appName: string, toolUrl: string | undefined, iconUrl: string): void {
  const cacheKey = `${appName}-${toolUrl || ''}`;
  iconCache.set(cacheKey, iconUrl);
}

/**
 * Preload an image to check if it exists
 */
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Get the first working icon URL from fallbacks
 */
export async function getWorkingIcon(appName: string, url?: string): Promise<string | null> {
  const fallbacks = getAppIconFallbacks(appName, url);
  
  for (const url of fallbacks) {
    const works = await preloadImage(url);
    if (works) {
      return url;
    }
  }
  
  return null;
}

/**
 * Get default fallback emoji based on category
 */
export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'browsers': '🌐',
    'dev-tools': '💻',
    'design-tools': '🎨',
    'communication': '💬',
    'productivity': '📝',
    'languages': '⚡',
    'devops': '🚀',
    'databases': '💾',
    'terminal': '⌨️',
    'cli-tools': '🔧',
    'media': '🎵',
    'security': '🔒',
    'utilities': '⚙️',
  };
  
  return emojiMap[category] || '📦';
}
