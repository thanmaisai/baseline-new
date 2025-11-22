import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [allPackages, setAllPackages] = useState<BrewPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<string | null>(initialCategory || null);

  // Debounce search query with 300ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load all packages on mount
  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAllPackages();
      setAllPackages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packages');
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Memoized filtered packages
  const packages = useMemo(() => {
    let filtered = allPackages;

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(lowerQuery) ||
        pkg.description.toLowerCase().includes(lowerQuery)
      );

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
    }

    // Apply category filter
    if (currentCategory) {
      filtered = filtered.filter(pkg => pkg.category === currentCategory);
    }

    // Sort by popular first if no search
    if (!debouncedSearchQuery.trim()) {
      filtered.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return filtered;
  }, [allPackages, debouncedSearchQuery, currentCategory]);

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
