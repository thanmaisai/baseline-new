import { Tool } from '@/types/tools';
import { Check, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ToolCardProps {
  tool: Tool;
  selected: boolean;
  onToggle: () => void;
}

export const ToolCard = ({ tool, selected, onToggle }: ToolCardProps) => {
  return (
    <Card
      onClick={onToggle}
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-hover ${
        selected
          ? 'border-primary bg-primary/5 shadow-card'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
            selected
              ? 'border-primary bg-primary'
              : 'border-muted-foreground/30'
          }`}
        >
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm text-foreground">{tool.name}</h3>
            {tool.popular && (
              <Star className="h-3 w-3 fill-accent text-accent" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>
    </Card>
  );
};
