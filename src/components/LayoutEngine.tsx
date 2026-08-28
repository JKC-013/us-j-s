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
    // Dynamic scale: Ensures larger sets shrink sufficiently to fit their zones
    const scale = 
      totalCount <= 1 ? 1.0 : 
      totalCount <= 3 ? 0.85 : 
      totalCount <= 6 ? 0.72 : 0.58;

    const scaleStr = ` scale(${scale})`;

    if (shape === "panorama") {
      return { top: '12%', left: '50%', transform: `translate(-50%, -50%) rotate(-1deg)${scaleStr}` };
    }

    // 8 Strict, Non-Overlapping Perimeter Zones
    // Outer boundary: 10% - 90% X, 12% - 88% Y (Prevents screen edge clipping)
    // Central text box safety zone: 32% - 68% X, 25% - 75% Y (Keeps photos completely outside text)
    const fixedZones = [
      { x: '16%', y: '16%', rotate: -4 },  // 0: Top-Left Corner
      { x: '84%', y: '16%', rotate: 5 },   // 1: Top-Right Corner
      { x: '16%', y: '84%', rotate: 4 },   // 2: Bottom-Left Corner
      { x: '84%', y: '84%', rotate: -5 },  // 3: Bottom-Right Corner
      { x: '10%', y: '50%', rotate: -6 },  // 4: Mid-Left Outer Edge
      { x: '90%', y: '50%', rotate: 6 },   // 5: Mid-Right Outer Edge
      { x: '50%', y: '10%', rotate: 2 },   // 6: Top-Center Outer Edge
      { x: '50%', y: '90%', rotate: -2 },  // 7: Bottom-Center Outer Edge
    ];

    const pos = fixedZones[index % fixedZones.length];

    return {
      top: pos.y,
      left: pos.x,
      transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)${scaleStr}`,
    };
  };

  return (
    <div className="absolute inset-x-0 top-[104px] bottom-0 overflow-hidden">
      <div className="absolute inset-0 bg-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.40),transparent_35%)] pointer-events-none" />
      
      {/* Background ink blobs */}
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

      {/* Render Images */}
      {mediaList.map((media, i) => {
        const style = getTransform(i, media.shape, mediaList.length);
        const isPanorama = media.shape === "panorama";

        return (
          <motion.div
            key={i}
            className={`absolute z-20 ${isPanorama ? 'max-w-[78vw]' : ''}`}
            style={{
              ...(style as any),
              // Direct style resets to eliminate the ghost dotted lines/outlines
              outline: 'none',
              border: 'none',
              boxShadow: 'none',
            }}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: i * 0.15, ease: "easeOut" }}
          >
            {/* Safety padding zone around each photo */}
            <div className="p-3 bg-transparent pointer-events-auto border-none outline-none">
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
        transition={{ duration: 1.5, delay: mediaList.length * 0.15 }}
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
