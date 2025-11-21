import { Tool } from '@/types/tools';
import { Check, Star, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ToolCardProps {
  tool: Tool;
  selected: boolean;
  onToggle: () => void;
}

export const ToolCard = ({ tool, selected, onToggle }: ToolCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={onToggle}
        className={`group p-5 cursor-pointer transition-all duration-300 relative overflow-hidden ${
          selected
            ? 'border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20'
            : 'border-2 border-transparent hover:border-primary/30 bg-card/50 backdrop-blur-sm hover:shadow-lg'
        }`}
      >
        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-start gap-4">
          <motion.div
            animate={selected ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`flex-shrink-0 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
              selected
                ? 'border-primary bg-gradient-primary shadow-md'
                : 'border-muted-foreground/30 group-hover:border-primary/50'
            }`}
          >
            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            )}
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-base text-foreground">{tool.name}</h3>
              {tool.popular && (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </motion.div>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
