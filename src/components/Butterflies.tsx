"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const butterflyModels = [
  "/images/b1.png",
  "/images/b2.png",
  "/images/b3.png",
  "/images/b4.png",
  "/images/b5.png",
];

const butterflyShapes: Array<{ x: string; y: string; size: number; rotate: number; delay: number; src: string }> = [
  { x: '10%', y: '12%', size: 150, rotate: -22, delay: 0, src: butterflyModels[0] },
  { x: '22%', y: '26%', size: 124, rotate: 20, delay: 1.2, src: butterflyModels[1] },
  { x: '38%', y: '16%', size: 132, rotate: -16, delay: 1.8, src: butterflyModels[2] },
  { x: '56%', y: '22%', size: 108, rotate: 24, delay: 0.7, src: butterflyModels[3] },
  { x: '70%', y: '14%', size: 146, rotate: -14, delay: 2.3, src: butterflyModels[4] },
  { x: '18%', y: '64%', size: 128, rotate: 18, delay: 0.5, src: butterflyModels[0] },
  { x: '30%', y: '78%', size: 108, rotate: -30, delay: 1.3, src: butterflyModels[1] },
  { x: '46%', y: '70%', size: 138, rotate: 28, delay: 1.9, src: butterflyModels[2] },
  { x: '62%', y: '80%', size: 98, rotate: -20, delay: 1.1, src: butterflyModels[3] },
  { x: '80%', y: '60%', size: 146, rotate: 22, delay: 1.7, src: butterflyModels[4] },
  { x: '12%', y: '84%', size: 112, rotate: -12, delay: 2.5, src: butterflyModels[0] },
  { x: '88%', y: '32%', size: 118, rotate: 14, delay: 2.1, src: butterflyModels[1] },
];

const lavenderClusters = [
  { left: '8%', height: '24vh', stems: 10 },
  { left: '22%', height: '28vh', stems: 9 },
  { left: '36%', height: '26vh', stems: 10 },
  { left: '52%', height: '30vh', stems: 9 },
  { left: '68%', height: '24vh', stems: 8 },
  { left: '84%', height: '28vh', stems: 8 },
];

export function Butterflies() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,1),transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.96),transparent_38%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none overflow-hidden">
        {lavenderClusters.map((cluster, index) => (
          <div key={index} className="absolute bottom-0 flex flex-col items-center" style={{ left: cluster.left, height: cluster.height }}>
            <div className="w-[1px] h-full bg-[rgba(255,255,255,0.06)]" />
            {Array.from({ length: cluster.stems }).map((_, stemIndex) => (
              <div
                key={stemIndex}
                className="absolute rounded-full bg-[rgba(196,168,255,0.12)] blur-sm"
                style={{
                  width: `${6 + (stemIndex % 3) * 2}px`,
                  height: `${6 + ((stemIndex + 1) % 3) * 2}px`,
                  bottom: `${6 + stemIndex * 18}px`,
                  left: `${-3 + (stemIndex % 2) * 4}px`,
                  transform: `rotate(${stemIndex % 2 === 0 ? -10 : 8}deg)`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {butterflyShapes.map((butterfly, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{ opacity: 0.18, scale: 0.96, rotate: butterfly.rotate }}
          animate={{
            opacity: [0.18, 0.24, 0.20, 0.22, 0.18],
            scale: [0.96, 1.12, 0.9, 1.04, 0.96],
            rotate: [butterfly.rotate, butterfly.rotate + 4, butterfly.rotate - 8, butterfly.rotate + 5, butterfly.rotate],
          }}
          transition={{
            duration: 36 + index * 1.6,
            delay: butterfly.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: butterfly.x,
            top: butterfly.y,
            width: butterfly.size,
            height: butterfly.size,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-full h-full opacity-85 filter grayscale contrast-100">
            <Image src={butterfly.src} alt="Butterfly" fill className="object-contain" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
