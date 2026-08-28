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

// Clean picture component built with exact dimensions (no CSS scaling to prevent subpixel dashed lines)
function CleanPicture({ media, totalInColumn }: { media: MediaProps; totalInColumn: number }) {
  // Automatically size down based on how many are stacked in this column
  let baseW = 210;
  let baseH = 260;

  if (media.shape === "portrait") { baseW = 190; baseH = 270; }
  else if (media.shape === "landscape") { baseW = 260; baseH = 190; }
  else if (media.shape === "panorama") { baseW = 320; baseH = 150; }

  // Reduce size smoothly if there are 3 or more items in the column
  const multiplier = totalInColumn <= 2 ? 1.0 : totalInColumn === 3 ? 0.82 : 0.68;
  
  const width = Math.round(baseW * multiplier);
  const height = Math.round(baseH * multiplier);

  return (
    <div 
      className="relative overflow-hidden rounded-[24px] bg-transparent shadow-lg"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: 'none',
        outline: 'none',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        transform: 'translateZ(0)', // Forces GPU acceleration to prevent rendering glitches
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
  // Cap at 10 items max
  const displayList = mediaList.slice(0, 10);

  // Divide list into Left and Right columns for the staggered layout
  const leftItems = displayList.filter((_, i) => i % 2 === 0);
  const rightItems = displayList.filter((_, i) => i % 2 !== 0);

  const getPositionStyle = (colIndex: number, totalInCol: number, isLeft: boolean) => {
    // X-position: Left side hugs 12% to 22%, Right side hugs 78% to 88% with alternating staggering
    const xBase = isLeft ? 16 : 84;
    const xOffset = colIndex % 2 === 0 ? (isLeft ? -4 : 4) : (isLeft ? 4 : -4); // Stagger effect
    const x = xBase + xOffset;

    // Y-position: Distributed vertically between 15% and 85%
    let y = 50;
    if (totalInCol === 1) {
      y = 50;
    } else {
      const startY = 20;
      const endY = 80;
      y = startY + (colIndex / (totalInCol - 1)) * (endY - startY);
    }

    // Gentle organic rotation
    const rotate = (colIndex % 2 === 0 ? 1 : -1) * (3 + (colIndex % 2) * 2);

    return {
      top: `${y}%`,
      left: `${x}%`,
      transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    };
  };

  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden bg-transparent">
      {/* Background Gradients & Effects */}
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

      {/* Render Left Column Staggered Stack */}
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
            <div className="p-2 border-none outline-none">
              <CleanPicture media={media} totalInColumn={leftItems.length} />
            </div>
          </motion.div>
        );
      })}

      {/* Render Right Column Staggered Stack */}
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
            <div className="p-2 border-none outline-none">
              <CleanPicture media={media} totalInColumn={rightItems.length} />
            </div>
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
