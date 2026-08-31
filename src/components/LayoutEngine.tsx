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

  // Scaled up for 90-100% visibility. 
  // Because they interlace left/right now, they can be much bigger without blocking each other.
  const multiplier = 
    totalInColumn === 1 ? 1.35 : 
    totalInColumn === 2 ? 1.08 : 
    totalInColumn === 3 ? 0.85 : 
    totalInColumn === 4 ? 0.68 : 
    0.55; // 5 items on one side fits cleanly with ~0-10% overlap
  
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
  const totalItems = displayList.length;

  const getPositionStyle = (index: number, total: number) => {
    // Alternate sides: Evens on Left, Odds on Right
    const isLeft = index % 2 === 0;
    
    // Side index tracks which number this image is ON ITS OWN SIDE (0, 1, 2, etc.)
    const sideIndex = Math.floor(index / 2);

    // Keep horizontal zigzag tight
    const xBase = isLeft ? 15 : 85;
    const xOffset = sideIndex % 2 === 0 ? (isLeft ? -3 : 3) : (isLeft ? 3 : -3);
    const x = xBase + xOffset;

    let y = 50;
    if (total === 1) {
      y = 50;
    } else {
      // By calculating Y based on the GLOBAL index rather than the column index, 
      // Image 2 (Right) automatically positions itself halfway below Image 1 (Left),
      // creating a perfect alternating staircase without needing to skip rows.
      const startY = total >= 6 ? 12 : 18;
      const endY = total >= 6 ? 88 : 82;
      y = startY + (index / (total - 1)) * (endY - startY);
    }

    const rotate = (index % 2 === 0 ? 1 : -1) * (2 + (index % 3) * 2);

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

      {/* Render ALL images in a single loop based on their global staggered index */}
      {displayList.map((media, index) => {
        const style = getPositionStyle(index, totalItems);
        const isLeft = index % 2 === 0;
        
        // Tells the picture component how many are sharing its specific side of the screen
        const totalOnThisSide = isLeft 
          ? Math.ceil(totalItems / 2) 
          : Math.floor(totalItems / 2);

        return (
          <motion.div
            key={`media-${index}`}
            className="absolute z-20 pointer-events-auto"
            style={style as any}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: index * 0.1, ease: "easeOut" }}
          >
            <CleanPicture media={media} totalInColumn={totalOnThisSide} />
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
