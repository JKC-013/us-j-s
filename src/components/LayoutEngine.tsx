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

function getColumnDistribution(count: number): { leftCols: number[]; rightCols: number[] } {
  switch (count) {
    case 1: return { leftCols: [1], rightCols: [] };
    case 2: return { leftCols: [1], rightCols: [1] };
    case 3: return { leftCols: [2], rightCols: [1] };
    case 4: return { leftCols: [2], rightCols: [2] };
    case 5: return { leftCols: [3], rightCols: [2] };
    case 6: return { leftCols: [3], rightCols: [3] };
    case 7: return { leftCols: [3, 2], rightCols: [2] };       // 7 images: [3, 2] | [2]
    case 8: return { leftCols: [2, 2], rightCols: [2, 2] };    // 8 images: [2, 2] | [2, 2]
    case 9: return { leftCols: [3, 2], rightCols: [2, 2] };    // 9 images: [3, 2] | [2, 2]
    case 10: return { leftCols: [3, 2], rightCols: [2, 3] };   // 10 images: [3, 2] | [2, 3]
    default: {
      const half = Math.ceil(count / 2);
      return { leftCols: [half], rightCols: [count - half] };
    }
  }
}

const getTilt = (index: number) => {
  const angles = [12, -24, 18, -15, 28, -21, 14, -29, 22, -11, 26, -17, 19, -25];
  return angles[index % angles.length];
};

export function LayoutEngine({ text, mediaList }: LayoutEngineProps) {
  // Allow up to 10 items cleanly
  const displayList = useMemo(() => mediaList.slice(0, 10), [mediaList]);
  const totalImages = displayList.length;

  const { leftCols, rightCols } = useMemo(
    () => getColumnDistribution(totalImages),
    [totalImages]
  );

  const leftTotalCount = leftCols.reduce((a, b) => a + b, 0);
  const rightTotalCount = rightCols.reduce((a, b) => a + b, 0);
  const expectedTotal = leftTotalCount + rightTotalCount;

  // Fix: Ensure we slice up to the full expected length of the dynamic configuration
  const activeDisplayList = displayList.slice(0, Math.max(totalImages, expectedTotal));
  const leftMedia = activeDisplayList.slice(0, leftTotalCount);
  const rightMedia = activeDisplayList.slice(leftTotalCount, leftTotalCount + rightTotalCount);

  const createChunks = (mediaArray: typeof displayList, colsConfig: number[]) => {
    let pointer = 0;
    return colsConfig.map((slotCount) => {
      const chunk = mediaArray.slice(pointer, pointer + slotCount);
      pointer += slotCount;
      return chunk;
    });
  };

  const leftChunks = createChunks(leftMedia, leftCols);
  const rightChunks = createChunks(rightMedia, rightCols);

  const globalMaxSlots = Math.max(...leftCols, ...rightCols, 1);

  const leftScaleBonus = rightTotalCount > leftTotalCount ? Math.min(1.45, 1 + (rightTotalCount - leftTotalCount) * 0.18) : 1.0;
  const rightScaleBonus = leftTotalCount > rightTotalCount ? Math.min(1.45, 1 + (leftTotalCount - rightTotalCount) * 0.18) : 1.0;

  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.40),transparent_35%)] pointer-events-none" />

      <div className="relative w-full h-full p-[20px] flex justify-between items-center pointer-events-none overflow-hidden">
        
        {/* LEFT SIDE CONTAINER */}
        <div 
          className="h-full flex-1 flex justify-center items-center gap-[10px] min-w-0 pointer-events-auto"
          style={{ transform: `scale(${leftScaleBonus})`, transformOrigin: 'center' }}
        >
          {leftChunks.map((chunk, colIdx) => {
            const slotsInCol = leftCols[colIdx];
            const diff = globalMaxSlots - slotsInCol;
            const topSpacer = diff > 0 ? 0.5 : 0;
            const bottomSpacer = diff > 0 ? diff - 0.5 : 0;

            return (
              <div key={`left-col-${colIdx}`} className="h-full flex-1 flex flex-col items-center gap-[10px] min-w-0">
                {topSpacer > 0 && <div style={{ flex: topSpacer }} />}
                
                {chunk.map((media, slotIdx) => {
                  let globalIndex = 0;
                  for (let i = 0; i < colIdx; i++) globalIndex += leftCols[i];
                  globalIndex += slotIdx;

                  return (
                    <div key={`l-slot-${globalIndex}`} className="flex-1 w-full min-h-0 flex items-center justify-center">
                      <div className="w-full aspect-square max-h-full flex items-center justify-center">
                        <motion.div
                          className="relative w-full h-full aspect-square rounded-[20px] overflow-hidden shadow-lg bg-black/5"
                          initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                          animate={{ opacity: 1, scale: 1, rotate: getTilt(globalIndex) }}
                          transition={{ duration: 0.8, delay: globalIndex * 0.08 }}
                        >
                          <Image src={media.url} alt="Memory" fill className="object-contain p-[10px]" />
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
                
                {bottomSpacer > 0 && <div style={{ flex: bottomSpacer }} />}
              </div>
            );
          })}
        </div>

        {/* CENTRAL TEXT BOX WITH 20px CLEARANCE */}
        <motion.div
          className="relative z-50 pointer-events-auto mx-[20px] flex-shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: activeDisplayList.length * 0.05 }}
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
        <div 
          className="h-full flex-1 flex justify-center items-center gap-[10px] min-w-0 pointer-events-auto"
          style={{ transform: `scale(${rightScaleBonus})`, transformOrigin: 'center' }}
        >
          {rightChunks.map((chunk, colIdx) => {
            const slotsInCol = rightCols[colIdx];
            const diff = globalMaxSlots - slotsInCol;
            const topSpacer = diff > 0 ? 0.5 : 0;
            const bottomSpacer = diff > 0 ? diff - 0.5 : 0;

            return (
              <div key={`right-col-${colIdx}`} className="h-full flex-1 flex flex-col items-center gap-[10px] min-w-0">
                {topSpacer > 0 && <div style={{ flex: topSpacer }} />}
                
                {chunk.map((media, slotIdx) => {
                  let globalIndex = leftTotalCount;
                  for (let i = 0; i < colIdx; i++) globalIndex += rightCols[i];
                  globalIndex += slotIdx;

                  return (
                    <div key={`r-slot-${globalIndex}`} className="flex-1 w-full min-h-0 flex items-center justify-center">
                      <div className="w-full aspect-square max-h-full flex items-center justify-center">
                        <motion.div
                          className="relative w-full h-full aspect-square rounded-[20px] overflow-hidden shadow-lg bg-black/5"
                          initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                          animate={{ opacity: 1, scale: 1, rotate: getTilt(globalIndex) }}
                          transition={{ duration: 0.8, delay: globalIndex * 0.08 }}
                        >
                          <Image src={media.url} alt="Memory" fill className="object-contain p-[10px]" />
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
                
                {bottomSpacer > 0 && <div style={{ flex: bottomSpacer }} />}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
