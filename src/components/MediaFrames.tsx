import Image from "next/image";

export type MediaShape = 'portrait' | 'landscape' | 'square' | 'panorama';

export interface MediaProps {
  url: string;
  type: string;
  shape: string;
}

export function MediaFrame({ media, className = "" }: { media: MediaProps; className?: string }) {
  const Content = (
    <Image
      src={media.url}
      alt="Memory"
      fill
      className="object-contain"
    />
  );

  const frameBase = "relative overflow-hidden rounded-[28px] bg-transparent";

  switch (media.shape) {
    case "portrait":
      return (
        <div className={`${frameBase} ${className}`} style={{ width: 'min(200px, 20vw)', height: 'min(280px, 34vh)' }}>
          <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            {Content}
          </div>
        </div>
      );
    case "landscape":
      return (
        <div className={`${frameBase} ${className}`} style={{ width: 'min(280px, 28vw)', height: 'min(200px, 24vh)' }}>
          <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            {Content}
          </div>
        </div>
      );
    case "panorama":
      return (
        <div className={`${frameBase} ${className}`} style={{ width: 'min(500px, 60vw)', height: 'min(160px, 18vh)' }}>
          <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            {Content}
          </div>
        </div>
      );
    case "square":
    default:
      return (
        <div className={`${frameBase} ${className}`} style={{ width: 'min(220px, 22vw)', height: 'min(220px, 26vh)' }}>
          <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            {Content}
          </div>
        </div>
      );
  }
}
