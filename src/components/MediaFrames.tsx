import Image from "next/image";

export type MediaShape = 'portrait' | 'landscape' | 'square' | 'panorama' | 'vertical-video' | 'horizontal-video';

export interface MediaProps {
  url: string;
  type: string;
  shape: string;
}

export function MediaFrame({ media, className = "" }: { media: MediaProps; className?: string }) {
  const isVideo = media.type === "video" || media.shape.includes("video");

  const Content = isVideo ? (
    <video
      src={media.url}
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-contain grayscale"
    />
  ) : (
    <Image
      src={media.url}
      alt="Memory"
      fill
      className="object-contain grayscale"
    />
  );

  const frameBase = "relative overflow-hidden rounded-[28px] bg-transparent";

  switch (media.shape) {
    case "portrait":
      return (
        <div className={`${frameBase} ${className}`} style={{ width: 'min(260px, 26vw)', height: 'min(360px, 44vh)' }}>
          <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            {Content}
          </div>
        </div>
      );
    case "landscape":
      return (
        <div className={`${frameBase} ${className}`} style={{ width: 'min(420px, 48vw)', height: 'min(260px, 30vh)' }}>
          <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            {Content}
          </div>
        </div>
      );
    case "square":
      return (
        <div className={`${frameBase} ${className}`} style={{ width: 'min(300px, 32vw)', height: 'min(320px, 34vh)' }}>
          <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            {Content}
          </div>
        </div>
      );
    case "panorama":
      return (
        <div className={`${frameBase} ${className}`} style={{ width: 'min(760px, 82vw)', height: 'min(210px, 20vh)' }}>
          <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            {Content}
          </div>
        </div>
      );
    case "vertical-video":
    case "horizontal-video":
    default:
      const isVertical = media.shape === "vertical-video";
      return (
        <div className={`${frameBase} ${className}`} style={{ width: isVertical ? 'min(320px, 40vw)' : 'min(500px, 55vw)', height: isVertical ? 'min(460px, 52vh)' : 'min(280px, 34vh)' }}>
          <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            {Content}
          </div>
        </div>
      );
  }
}
