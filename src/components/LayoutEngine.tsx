"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";

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

// 1. Fixed the layout mapping per your exact instructions
function getColumnDistribution(count: number): { leftCols: number[]; rightCols: number[] } {
  switch (count) {
    case 1: return { leftCols: [1], rightCols: [] };
    case 2: return { leftCols: [1], rightCols: [1] };
    case 3: return { leftCols: [2], rightCols: [1] };
    case 4: return { leftCols: [2], rightCols: [2] };
    case 5: return { leftCols: [3], rightCols: [2] };
    case 6: return { leftCols: [3], rightCols: [3] };
    case 7: return { leftCols: [3, 2], rightCols: [2] };
    case 8: return { leftCols: [3, 2], rightCols: [3] };
    case 9: return { leftCols: [3, 2], rightCols: [2, 2] };
    case 10: return { leftCols: [3, 2], rightCols: [2, 3] };
    default: {
      const half = Math.ceil(count / 2);
      return { leftCols: [half], rightCols: [count - half] };
    }
  }
}

// Safe array chunking to prevent out-of-bounds indexing
function chunkArray<T>(arr: T[], sizes: number[]): T[][] {
  const result: T[][] = [];
  let index = 0;
  for (const size of sizes) {
    if (size > 0) {
      result.push(arr.slice(index, index + size));
      index += size;
    }
  }
  return result;
}

// Deterministic random rotation between 10 to 30 degrees
const getTilt = (index: number) => {
  const angles = [12, -24, 18, -15, 28, -21, 14, -29, 22, -11, 26, -17, 19, -25];
  return angles[index % angles.length];
};

export function LayoutEngine({ text, mediaList }: LayoutEngineProps) {
  const displayList = useMemo(() => mediaList.slice(0, 10), [mediaList]);
  const totalImages = displayList.length;

  // Track the original global index for animations and tilting
  const indexedList = useMemo(
    () => displayList.map((media, i) => ({ media, globalIndex: i })),
    [displayList]
  );

  const { leftCols, rightCols } = useMemo(
    () => getColumnDistribution(totalImages),
    [totalImages]
  );

  const leftMax = leftCols.reduce((a, b) => a + b, 0);
  const rightMax = rightCols.reduce((a, b) => a + b, 0);

  // 2. Distribute images chronologically up to the capacity of each side, 
  // preventing the "missing images" bug on asymmetrical layouts (like 3|2 vs 2)
  const leftItems = [];
  const rightItems = [];
  for (let i = 0; i < totalImages; i++) {
    const item = indexedList[i];
    if (i % 2 === 0) {
      if (leftItems.length < leftMax) leftItems.push(item);
      else rightItems.push(item);
    } else {
      if (rightItems.length < rightMax) rightItems.push(item);
      else leftItems.push(item);
    }
  }

  const leftChunks = chunkArray(leftItems, leftCols);
  const rightChunks = chunkArray(rightItems, rightCols);

  // Determine the tallest column overall to calculate flex spacer offsets perfectly
  const globalMaxSlots = Math.max(...leftCols, ...rightCols, 1);

  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden bg-transparent">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.40),transparent_35%)] pointer-events-none" />

      {/* 3. Strict 20px boundary margin applied around the entire screen */}
      <div className="relative w-full h-full p-[20px] flex justify-between items-center pointer-events-none overflow-hidden">
        
        {/* LEFT SIDE CONTAINER */}
        <div className="h-full flex-1 flex justify-center items-center gap-[10px] min-w-0 pointer-events-auto">
          {leftChunks.map((chunk, colIdx) => {
            const slotsInCol = leftCols[colIdx];
            
            // Mathematically precise flex space distribution for the half-step stagger
            const diff = globalMaxSlots - slotsInCol;
            const topSpacer = diff > 0 ? 0.5 : 0;
            const bottomSpacer = diff > 0 ? diff - 0.5 : 0;

            return (
              <div key={`left-col-${colIdx}`} className="h-full flex-1 flex flex-col items-center gap-[10px] min-w-0">
                {topSpacer > 0 && <div style={{ flex: topSpacer }} />}
                
                {chunk.map((item) => (
                  <div key={`l-img-${item.globalIndex}`} className="flex-1 w-full min-h-0 flex items-center justify-center">
                    <motion.div
                      className="relative rounded-[20px] overflow-hidden shadow-lg bg-black/5 flex-shrink-0"
                      style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', aspectRatio: '1 / 1' }}
                      initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                      animate={{ opacity: 1, scale: 1, rotate: getTilt(item.globalIndex) }}
                      transition={{ duration: 0.8, delay: item.globalIndex * 0.08 }}
                    >
                      <Image src={item.media.url} alt="Memory" fill className="object-contain p-[10px]" />
                    </motion.div>
                  </div>
                ))}
                
                {bottomSpacer > 0 && <div style={{ flex: bottomSpacer }} />}
              </div>
            );
          })}
        </div>

        {/* CENTRAL TEXT BOX WITH ADDITIONAL 20px CLEARANCE */}
        <motion.div
          className="relative z-50 pointer-events-auto mx-[20px] flex-shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: displayList.length * 0.05 }}
        >
          <div className="h-[min(400px,46vh)] w-[min(360px,30vw)] max-w-[360px] glass-panel p-8">
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
              <p className="font-body text-lg leading-relaxed tracking-[0.02em] whitespace-pre-wrap break-words">
                {text}
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE CONTAINER */}
        <div className="h-full flex-1 flex justify-center items-center gap-[10px] min-w-0 pointer-events-auto">
          {rightChunks.map((chunk, colIdx) => {
            const slotsInCol = rightCols[colIdx];
            
            const diff = globalMaxSlots - slotsInCol;
            const topSpacer = diff > 0 ? 0.5 : 0;
            const bottomSpacer = diff > 0 ? diff - 0.5 : 0;

            return (
              <div key={`right-col-${colIdx}`} className="h-full flex-1 flex flex-col items-center gap-[10px] min-w-0">
                {topSpacer > 0 && <div style={{ flex: topSpacer }} />}
                
                {chunk.map((item) => (
                  <div key={`r-img-${item.globalIndex}`} className="flex-1 w-full min-h-0 flex items-center justify-center">
                    <motion.div
                      className="relative rounded-[20px] overflow-hidden shadow-lg bg-black/5 flex-shrink-0"
                      style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', aspectRatio: '1 / 1' }}
                      initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                      animate={{ opacity: 1, scale: 1, rotate: getTilt(item.globalIndex) }}
                      transition={{ duration: 0.8, delay: item.globalIndex * 0.08 }}
                    >
                      <Image src={item.media.url} alt="Memory" fill className="object-contain p-[10px]" />
                    </motion.div>
                  </div>
                ))}
                
                {bottomSpacer > 0 && <div style={{ flex: bottomSpacer }} />}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
