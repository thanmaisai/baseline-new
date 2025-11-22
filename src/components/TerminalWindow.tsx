import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TerminalWindowProps {
  lines: Array<{
    text: string;
    type?: 'command' | 'output' | 'success' | 'error' | 'info';
    delay?: number;
  }>;
  className?: string;
  showCursor?: boolean;
}

export const TerminalWindow = ({ lines, className = '', showCursor = true }: TerminalWindowProps) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentLineText, setCurrentLineText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (visibleLines >= lines.length) return;

    const currentLine = lines[visibleLines];
    const delay = currentLine.delay || 0;

    const timeoutId = setTimeout(() => {
      setIsTyping(true);
      let charIndex = 0;

      const typingInterval = setInterval(() => {
        if (charIndex <= currentLine.text.length) {
          setCurrentLineText(currentLine.text.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setCurrentLineText('');
          setVisibleLines(visibleLines + 1);
        }
      }, 30);

      return () => clearInterval(typingInterval);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [visibleLines, lines]);

  const getLineColor = (type?: string) => {
    switch (type) {
      case 'command':
        return 'text-emerald-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  const getPrefix = (type?: string) => {
    switch (type) {
      case 'command':
        return '$ ';
      case 'success':
        return '✓ ';
      case 'error':
        return '✗ ';
      case 'info':
        return 'ℹ ';
      default:
        return '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Terminal Window */}
      <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 bg-gray-900/95 backdrop-blur-xl">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/90 border-b border-gray-700/50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-sm text-gray-400 font-mono">bash — setup-macos.sh</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-6 font-mono text-sm min-h-[300px] max-h-[400px] overflow-hidden">
          <div className="space-y-2">
            {lines.slice(0, visibleLines).map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={getLineColor(line.type)}
              >
                <span className="text-gray-500">{getPrefix(line.type)}</span>
                {line.text}
              </motion.div>
            ))}
            
            {isTyping && (
              <div className={getLineColor(lines[visibleLines]?.type)}>
                <span className="text-gray-500">{getPrefix(lines[visibleLines]?.type)}</span>
                {currentLineText}
                {showCursor && <span className="animate-pulse">▊</span>}
              </div>
            )}

            {/* Blinking cursor when idle */}
            {!isTyping && visibleLines >= lines.length && showCursor && (
              <div className="text-gray-300">
                <span className="text-gray-500">$ </span>
                <span className="animate-pulse">▊</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
