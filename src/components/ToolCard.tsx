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
    
    const fallbackUrls = getAppIconFallbacks(tool.name, tool.homepage);
    
    // If we have cached URL, use it immediately
    if (fallbackUrls.length === 1) {
      setCurrentIconUrl(fallbackUrls[0]);
      setIconLoaded(true);
      setIsPreloading(false);
      return;
    }
    
    const findWorkingIcon = async () => {
      // Test first 3 URLs in parallel for speed
      const testUrl = (url: string): Promise<{ url: string; works: boolean }> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ url, works: true });
          img.onerror = () => resolve({ url, works: false });
          img.src = url;
          
          // Timeout after 1.5 seconds
          setTimeout(() => resolve({ url, works: false }), 1500);
        });
      };
      
      // Test first batch in parallel
      const firstBatch = fallbackUrls.slice(0, 3);
      const results = await Promise.all(firstBatch.map(testUrl));
      
      // Find first working URL
      const working = results.find(r => r.works);
      
      if (working && isMounted) {
        setCurrentIconUrl(working.url);
        setIconLoaded(true);
        setIsPreloading(false);
        cacheIconUrl(tool.name, tool.homepage, working.url);
        return;
      }
      
      // If first batch failed, try remaining URLs sequentially
      for (let i = 3; i < fallbackUrls.length; i++) {
        if (!isMounted) break;
        
        const result = await testUrl(fallbackUrls[i]);
        if (result.works && isMounted) {
          setCurrentIconUrl(result.url);
          setIconLoaded(true);
          setIsPreloading(false);
          cacheIconUrl(tool.name, tool.homepage, result.url);
          return;
        }
      }
      
      // If no icon works, show emoji
      if (isMounted) {
        setIconLoaded(true);
        setIsPreloading(false);
      }
    };
    
    findWorkingIcon();
    
    return () => {
      isMounted = false;
    };
  }, [tool.name, tool.homepage]);

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
          className={`relative overflow-hidden rounded-xl h-[180px] flex flex-col transition-all duration-200 ${
            selected
              ? 'bg-primary/10 border-2 border-primary/60'
              : 'bg-card border border-border hover:border-primary/50 hover:shadow-md'
          }`}
        >
          {/* Top colored border */}
          <div className={`absolute top-0 left-0 right-0 ${selected ? 'h-1.5' : 'h-1'} transition-all duration-200 ${
            selected
              ? 'bg-gradient-to-r from-primary via-primary to-primary/80'
              : tool.devPick
              ? 'bg-gradient-to-r from-pink-400 to-purple-400'
              : tool.popular 
              ? 'bg-gradient-to-r from-orange-400 to-yellow-400' 
              : 'bg-gradient-to-r from-muted to-muted/50'
          }`} />

          {/* Badge in top-right */}
          {(tool.popular || tool.devPick) && (
            <div className="absolute top-3 right-3 z-20">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                tool.devPick
                  ? 'bg-pink-50 text-pink-600 border border-pink-200'
                  : 'bg-orange-50 text-orange-600 border border-orange-200'
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
            </div>
          )}

          {/* Spotlight hover effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.06), transparent 50%)',
            }}
          />

          <div className="relative z-10 p-5 flex-1 flex flex-col">
            {/* Icon */}
            <div className="mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center border border-border flex-shrink-0 overflow-hidden shadow-sm">
                {currentIconUrl && iconLoaded ? (
                  <img
                    src={currentIconUrl}
                    alt={tool.name}
                    className="w-9 h-9 object-contain animate-in fade-in duration-300"
                  />
                ) : (
                  <span className="text-2xl animate-in fade-in duration-300">{fallbackEmoji}</span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="font-bold text-foreground text-lg mb-1.5 line-clamp-1">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {tool.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
