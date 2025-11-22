import { motion } from 'framer-motion';
import { 
  Code2, 
  Terminal, 
  Cpu, 
  Database, 
  GitBranch, 
  Package, 
  Workflow,
  Boxes,
  Braces,
  Container
} from 'lucide-react';

const icons = [
  { Icon: Code2, position: { top: '10%', left: '10%' }, delay: 0 },
  { Icon: Terminal, position: { top: '20%', right: '15%' }, delay: 0.2 },
  { Icon: Cpu, position: { top: '60%', left: '8%' }, delay: 0.4 },
  { Icon: Database, position: { bottom: '20%', right: '10%' }, delay: 0.6 },
  { Icon: GitBranch, position: { top: '40%', right: '8%' }, delay: 0.8 },
  { Icon: Package, position: { bottom: '30%', left: '15%' }, delay: 1.0 },
  { Icon: Workflow, position: { top: '30%', left: '20%' }, delay: 1.2 },
  { Icon: Boxes, position: { bottom: '40%', right: '20%' }, delay: 1.4 },
  { Icon: Braces, position: { top: '70%', right: '25%' }, delay: 1.6 },
  { Icon: Container, position: { bottom: '10%', left: '25%' }, delay: 1.8 },
];

export const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, position, delay }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={position}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.15, 0.15, 0],
            scale: [0, 1, 1, 0],
            y: [0, -20, -20, 0],
          }}
          transition={{
            duration: 8,
            delay,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <Icon className="w-8 h-8 text-primary" />
        </motion.div>
      ))}
    </div>
  );
};
