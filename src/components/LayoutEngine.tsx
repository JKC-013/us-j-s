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

// Determines the column distribution across [Left Side, Right Side]
function getColumnDistribution(count: number): { leftCols: number[]; rightCols: number[] } {
  switch (count) {
    case 1: return { leftCols: [1], rightCols: [] };
    case 2: return { leftCols: [1], rightCols: [1] };
    case 3: return { leftCols: [2], rightCols: [1] };
    case 4: return { leftCols: [2], rightCols: [2] };
    case 5: return { leftCols: [3], rightCols: [2] };
    case 6: return { leftCols: [3], rightCols: [3] };
    case 7: return { leftCols: [3, 1], rightCols: [3] };
    case 8: return { leftCols: [3, 1], rightCols: [1, 3] };
    case 9: return { leftCols: [3, 1], rightCols: [3, 2] };
    case 10: return { leftCols: [3, 2], rightCols: [2, 3] };
    default: {
      const half = Math.ceil(count / 2);
      return { leftCols: [half], rightCols: [count - half] };
    }
  }
}

export function LayoutEngine({ text, mediaList }: LayoutEngineProps) {
  const displayList = useMemo(() => mediaList.slice(0, 10), [mediaList]);
  const totalImages = displayList.length;

  const { leftCols, rightCols } = useMemo(
    () => getColumnDistribution(totalImages),
    [totalImages]
  );

  // Calculate maximum vertical slots per side
  const maxLeftSlots = Math.max(...leftCols, 1);
  const maxRightSlots = Math.max(...rightCols, 0);

  // Determines half-step offset for the shorter column
  const leftTotalCapacity = leftCols.reduce((a, b) => a + b, 0);
  const rightTotalCapacity = rightCols.reduce((a, b) => a + b, 0);
  
  const leftIsShorter = leftTotalCapacity < rightTotalCapacity;
  const rightIsShorter = rightTotalCapacity < leftTotalCapacity;

  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden bg-transparent">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.40),transparent_35%)] pointer-events-none" />

      {/* Container with strict 10px margins */}
      <div className="relative w-full h-full p-[10px] flex justify-between items-center pointer-events-none">
        
        {/* LEFT SIDE CONTAINER */}
        <div className="h-full flex-1 flex justify-around items-center gap-2 pointer-events-auto">
          {leftCols.map((slotsInCol, colIdx) => {
            const isColumnShorter = leftIsShorter || slotsInCol < maxLeftSlots;

            return (
              <div
                key={`left-col-${colIdx}`}
                className="h-full flex-1 flex flex-col justify-around items-center"
                style={{
                  paddingTop: isColumnShorter ? "12%" : "0px", // Half-step offset down
                }}
              >
                {Array.from({ length: slotsInCol }).map((_, slotIdx) => {
                  const imageIdx = (colIdx * slotsInCol + slotIdx) * 2;
                  const media = displayList[imageIdx];
                  if (!media) return null;

                  return (
                    <motion.div
                      key={`left-img-${imageIdx}`}
                      className="relative w-full aspect-square max-h-[280px] max-w-[280px] rounded-[20px] overflow-hidden shadow-lg border-none outline-none"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: imageIdx * 0.08 }}
                    >
                      <Image
                        src={media.url}
                        alt="Memory"
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* CENTRAL TEXT BOX WITH 10px CLEARANCE */}
        <motion.div
          className="relative z-50 pointer-events-auto mx-[10px] flex-shrink-0"
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
        <div className="h-full flex-1 flex justify-around items-center gap-2 pointer-events-auto">
          {rightCols.map((slotsInCol, colIdx) => {
            const isColumnShorter = rightIsShorter || slotsInCol < maxRightSlots;

            return (
              <div
                key={`right-col-${colIdx}`}
                className="h-full flex-1 flex flex-col justify-around items-center"
                style={{
                  paddingTop: isColumnShorter ? "12%" : "0px", // Half-step offset down
                }}
              >
                {Array.from({ length: slotsInCol }).map((_, slotIdx) => {
                  const imageIdx = (colIdx * slotsInCol + slotIdx) * 2 + 1;
                  const media = displayList[imageIdx];
                  if (!media) return null;

                  return (
                    <motion.div
                      key={`right-img-${imageIdx}`}
                      className="relative w-full aspect-square max-h-[280px] max-w-[280px] rounded-[20px] overflow-hidden shadow-lg border-none outline-none"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: imageIdx * 0.08 }}
                    >
                      <Image
                        src={media.url}
                        alt="Memory"
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
