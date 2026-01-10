import type { Experimental_GeneratedImage } from "ai";
import { cn } from "@/lib/utils";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
  mediaType?: string;
  base64?: string;
  uint8Array?: Uint8Array;
};

export const Image = ({
  base64,
  uint8Array,
  mediaType = "image/png",
  ...props
}: ImageProps) => (
  // biome-ignore lint/nursery/useImageSize: dynamic base64 content
  // biome-ignore lint/performance/noImgElement: base64 data URLs require native img
  <img
    {...props}
    alt={props.alt}
    className={cn(
      "h-auto max-w-full overflow-hidden rounded-md",
      props.className
    )}
    src={`data:${mediaType};base64,${base64}`}
  />
);
