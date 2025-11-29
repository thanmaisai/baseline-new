import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
    <PageLayout>
      {/* Retro Noise Texture */}
      <div 
        className="absolute inset-0 pointer-events-none z-50 opacity-[0.08] mix-blend-overlay rounded-[32px]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        
        {/* The Character with Googly Eyes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-48 h-48 mb-8"
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full h-full"
          >
            {/* Eyes Container */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] flex gap-2.5 z-50">
              {[0, 1].map((index) => (
                <Eye key={index} mousePos={mousePos} calculatePosition={calculatePupilPosition} />
              ))}
            </div>

            {/* Isometric Terminal Character */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '800px' }}>
              <div 
                className="relative w-28 h-28"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(60deg) rotateZ(-45deg)'
                }}
              >
                {/* Base cube */}
                <Cube color="bg-[hsl(var(--card))]" x={0} y={0} z={0} size={112} opacity="opacity-90" />
                
                {/* Building blocks */}
                <Cube color="bg-[#2DD4BF]" x={0} y={0} z={35} size={35} />
                <Cube color="bg-[#2DD4BF]" x={35} y={0} z={35} size={35} />
                <Cube color="bg-[#2DD4BF]" x={0} y={35} z={35} size={35} />
                
                <Cube color="bg-[#A855F7]" x={35} y={35} z={52} size={35} />
                <Cube color="bg-[#A855F7]" x={70} y={35} z={35} size={35} />
                
                <Cube color="bg-[hsl(var(--primary))]" x={35} y={35} z={70} size={35} brightness="brightness-110" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="font-bold text-3xl md:text-5xl leading-tight text-[hsl(var(--foreground))] mb-4 tracking-tight">
            This is a part of <br/>
            <span className="italic text-[hsl(var(--primary))]">Baseline world</span> <br/>
            we haven't discovered yet.
          </h1>
        </motion.div>

        {/* CTA Button - Square with rounded corners */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:shadow-xl shadow-lg"
        >
          <ArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" />
          <span>It's best if you go back</span>
        </motion.button>
      </div>
    </PageLayout>
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
      className="w-9 h-9 bg-[hsl(var(--background))] rounded-full relative flex items-center justify-center border-2 border-[hsl(var(--card))] shadow-lg"
      style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}
    >
      <div 
        className="w-3 h-3 bg-[hsl(var(--foreground))] rounded-full transition-transform duration-100 ease-out"
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
  size = 35,
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
