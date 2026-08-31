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

// Deterministic random rotation between 10 to 30 degrees (left or right)
const getTilt = (index: number) => {
  const angles = [12, -24, 18, -15, 28, -21, 14, -29, 22, -11, 26, -17, 19, -25];
  return angles[index % angles.length];
};

export function LayoutEngine({ text, mediaList }: LayoutEngineProps) {
  const displayList = useMemo(() => mediaList.slice(0, 10), [mediaList]);
  const totalImages = displayList.length;

  const { leftCols, rightCols } = useMemo(
    () => getColumnDistribution(totalImages),
    [totalImages]
  );

  const maxLeftSlots = Math.max(...leftCols, 1);
  const maxRightSlots = Math.max(...rightCols, 0);

  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden bg-transparent">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.40),transparent_35%)] pointer-events-none" />

      {/* Container with strict 20px margins */}
      <div className="relative w-full h-full p-[20px] flex justify-between items-center pointer-events-none">
        
        {/* LEFT SIDE CONTAINER */}
        <div className="h-full flex-1 flex justify-center items-center pointer-events-auto">
          {/* Inner wrapper aligns children to top so the half-step calculation is exact */}
          <div className="flex justify-center items-start gap-[10px] w-full">
            {leftCols.map((slotsInCol, colIdx) => {
              const isColumnShorter = slotsInCol < maxLeftSlots;

              return (
                <div
                  key={`left-col-${colIdx}`}
                  className="flex-1 flex flex-col items-center gap-[10px]"
                  style={{
                    // 50% of the column width perfectly equals a half-step drop for square slots
                    marginTop: isColumnShorter ? "50%" : "0px",
                  }}
                >
                  {Array.from({ length: slotsInCol }).map((_, slotIdx) => {
                    const imageIdx = (colIdx * slotsInCol + slotIdx) * 2;
                    const media = displayList[imageIdx];
                    if (!media) return null;

                    return (
                      <motion.div
                        key={`left-img-${imageIdx}`}
                        className="relative w-full aspect-square max-h-[280px] max-w-[280px] rounded-[20px] overflow-hidden shadow-lg bg-black/5"
                        initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: getTilt(imageIdx) }}
                        transition={{ duration: 0.8, delay: imageIdx * 0.08 }}
                      >
                        <Image
                          src={media.url}
                          alt="Memory"
                          fill
                          className="object-contain p-1"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTRAL TEXT BOX WITH 20px CLEARANCE */}
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
        <div className="h-full flex-1 flex justify-center items-center pointer-events-auto">
          <div className="flex justify-center items-start gap-[10px] w-full">
            {rightCols.map((slotsInCol, colIdx) => {
              const isColumnShorter = slotsInCol < maxRightSlots;

              return (
                <div
                  key={`right-col-${colIdx}`}
                  className="flex-1 flex flex-col items-center gap-[10px]"
                  style={{
                    marginTop: isColumnShorter ? "50%" : "0px", 
                  }}
                >
                  {Array.from({ length: slotsInCol }).map((_, slotIdx) => {
                    const imageIdx = (colIdx * slotsInCol + slotIdx) * 2 + 1;
                    const media = displayList[imageIdx];
                    if (!media) return null;

                    return (
                      <motion.div
                        key={`right-img-${imageIdx}`}
                        className="relative w-full aspect-square max-h-[280px] max-w-[280px] rounded-[20px] overflow-hidden shadow-lg bg-black/5"
                        initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: getTilt(imageIdx) }}
                        transition={{ duration: 0.8, delay: imageIdx * 0.08 }}
                      >
                        <Image
                          src={media.url}
                          alt="Memory"
                          fill
                          className="object-contain p-1"
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
    </div>
  );
}
