"use client";

import { useState } from "react";

/** YouTube thumbnail with graceful fallback (maxres isn't generated for every video). */
export function Thumb({ src, alt = "", className = "", eager = false }: { src: string; alt?: string; className?: string; eager?: boolean }) {
  const [url, setUrl] = useState(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
      onError={() => {
        if (url.includes("maxresdefault")) setUrl(url.replace("maxresdefault", "hqdefault"));
        else if (url.includes("sddefault")) setUrl(url.replace("sddefault", "hqdefault"));
      }}
      onLoad={(e) => {
        // YouTube serves a 120×90 grey placeholder instead of 404 for missing maxres images
        const img = e.currentTarget;
        if (img.naturalWidth === 120 && url.includes("maxresdefault")) setUrl(url.replace("maxresdefault", "hqdefault"));
      }}
    />
  );
}
