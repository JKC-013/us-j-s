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
    // 1. Maximized Scaling: Pushed as high as mathematically possible without collision
    const scale = 
      totalCount <= 1 ? 1.5 : 
      totalCount <= 3 ? 1.25 : 
      totalCount <= 6 ? 1.05 : 0.9; // 0.9 is much larger than 0.58

    const scaleStr = ` scale(${scale})`;

    if (shape === "panorama") {
      return { top: '15%', left: '50%', transform: `translate(-50%, -50%) rotate(-1deg)${scaleStr}` };
    }

    // 2. Dynamic Margins: If images are huge (scale > 1.1), pull them closer to the center 
    // so they don't clip the screen edge. If they are smaller, push them out to fill empty space.
    const insetX = scale > 1.1 ? 22 : 14; 
    const insetY = scale > 1.1 ? 22 : 15;
    const edgeX  = scale > 1.1 ? 14 : 9;
    const edgeY  = scale > 1.1 ? 14 : 9;

    // 10 distinct max-capacity zones avoiding the 50/50 center block
    const fixedZones = [
      { x: `${insetX}%`, y: `${insetY}%`, rotate: -4 },        // 0: Top-Left Corner
      { x: `${100 - insetX}%`, y: `${insetY}%`, rotate: 5 },   // 1: Top-Right Corner
      { x: `${insetX}%`, y: `${100 - insetY}%`, rotate: 4 },   // 2: Bottom-Left Corner
      { x: `${100 - insetX}%`, y: `${100 - insetY}%`, rotate: -5 }, // 3: Bottom-Right Corner
      { x: `${edgeX}%`, y: '50%', rotate: -6 },                // 4: Mid-Left 
      { x: `${100 - edgeX}%`, y: '50%', rotate: 6 },           // 5: Mid-Right 
      { x: '50%', y: `${edgeY}%`, rotate: 2 },                 // 6: Top-Center 
      { x: '50%', y: `${100 - edgeY}%`, rotate: -2 },          // 7: Bottom-Center 
      { x: `${insetX + 15}%`, y: `${edgeY}%`, rotate: -3 },    // 8: Top-Left-Inner (for 9+ images)
      { x: `${100 - insetX - 15}%`, y: `${100 - edgeY}%`, rotate: 3 }, // 9: Bottom-Right-Inner (for 9+ images)
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

      {mediaList.map((media, i) => {
        const style = getTransform(i, media.shape, mediaList.length);
        const isPanorama = media.shape === "panorama";

        return (
          <motion.div
            key={i}
            // 3. The `[&_*]` class aggressively targets the dotted line coming from inside MediaFrame
            className={`absolute z-20 [&_*]:!border-solid [&_*]:!border-transparent ${isPanorama ? 'max-w-[78vw]' : ''}`}
            style={style as any}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: i * 0.15, ease: "easeOut" }}
          >
            <div className="p-4 bg-transparent pointer-events-auto">
              <MediaFrame media={media} className={isPanorama ? "w-full" : ""} />
            </div>
          </motion.div>
        );
      })}

      <motion.div
        className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: mediaList.length * 0.15 }}
      >
        {/* Adjusted padding to perfectly separate the scaled-up images from the box */}
        <div className="p-8 bg-transparent">
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
