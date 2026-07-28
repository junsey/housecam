"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useRef } from "react";

type RecommendedProduct = {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  shortDescription: string;
  unitPriceCents: number;
  imageUrl: string | null;
};

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function RecommendedProductsCarousel({ products }: { products: RecommendedProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function move(direction: -1 | 1) {
    trackRef.current?.scrollBy({ left: direction * 620, behavior: "smooth" });
  }

  return (
    <section className="recommended-products" id="beneficios" aria-labelledby="recommended-products-title">
      <div className="container">
        <div className="recommended-products-heading">
          <div>
            <p className="section-kicker">Productos recomendados</p>
            <h2 id="recommended-products-title">Soluciones para empezar</h2>
          </div>
          <Link href="/productos#catalogo">Ver todos los productos →</Link>
        </div>

        <div className="recommended-products-shell">
          <div className="recommended-products-track" ref={trackRef}>
            {products.map((product) => (
              <article className="recommended-product-card" key={product.id}>
                <Link className="recommended-product-visual" href={`/productos/${product.slug}` as Route} aria-label={`Ver ${product.name}`}>
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill sizes="230px" />
                  ) : (
                    <div className="recommended-product-placeholder" aria-hidden="true">
                      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="20" width="39" height="27" rx="6" />
                        <circle cx="29" cy="33.5" r="9" />
                        <path d="m48 28 8-5v21l-8-5M17 20l3-6h17l3 6" />
                      </svg>
                    </div>
                  )}
                </Link>
                <div className="recommended-product-body">
                  <p>{product.categoryName}</p>
                  <h3><Link href={`/productos/${product.slug}` as Route}>{product.name}</Link></h3>
                  <span>{product.shortDescription}</span>
                  <strong>{money.format(product.unitPriceCents / 100)}</strong>
                </div>
              </article>
            ))}
          </div>
          {products.length > 4 && (
            <>
              <button className="recommended-products-arrow is-previous" type="button" aria-label="Ver productos anteriores" onClick={() => move(-1)}>‹</button>
              <button className="recommended-products-arrow is-next" type="button" aria-label="Ver más productos" onClick={() => move(1)}>›</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
