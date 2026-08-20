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
  
  const getTransform = (index: number, shape: string) => {
    if (shape === "panorama") {
      return { top: '30%', left: '50%', transform: 'translate(-50%, -50%) rotate(-4deg)' };
    }

    const positions = [
      { x: '16%', y: '32%', rotate: -24 },
      { x: '82%', y: '28%', rotate: 18 },
      { x: '14%', y: '64%', rotate: 20 },
      { x: '86%', y: '70%', rotate: -18 },
      { x: '24%', y: '44%', rotate: 28 },
      { x: '76%', y: '42%', rotate: -20 },
      { x: '18%', y: '80%', rotate: 16 },
      { x: '72%', y: '82%', rotate: -22 },
      { x: '52%', y: '84%', rotate: 14 },
      { x: '48%', y: '32%', rotate: -14 },
    ];

    const pos = positions[index % positions.length];
    const jitter = ((index % 3) - 1) * 2;

    return {
      top: `calc(${pos.y} + ${jitter * 0.4}%)`,
      left: `calc(${pos.x} + ${jitter * 0.6}%)`,
      transform: `translate(-50%, -50%) rotate(${pos.rotate + jitter}deg)`,
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
        const style = getTransform(i, media.shape);
        const isPanorama = media.shape === "panorama";
        
        return (
          <motion.div
            key={i}
            className={`absolute z-20 ${isPanorama ? 'max-w-[78vw]' : ''}`}
            style={style as any}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 2, delay: i * 0.4, ease: "easeOut" }}
          >
            <MediaFrame media={media} className={isPanorama ? "w-full" : ""} />
          </motion.div>
        );
      })}

      <motion.div
        className="absolute top-1/2 left-1/2 z-50 h-[min(460px,52vh)] w-[min(440px,38vw)] max-w-[440px] glass-panel p-8 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 3, delay: mediaList.length * 0.5 }}
      >
        <div className="h-full overflow-y-auto pr-2">
          <p className="font-body text-lg leading-relaxed tracking-[0.02em] whitespace-pre-wrap break-words">
            {text}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
