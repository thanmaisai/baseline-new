import { Tool } from '@/types/tools';
import { Check, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { getAppIconFallbacks, getCategoryEmoji, cacheIconUrl } from '@/utils/iconService';

interface ToolCardProps {
  tool: Tool;
  selected: boolean;
  onToggle: () => void;
}

export const ToolCard = ({ tool, selected, onToggle }: ToolCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentIconUrl, setCurrentIconUrl] = useState<string>('');
  const [iconLoaded, setIconLoaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const fallbackEmoji = tool.icon || getCategoryEmoji(tool.category);

  // Preload icon and find working URL before rendering
  useEffect(() => {
    let isMounted = true;
    setIsPreloading(true);
    setIconLoaded(false);
    
    const fallbackUrls = getAppIconFallbacks(tool.name, tool.url);
    
    // If we have cached URL, use it immediately
    if (fallbackUrls.length === 1) {
      setCurrentIconUrl(fallbackUrls[0]);
      setIconLoaded(true);
      setIsPreloading(false);
      return;
    }
    
    const findWorkingIcon = async () => {
      // Test URLs with stricter validation
      const testUrl = (url: string): Promise<{ url: string; works: boolean }> => {
        return new Promise((resolve) => {
          const img = new Image();
          
          img.onload = () => {
            // Verify it's a valid image (not a placeholder or error page)
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              resolve({ url, works: true });
            } else {
              resolve({ url, works: false });
            }
          };
          
          img.onerror = () => resolve({ url, works: false });
          img.src = url;
          
          // Timeout after 1 second (faster = better UX)
          setTimeout(() => resolve({ url, works: false }), 1000);
        });
      };
      
      // Test first 3 URLs in parallel for speed
      const firstBatch = fallbackUrls.slice(0, 3);
      const results = await Promise.all(firstBatch.map(testUrl));
      
      // Find first working URL
      const working = results.find(r => r.works);
      
      if (working && isMounted) {
        setCurrentIconUrl(working.url);
        setIconLoaded(true);
        setIsPreloading(false);
        cacheIconUrl(tool.name, tool.url, working.url);
        return;
      }
      
      // If first batch failed, try next 2 URLs only (don't waste time on bad sources)
      for (let i = 3; i < Math.min(5, fallbackUrls.length); i++) {
        if (!isMounted) break;
        
        const result = await testUrl(fallbackUrls[i]);
        if (result.works && isMounted) {
          setCurrentIconUrl(result.url);
          setIconLoaded(true);
          setIsPreloading(false);
          cacheIconUrl(tool.name, tool.url, result.url);
          return;
        }
      }
      
      // If no icon works after testing 5 URLs, show emoji (better than wrong icon)
      if (isMounted) {
        setIconLoaded(true);
        setIsPreloading(false);
      }
    };
    
    findWorkingIcon();
    
    return () => {
      isMounted = false;
    };
  }, [tool.name, tool.url]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer"
      style={{
        // @ts-ignore
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      }}
    >
      {isPreloading ? (
        // Shimmer Loading Card
        <div className="relative overflow-hidden rounded-xl h-[180px] flex flex-col bg-card border border-border">
          {/* Top border indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-muted to-muted/50" />
          
          {/* Shimmer overlay effect */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
          
          <div className="relative z-10 p-5 flex-1 flex flex-col">
            {/* Icon and badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-muted/60 rounded-xl flex-shrink-0 animate-pulse" />
              <div className="px-2.5 py-1 bg-muted/40 rounded-full w-20 h-6 animate-pulse" />
            </div>

            {/* Title and description */}
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted/60 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted/40 rounded w-full animate-pulse" />
              <div className="h-4 bg-muted/40 rounded w-5/6 animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        // Loaded Card
        <div
          className={`relative overflow-hidden rounded-xl h-[220px] flex flex-col transition-all duration-200 ${
            selected
              ? 'bg-primary/5 border-2 border-primary/60'
              : 'bg-card border border-border hover:border-primary/50 hover:shadow-md'
          }`}
        >
          {/* Top colored border */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-200 ${
            selected
              ? 'bg-primary'
              : tool.devPick
              ? 'bg-pink-500'
              : tool.popular 
              ? 'bg-orange-500' 
              : 'bg-muted'
          }`} />

          <div className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              {/* Icon */}
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-border/50 shadow-sm overflow-hidden">
                {currentIconUrl && iconLoaded ? (
                  <img
                    src={currentIconUrl}
                    alt={tool.name}
                    className="w-8 h-8 object-contain animate-in fade-in duration-300"
                  />
                ) : (
                  <span className="text-2xl animate-in fade-in duration-300">{fallbackEmoji}</span>
                )}
              </div>

              {/* Top Right Badge */}
              {(tool.popular || tool.devPick) && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                  tool.devPick
                    ? 'bg-pink-50 text-pink-600 border-pink-200'
                    : 'bg-orange-50 text-orange-600 border-orange-200'
                }`}>
                  {tool.devPick ? (
                    <>
                      <span className="text-xs">💗</span>
                      <span>Dev Pick</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs">🔥</span>
                      <span>Popular</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-1">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {tool.description}
              </p>
            </div>

            {/* Bottom Tag */}
            <div className="mt-4 pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-muted/50 text-muted-foreground border border-border/50">
                {tool.type === 'brew-cask' ? 'Cask' : 
                 tool.type === 'brew' ? 'CLI' : 
                 tool.type === 'mas' ? 'App Store' :
                 tool.type === 'npm' ? 'NPM' :
                 'Custom'}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
