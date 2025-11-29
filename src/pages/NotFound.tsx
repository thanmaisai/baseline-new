import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Terminal } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const eyesRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log('404 Page accessed:', location.pathname);
  }, [location.pathname]);

  // Googly eyes effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPosition = (eyeElement: HTMLElement | null) => {
    if (!eyeElement) return { x: 0, y: 0 };

    const rect = eyeElement.getBoundingClientRect();
    const eyeX = rect.left + rect.width / 2;
    const eyeY = rect.top + rect.height / 2;

    const angle = Math.atan2(mousePos.y - eyeY, mousePos.x - eyeX);
    const radius = 8;

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))] relative overflow-hidden selection:bg-[hsl(var(--foreground))] selection:text-[hsl(var(--primary))]">
      {/* Retro Noise Texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 w-full h-64 bg-gradient-to-t from-[hsl(var(--foreground))]/20 to-transparent pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="relative z-40 w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-2xl tracking-tight text-[hsl(var(--background))] drop-shadow-sm">
            Baseline
          </h1>
          <span className="border border-[hsl(var(--background))]/30 rounded-full px-2 py-0.5 text-xs font-bold text-[hsl(var(--background))] opacity-60">
            404
          </span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-[hsl(var(--background))] hover:text-[hsl(var(--card))] transition-colors text-sm font-medium"
        >
          Home
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative z-30 flex flex-col items-center justify-center min-h-[80vh] w-full text-center px-4">
        
        {/* The Character with Googly Eyes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-64 h-64 mb-12"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full h-full"
          >
            {/* Eyes Container */}
            <div ref={eyesRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] flex gap-3 z-50">
              {[0, 1].map((index) => (
                <Eye key={index} mousePos={mousePos} calculatePosition={calculatePupilPosition} />
              ))}
            </div>

            {/* Isometric Terminal Character */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '800px' }}>
              <div 
                className="relative w-32 h-32"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(60deg) rotateZ(-45deg)'
                }}
              >
                {/* Base cube - largest */}
                <Cube color="bg-[hsl(var(--card))]" x={0} y={0} z={0} size={128} opacity="opacity-90" />
                
                {/* Building blocks */}
                <Cube color="bg-[#2DD4BF]" x={0} y={0} z={40} size={40} />
                <Cube color="bg-[#2DD4BF]" x={40} y={0} z={40} size={40} />
                <Cube color="bg-[#2DD4BF]" x={0} y={40} z={40} size={40} />
                
                <Cube color="bg-[#A855F7]" x={40} y={40} z={60} size={40} />
                <Cube color="bg-[#A855F7]" x={80} y={40} z={40} size={40} />
                
                <Cube color="bg-[hsl(var(--primary))]" x={40} y={40} z={80} size={40} brightness="brightness-110" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="font-bold text-4xl md:text-7xl leading-[0.95] text-[hsl(var(--background))] mb-8 drop-shadow-md max-w-3xl tracking-tight">
            This is a part of <br/>
            <span className="italic text-[hsl(var(--card))]">Baseline world</span> <br/>
            we haven't <br/>
            discovered yet.
          </h1>

          <p className="text-base md:text-lg text-[hsl(var(--background))]/80 mb-2 font-medium">
            The page <code className="px-2 py-1 rounded-md bg-[hsl(var(--background))]/20 border border-[hsl(var(--background))]/30 text-sm font-mono">
              {location.pathname}
            </code> doesn't exist.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="group relative inline-flex items-center gap-3 px-8 py-4 mt-12 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-full font-bold text-sm tracking-widest uppercase transition-all hover:shadow-2xl shadow-lg ring-4 ring-transparent hover:ring-[hsl(var(--card))]/30"
        >
          <ArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" />
          <span>It's best if you go back</span>
        </motion.button>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 flex flex-wrap gap-3 justify-center"
        >
          <button
            onClick={() => navigate('/configure')}
            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[hsl(var(--background))]/20 border border-[hsl(var(--background))]/30 text-[hsl(var(--background))] hover:bg-[hsl(var(--background))]/30 transition-all backdrop-blur-sm"
          >
            Configure
          </button>
          <button
            onClick={() => navigate('/upload-scan')}
            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[hsl(var(--background))]/20 border border-[hsl(var(--background))]/30 text-[hsl(var(--background))] hover:bg-[hsl(var(--background))]/30 transition-all backdrop-blur-sm"
          >
            Upload Scan
          </button>
        </motion.div>
      </main>
    </div>
  );
};

// Eye Component with googly effect
const Eye = ({ mousePos, calculatePosition }: { 
  mousePos: { x: number; y: number }; 
  calculatePosition: (el: HTMLElement | null) => { x: number; y: number };
}) => {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilPos = calculatePosition(eyeRef.current);

  return (
    <div 
      ref={eyeRef}
      className="w-10 h-10 bg-[hsl(var(--background))] rounded-full relative flex items-center justify-center border-2 border-[hsl(var(--card))] shadow-lg"
      style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}
    >
      <div 
        className="w-3.5 h-3.5 bg-[hsl(var(--foreground))] rounded-full transition-transform duration-100 ease-out"
        style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }}
      />
    </div>
  );
};

// Cube Component for isometric design
const Cube = ({ 
  color, 
  x, 
  y, 
  z, 
  size = 40,
  opacity = "opacity-100",
  brightness = "brightness-100"
}: { 
  color: string; 
  x: number; 
  y: number; 
  z: number; 
  size?: number;
  opacity?: string;
  brightness?: string;
}) => {
  return (
    <div 
      className="absolute"
      style={{ 
        left: `${x}px`, 
        top: `${y}px`, 
        width: `${size}px`, 
        height: `${size}px`,
        transformStyle: 'preserve-3d',
        transform: `translateZ(${z}px)`
      }}
    >
      {/* Top face */}
      <div 
        className={`absolute ${color} ${opacity} ${brightness} border border-black/10`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          transform: 'rotateX(0deg) translateZ(0px)'
        }}
      />
      {/* Front face */}
      <div 
        className={`absolute ${color} ${opacity} brightness-85 border border-black/10`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          transform: `rotateX(-90deg) translateZ(${size/2}px) translateY(${size/2}px)`
        }}
      />
      {/* Right face */}
      <div 
        className={`absolute ${color} ${opacity} brightness-75 border border-black/10`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          transform: `rotateY(90deg) translateZ(${size/2}px) translateX(${size/2}px)`
        }}
      />
    </div>
  );
};

export default NotFound;
