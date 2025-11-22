/**
 * Tool Enhancement Service
 * Augments static tools with real-time Homebrew data for better accuracy
 */

import { Tool } from '@/types/tools';
import { BrewPackage } from './brewService';

/**
 * Create a lookup map from Homebrew packages
 */
export function createBrewLookup(brewPackages: BrewPackage[]): Map<string, BrewPackage> {
  const lookup = new Map<string, BrewPackage>();
  
  brewPackages.forEach(pkg => {
    // Index by install command for exact matching
    const installCmd = pkg.installCommand.toLowerCase();
    lookup.set(installCmd, pkg);
    
    // Also index by package name for easier lookup
    lookup.set(pkg.name.toLowerCase(), pkg);
  });
  
  return lookup;
}

/**
 * Enhance a static tool with Homebrew data if available
 */
export function enhanceToolWithBrewData(
  tool: Tool, 
  brewLookup: Map<string, BrewPackage>
): Tool {
  // If tool already has URL, return as-is
  if (tool.url) {
    return tool;
  }
  
  // Try to find matching Homebrew package
  const installCmd = tool.installCommand.toLowerCase();
  const brewPkg = brewLookup.get(installCmd) || brewLookup.get(tool.name.toLowerCase());
  
  if (brewPkg && brewPkg.url) {
    return {
      ...tool,
      url: brewPkg.url,
      description: tool.description || brewPkg.description,
      version: tool.version || brewPkg.version,
    };
  }
  
  return tool;
}

/**
 * Enhance multiple tools with Homebrew data
 */
export function enhanceToolsWithBrewData(
  tools: Tool[], 
  brewPackages: BrewPackage[]
): Tool[] {
  const brewLookup = createBrewLookup(brewPackages);
  return tools.map(tool => enhanceToolWithBrewData(tool, brewLookup));
}

/**
 * Extract package name from install command
 */
export function extractPackageName(installCommand: string): string | null {
  // Handle different install command formats
  const patterns = [
    /brew install --cask (.+)/,
    /brew install (.+)/,
    /npm install -g (.+)/,
    /mas install (.+)/,
  ];
  
  for (const pattern of patterns) {
    const match = installCommand.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}
