import { useState, useEffect, useCallback } from 'react';
import { 
  getAllPackages, 
  searchPackages, 
  getPackagesByCategory,
  getPopularPackages,
  clearCache,
  type BrewPackage 
} from '@/services/brewService';

interface UseBrewPackagesResult {
  packages: BrewPackage[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterByCategory: (category: string | null) => void;
  refreshData: () => void;
  totalCount: number;
}

export function useBrewPackages(initialCategory?: string): UseBrewPackagesResult {
  const [packages, setPackages] = useState<BrewPackage[]>([]);
  const [allPackages, setAllPackages] = useState<BrewPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<string | null>(initialCategory || null);

  // Load all packages on mount
  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAllPackages();
      setAllPackages(data);
      
      // Apply initial category filter if provided
      if (currentCategory) {
        const filtered = data.filter(pkg => pkg.category === currentCategory);
        setPackages(filtered);
      } else {
        setPackages(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packages');
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      // No search query, show filtered by category
      if (currentCategory) {
        setPackages(allPackages.filter(pkg => pkg.category === currentCategory));
      } else {
        setPackages(allPackages);
      }
      return;
    }

    // Debounce search
    const timeoutId = setTimeout(async () => {
      const lowerQuery = searchQuery.toLowerCase();
      let filtered = allPackages.filter(pkg =>
        pkg.name.toLowerCase().includes(lowerQuery) ||
        pkg.description.toLowerCase().includes(lowerQuery)
      );

      if (currentCategory) {
        filtered = filtered.filter(pkg => pkg.category === currentCategory);
      }

      // Sort by relevance
      filtered.sort((a, b) => {
        const aExact = a.name.toLowerCase() === lowerQuery;
        const bExact = b.name.toLowerCase() === lowerQuery;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        
        return a.name.localeCompare(b.name);
      });

      setPackages(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentCategory, allPackages]);

  const filterByCategory = useCallback((category: string | null) => {
    setCurrentCategory(category);
    setSearchQuery(''); // Reset search when changing category
  }, []);

  const refreshData = useCallback(() => {
    clearCache();
    loadPackages();
  }, [loadPackages]);

  return {
    packages,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filterByCategory,
    refreshData,
    totalCount: allPackages.length,
  };
}

/**
 * Hook to get popular packages
 */
export function usePopularPackages(limit: number = 50) {
  const [packages, setPackages] = useState<BrewPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getPopularPackages(limit);
        setPackages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load popular packages');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [limit]);

  return { packages, loading, error };
}
