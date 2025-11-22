import { Tool } from '@/types/tools';
import { Check, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface ToolCardProps {
  tool: Tool;
  selected: boolean;
  onToggle: () => void;
}

export const ToolCard = ({ tool, selected, onToggle }: ToolCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative cursor-pointer"
      style={{
        // @ts-ignore
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      }}
    >
      <div
        className={`relative overflow-hidden rounded-xl p-6 h-[160px] flex flex-col justify-between transition-all duration-200 ${
          selected
            ? 'bg-card border-2 border-primary shadow-lg'
            : 'bg-card border border-border hover:border-primary/50 hover:shadow-md'
        }`}
      >
        {/* Popular Badge - Clean & Minimal */}
        {tool.popular && (
          <div className="absolute top-3 right-3 z-20">
            <div className="bg-primary/10 border border-primary/30 rounded-md px-2 py-1">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">
                Popular
              </span>
            </div>
          </div>
        )}

        {/* Spotlight hover effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.08), transparent 50%)',
          }}
        />

        <div className="relative z-10 flex justify-between items-start gap-3">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center border border-border flex-shrink-0">
            <span className="text-2xl">{tool.icon || '📦'}</span>
          </div>
          <div
            className={`w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              selected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="font-bold text-foreground text-base mb-1.5 line-clamp-1">
            {tool.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
