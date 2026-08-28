"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export interface MediaProps {
  url: string;
  type: string;
  shape: string;
}

interface LayoutEngineProps {
  text: string;
  mediaList: MediaProps[];
  layoutSeed?: string;
}

// 1. BRAND NEW COMPONENT: Replaces MediaFrames.tsx completely.
// This guarantees no inherited CSS classes, dashed borders, or external styling interfere.
function CleanPicture({ media }: { media: MediaProps }) {
  // Base dimensions mapped to shapes
  let width = '22vw';
  let height = '26vh';
  let minW = 220, minH = 220;

  if (media.shape === "portrait") { width = '20vw'; height = '34vh'; minW = 200; minH = 280; }
  if (media.shape === "landscape") { width = '28vw'; height = '24vh'; minW = 280; minH = 200; }
  if (media.shape === "panorama") { width = '35vw'; height = '18vh'; minW = 350; minH = 160; }

  return (
    <div 
      className="relative overflow-hidden rounded-[28px] bg-transparent shadow-md"
      style={{
        width: `min(${minW}px, ${width})`,
        height: `min(${minH}px, ${height})`,
        border: 'none', 
        outline: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <Image
        src={media.url}
        alt="Memory"
        fill
        className="object-contain"
        style={{ border: 'none', outline: 'none' }}
      />
    </div>
  );
}

export function LayoutEngine({ text, mediaList, layoutSeed }: LayoutEngineProps) {
  // Cap at 10 items (5 per side)
  const displayList = mediaList.slice(0, 10);
  
  const getTransform = (index: number, totalCount: number) => {
    // Left/Right assignment (Evens on Left, Odds on Right)
    const isLeft = index % 2 === 0;
    
    // Count how many items end up in this specific column
    const itemsInThisColumn = isLeft ? Math.ceil(totalCount / 2) : Math.floor(totalCount / 2);
    const indexInColumn = Math.floor(index / 2); // 0, 1, 2, 3, 4

    // 2. COLUMN SCALING: Maximize size based strictly on vertical real estate
    const scale = 
      itemsInThisColumn === 1 ? 1.3 : 
      itemsInThisColumn === 2 ? 0.95 : 
      itemsInThisColumn === 3 ? 0.70 : 
      itemsInThisColumn === 4 ? 0.55 : 0.45; // 5 items max per side

    const scaleStr = ` scale(${scale})`;

    // 3. STRICT BOUNDARIES
    // X-Axis: Left column locked at 14%, Right column locked at 86%
    const x = isLeft ? 14 : 86;

    // Y-Axis: Distribute evenly between 14% and 86% height based on how many are in the column
    let y = 50; // Default to center if only 1 item
    if (itemsInThisColumn > 1) {
      const startY = 14;
      const endY = 86;
      const spread = endY - startY;
      const step = spread / (itemsInThisColumn - 1);
      y = startY + (indexInColumn * step);
    }

    // Slight inward rotation for aesthetics
    const rotate = (isLeft ? -1 : 1) * (2 + (indexInColumn % 3) * 2);

    return {
      top: `${y}%`,
      left: `${x}%`,
      transform: `translate(-50%, -50%) rotate(${rotate}deg)${scaleStr}`,
    };
  };

  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden bg-transparent">
      {/* Dynamic Background */}
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

      {/* Render Images in Left/Right Columns */}
      {displayList.map((media, i) => {
        const style = getTransform(i, displayList.length);

        return (
          <motion.div
            key={i}
            className="absolute z-20 pointer-events-auto"
            style={{
              ...style as any,
              border: 'none',
              outline: 'none',
            }}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: i * 0.15, ease: "easeOut" }}
          >
            {/* Protective gap container */}
            <div className="p-2 border-none outline-none">
              <CleanPicture media={media} />
            </div>
          </motion.div>
        );
      })}

      {/* Central Text Box - Anchored strictly at 50/50 */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: displayList.length * 0.15 }}
      >
        <div className="p-4 bg-transparent border-none outline-none">
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
