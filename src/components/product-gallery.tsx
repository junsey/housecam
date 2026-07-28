"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { id: string; url: string; alt: string; isCover: boolean };

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const ordered = [...images].sort((a, b) => Number(b.isCover) - Number(a.isCover));
  const [activeId, setActiveId] = useState(ordered[0]?.id ?? "");
  const active = ordered.find((image) => image.id === activeId) ?? ordered[0];

  return (
    <div className="product-detail-gallery">
      <div className="product-detail-main-image">
        {active ? <Image src={active.url} alt={active.alt} fill priority sizes="(max-width: 900px) 100vw, 65vw" /> : (
          <div className="product-detail-image-placeholder" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="20" width="39" height="27" rx="6" /><circle cx="29" cy="33.5" r="9" /><path d="m48 28 8-5v21l-8-5M17 20l3-6h17l3 6" /></svg>
            <span>{productName}</span>
          </div>
        )}
      </div>
      {ordered.length > 1 && <div className="product-detail-thumbnails" aria-label="Imágenes del producto">
        {ordered.map((image) => <button className={image.id === active?.id ? "is-active" : ""} type="button" aria-label={`Ver ${image.alt}`} onClick={() => setActiveId(image.id)} key={image.id}><Image src={image.url} alt="" fill sizes="72px" /></button>)}
      </div>}
    </div>
  );
}
