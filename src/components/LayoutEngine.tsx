"use client";

import { motion } from "framer-motion";
import { MediaFrame, MediaProps } from "./MediaFrames";

interface LayoutEngineProps {
  text: string;
  mediaList: MediaProps[];
  layoutSeed?: string;
}

export function LayoutEngine({ text, mediaList, layoutSeed }: LayoutEngineProps) {
  const getTransform = (index: number, shape: string, totalCount: number) => {
    // 1. Dynamic scale optimized for max size without breaking boundaries
    const scale = 
      totalCount <= 1 ? 1.4 : 
      totalCount <= 3 ? 1.15 : 
      totalCount <= 6 ? 0.9 : 0.65; // Caps at 0.65 for 7-10 images to ensure space

    const scaleStr = ` scale(${scale})`;

    if (shape === "panorama") {
      return { top: '12%', left: '50%', transform: `translate(-50%, -50%) rotate(-1deg)${scaleStr}` };
    }

    // 2. Ten Strict Perimeter Slots
    // These coordinates are mathematically outside the central text box bounds
    // and spaced far enough apart from each other to prevent collisions.
    const fixedZones = [
      { x: '16%', y: '18%', rotate: -4 },  // 0: Top-Left
      { x: '84%', y: '18%', rotate: 5 },   // 1: Top-Right
      { x: '16%', y: '82%', rotate: 4 },   // 2: Bottom-Left
      { x: '84%', y: '82%', rotate: -5 },  // 3: Bottom-Right
      { x: '11%', y: '50%', rotate: -6 },  // 4: Mid-Left 
      { x: '89%', y: '50%', rotate: 6 },   // 5: Mid-Right 
      { x: '35%', y: '11%', rotate: 2 },   // 6: Top-Center-Left
      { x: '65%', y: '11%', rotate: -3 },  // 7: Top-Center-Right
      { x: '35%', y: '89%', rotate: -2 },  // 8: Bottom-Center-Left
      { x: '65%', y: '89%', rotate: 3 },   // 9: Bottom-Center-Right
    ];

    const pos = fixedZones[index % 10]; // Strictly wraps within the 10 safe zones

    return {
      top: pos.y,
      left: pos.x,
      transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)${scaleStr}`,
    };
  };

  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden layout-engine-container">
      {/* Aggressive CSS Override to destroy the mysterious dashed border */}
      <style dangerouslySetInnerHTML={{__html: `
        .layout-engine-container * {
          border-style: solid !important;
          border-image: none !important;
        }
        .layout-engine-container img, 
        .layout-engine-container video {
          border: none !important;
          outline: none !important;
        }
      `}} />

      <div className="absolute inset-0 bg-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.40),transparent_35%)] pointer-events-none" />
      
      {/* Background Ink Blobs */}
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
      </div>

      {/* Render Images in their strict slots */}
      {mediaList.slice(0, 10).map((media, i) => { // Hard cap at 10 to enforce layout rule
        const style = getTransform(i, media.shape, mediaList.length);
        const isPanorama = media.shape === "panorama";

        return (
          <motion.div
            key={i}
            className={`absolute z-20 ${isPanorama ? 'max-w-[78vw]' : ''}`}
            style={style as any}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: i * 0.15, ease: "easeOut" }}
          >
            {/* 20px physical padding barrier around the image */}
            <div className="p-5 bg-transparent pointer-events-auto">
              <MediaFrame media={media} className={isPanorama ? "w-full" : ""} />
            </div>
          </motion.div>
        );
      })}

      {/* Central Text Box */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: Math.min(mediaList.length, 10) * 0.15 }}
      >
        {/* 32px physical padding barrier around the central box */}
        <div className="p-8 bg-transparent">
          <div className="h-[min(400px,46vh)] w-[min(380px,34vw)] max-w-[380px] glass-panel p-8">
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
