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

function CleanPicture({ media, totalInColumn }: { media: MediaProps; totalInColumn: number }) {
  let baseW = 240;
  let baseH = 280;

  if (media.shape === "portrait") { baseW = 210; baseH = 310; }
  else if (media.shape === "landscape") { baseW = 300; baseH = 210; }
  else if (media.shape === "panorama") { baseW = 360; baseH = 160; }

  // More aggressive scaling to guarantee 100% visibility (no overlap) as density increases
  const multiplier = 
    totalInColumn === 1 ? 1.25 : 
    totalInColumn === 2 ? 0.95 :  // Fits 2 easily without touching
    totalInColumn === 3 ? 0.70 :  // Scales down to fit 3 perfectly
    totalInColumn === 4 ? 0.52 :  // Scales down significantly for 4
    0.42;                         // Small enough to fit 5 per column with zero overlap
  
  const width = Math.round(baseW * multiplier);
  const height = Math.round(baseH * multiplier);

  return (
    <div 
      className="relative overflow-hidden rounded-[20px] shadow-lg"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        transform: 'translateZ(0)',
      }}
    >
      <Image
        src={media.url}
        alt="Memory"
        fill
        className="object-cover"
        style={{ border: 'none', outline: 'none' }}
      />
    </div>
  );
}

export function LayoutEngine({ text, mediaList, layoutSeed }: LayoutEngineProps) {
  const displayList = mediaList.slice(0, 10);

  const leftItems = displayList.filter((_, i) => i % 2 === 0);
  const rightItems = displayList.filter((_, i) => i % 2 !== 0);

  const getPositionStyle = (colIndex: number, totalInCol: number, isLeft: boolean) => {
    // Keep a subtle zigzag, but pull it slightly tighter so scaled-down images don't drift too far
    const xBase = isLeft ? 15 : 85;
    const xOffset = colIndex % 2 === 0 ? (isLeft ? -3 : 3) : (isLeft ? 3 : -3);
    const x = xBase + xOffset;

    let y = 50;
    if (totalInCol === 1) {
      y = 50;
    } else {
      // Widen the vertical distribution when there are more items to maximize non-overlapping space
      const startY = totalInCol >= 4 ? 12 : 18;
      const endY = totalInCol >= 4 ? 88 : 82;
      y = startY + (colIndex / (totalInCol - 1)) * (endY - startY);
    }

    const rotate = (colIndex % 2 === 0 ? 1 : -1) * (2 + (colIndex % 3) * 2);

    return {
      top: `${y}%`,
      left: `${x}%`,
      transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    };
  };

  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden bg-transparent">
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
      </div>

      {leftItems.map((media, colIndex) => {
        const style = getPositionStyle(colIndex, leftItems.length, true);
        const globalIndex = colIndex * 2;

        return (
          <motion.div
            key={`left-${globalIndex}`}
            className="absolute z-20 pointer-events-auto"
            style={style as any}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: globalIndex * 0.1, ease: "easeOut" }}
          >
            <CleanPicture media={media} totalInColumn={leftItems.length} />
          </motion.div>
        );
      })}

      {rightItems.map((media, colIndex) => {
        const style = getPositionStyle(colIndex, rightItems.length, false);
        const globalIndex = colIndex * 2 + 1;

        return (
          <motion.div
            key={`right-${globalIndex}`}
            className="absolute z-20 pointer-events-auto"
            style={style as any}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: globalIndex * 0.1, ease: "easeOut" }}
          >
            <CleanPicture media={media} totalInColumn={rightItems.length} />
          </motion.div>
        );
      })}

      {/* Central Text Box */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: displayList.length * 0.1 }}
      >
        <div className="p-4 bg-transparent border-none outline-none">
          <div className="h-[min(400px,46vh)] w-[min(380px,34vw)] max-w-[380px] glass-panel p-8">
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
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
