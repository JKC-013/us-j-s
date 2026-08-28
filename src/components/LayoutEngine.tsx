"use client";

import { motion } from "framer-motion";
import { MediaFrame, MediaProps } from "./MediaFrames";

interface LayoutEngineProps {
  text: string;
  mediaList: MediaProps[];
  layoutSeed?: string;
}

export function LayoutEngine({ text, mediaList, layoutSeed }: LayoutEngineProps) {
  // We'll use a simple deterministic distribution based on index if layoutSeed isn't complex
  // For a real masonry orbit, we'd use physics or a packing algorithm.
  // Here we use absolute positioning in a 100vw x 100vh canvas.
  
  const getTransform = (index: number, shape: string, totalCount: number) => {
    // 1. Dynamic scale that shrinks properly as items increase
    const scale = 
      totalCount <= 1 ? 1.1 : 
      totalCount <= 3 ? 0.95 : 
      totalCount <= 6 ? 0.78 : 0.65;
      
    const scaleStr = ` scale(${scale})`;

    if (shape === "panorama") {
      return { top: '12%', left: '50%', transform: `translate(-50%, -50%) rotate(-2deg)${scaleStr}` };
    }

    const startAngle = -Math.PI / 2.3; 
    const angle = startAngle + (index / totalCount) * (2 * Math.PI);

    // 2. Superellipse bounds tuned specifically to keep items far outside 
    // the central text box boundary and well inside the viewport frame.
    const n = 4.2; 
    const a = 28; // Max X displacement (keeps centers within 22% - 78%)
    const b = 23; // Max Y displacement (keeps centers within 27% - 73%)
    
    const cosT = Math.cos(angle);
    const sinT = Math.sin(angle);
    
    const xOffset = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
    const yOffset = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);

    const x = 50 + xOffset;
    const y = 50 + yOffset;

    // Controlled rotation angle so corners don't poke out of the safety box
    const rotate = (index % 2 === 0 ? 1 : -1) * (3 + (index % 3) * 3);

    return {
      top: `${y}%`,
      left: `${x}%`,
      transform: `translate(-50%, -50%) rotate(${rotate}deg)${scaleStr}`,
    };
  };
  
  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden">
      <div className="absolute inset-0 bg-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.40),transparent_35%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[rgba(211,189,247,0.16)] blur-sm"
            style={{
              width: `${12 + (i % 4) * 6}px`,
              height: `${20 + ((i + 2) % 3) * 10}px`,
              left: `${6 + i * 7}%`,
              bottom: `${-6 + (i % 3) * 6}px`,
              transform: `rotate(${i % 2 === 0 ? -14 : 10}deg)`,
            }}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`ink-${i}`}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: `${8 + (i % 3) * 4}%`,
              height: `${18 + (i % 4) * 8}px`,
              left: `${4 + i * 11}%`,
              bottom: `${4 + (i % 2) * 10}px`,
              transform: `rotate(${(i - 2) * 5}deg)`,
            }}
          />
        ))}
      </div>

      {mediaList.map((media, i) => {
        const style = getTransform(i, media.shape, mediaList.length);
        const isPanorama = media.shape === "panorama";
        
        return (
          <motion.div
            key={i}
            className={`absolute z-20 ${isPanorama ? 'max-w-[78vw]' : ''}`}
            style={style as any}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
          >
            {/* INVISIBLE SAFETY BORDER WRAPPER */}
            {/* p-4 (16px) or p-6 (24px) creates the exact invisible buffer zone from your diagram */}
            <div className="p-5 bg-transparent pointer-events-auto">
              <MediaFrame media={media} className={isPanorama ? "w-full" : ""} />
            </div>
          </motion.div>
        );
      })}

      <motion.div
        className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: mediaList.length * 0.2 }}
      >
        <div className="p-6 bg-transparent">
          <div className="h-[min(420px,48vh)] w-[min(400px,36vw)] max-w-[400px] glass-panel p-8">
            <div className="h-full overflow-y-auto pr-2">
              <p className="font-body text-lg leading-relaxed tracking-[0.02em] whitespace-pre-wrap break-words">
                {text}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
