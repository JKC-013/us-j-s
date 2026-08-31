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
  let baseW = 250;
  let baseH = 290;

  if (media.shape === "portrait") { baseW = 220; baseH = 330; }
  else if (media.shape === "landscape") { baseW = 320; baseH = 220; }
  else if (media.shape === "panorama") { baseW = 390; baseH = 170; }

  // Scaled UP drastically. Because the columns have independent vertical space now,
  // we can afford to make these images much larger without them crushing each other.
  const multiplier = 
    totalInColumn === 1 ? 1.45 : 
    totalInColumn === 2 ? 1.25 : 
    totalInColumn === 3 ? 1.05 : 
    totalInColumn === 4 ? 0.88 : 
    0.75; 
  
  const width = Math.round(baseW * multiplier);
  const height = Math.round(baseH * multiplier);

  return (
    <div 
      className="relative overflow-hidden rounded-[20px] shadow-xl"
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

  // Split into independent left and right columns
  const leftItems = displayList.filter((_, i) => i % 2 === 0);
  const rightItems = displayList.filter((_, i) => i % 2 !== 0);

  // We calculate the maximum vertical "slots" needed. 
  // Left items sit on whole numbers (0, 1, 2). Right items sit on half numbers (0.5, 1.5, 2.5) to stagger them 50% down!
  const maxPos = Math.max(
    leftItems.length > 0 ? leftItems.length - 1 : 0,
    rightItems.length > 0 ? rightItems.length - 1 + 0.5 : 0
  );

  const getPositionStyle = (colIndex: number, isLeft: boolean) => {
    // Keep X-axis separated: Left stays Left, Right stays Right. (No X-axis overlap)
    const xBase = isLeft ? 16 : 84;
    // Keep the subtle zigzag offset so it looks organic
    const xOffset = colIndex % 2 === 0 ? (isLeft ? -3 : 3) : (isLeft ? 3 : -3);
    const x = xBase + xOffset;

    let y = 50;
    if (maxPos === 0) {
      y = 50; // Only 1 image total
    } else if (maxPos === 0.5) {
      y = isLeft ? 35 : 65; // 2 images total (1 left, 1 right), naturally staggers 50%
    } else {
      // The Magic Formula: Right items are shifted down by 0.5 relative to left items!
      const positionValue = isLeft ? colIndex : colIndex + 0.5;
      
      const startY = 12;
      const endY = 88;
      y = startY + (positionValue / maxPos) * (endY - startY);
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
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.40),transparent_35%)] pointer-events-none" />
      
      <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`ambient-${i}`}
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

      {/* Render Left Column (Base positions: 0, 1, 2...) */}
      {leftItems.map((media, colIndex) => {
        const style = getPositionStyle(colIndex, true);
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

      {/* Render Right Column (Offset positions: 0.5, 1.5, 2.5...) */}
      {rightItems.map((media, colIndex) => {
        const style = getPositionStyle(colIndex, false);
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
