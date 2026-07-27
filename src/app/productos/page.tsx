import type { Metadata } from "next";
import Image from "next/image";

import { PublicHeader } from "@/components/public-header";
import { getStoreProducts } from "@/features/catalog/catalog-store.data";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Tienda HouseCam: cámaras, kits y accesorios para cuidar tu hogar.",
};

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

function ProductVisual({ imageUrl, name, type }: { imageUrl: string | null; name: string; type: "standard" | "kit" }) {
  if (imageUrl) return <Image src={imageUrl} alt={name} fill sizes="(max-width: 720px) 100vw, 33vw" className="store-product-image" />;
  return (
    <div className="store-product-placeholder" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        {type === "kit"
          ? <><rect x="9" y="16" width="46" height="35" rx="5" /><path d="M9 27h46M25 16v11M39 16v11" /><circle cx="24" cy="39" r="5" /><path d="M34 36h12M34 42h8" /></>
          : <><rect x="9" y="20" width="39" height="27" rx="6" /><circle cx="29" cy="33.5" r="9" /><path d="m48 28 8-5v21l-8-5M17 20l3-6h17l3 6" /></>}
      </svg>
    </div>
  );
}

export default async function ProductsPage() {
  const catalog = await getStoreProducts();
  const categories = [...new Set(catalog.items.map((product) => product.categoryName))];

  return (
    <div className="store-page">
      <PublicHeader activePath="/productos" />
      <main id="tienda">
        <section className="store-intro">
          <div className="container">
            <p className="eyebrow">Tienda HouseCam</p>
            <div className="store-intro-grid">
              <div>
                <h1>Elegí tranquilidad para tu hogar.</h1>
                <p className="lead">Cámaras, kits y accesorios seleccionados para instalar fácil y acompañarte todos los días.</p>
              </div>
              <a className="button button-secondary" href="mailto:hola@housecam.com?subject=Necesito%20asesoramiento">¿No sabés cuál elegir? Te asesoramos</a>
            </div>
            <div className="store-benefits"><span>✓ Asistencia local</span><span>✓ Productos seleccionados</span><span>✓ Instalación disponible</span></div>
          </div>
        </section>

        <section className="store-catalog" aria-labelledby="catalog-title">
          <div className="container">
            <div className="store-toolbar">
              <div><p className="section-kicker">Catálogo</p><h2 id="catalog-title">Productos HouseCam</h2></div>
              <nav className="store-filters" aria-label="Categorías">
                <a className="is-active" href="#catalog-title">Todos</a>
                {categories.map((category) => <a href={`#${category.toLowerCase()}`} key={category}>{category}</a>)}
              </nav>
            </div>

            {catalog.usingDemoData && <p className="store-demo-note">Catálogo de muestra. Conectá el administrador para publicar precios y stock reales.</p>}

            <div className="store-product-grid">
              {catalog.items.map((product) => (
                <article className="store-product-card" id={product.categoryName.toLowerCase()} key={product.id}>
                  <div className="store-product-visual">
                    <ProductVisual imageUrl={product.imageUrl} name={product.name} type={product.type} />
                    <span className="store-product-badge">{product.type === "kit" ? "Kit HouseCam" : product.categoryName}</span>
                  </div>
                  <div className="store-product-body">
                    <p className="store-product-category">{product.categoryName}</p>
                    <h3>{product.name}</h3>
                    <p>{product.shortDescription}</p>
                    <div className="store-product-footer">
                      <div><span>Desde</span><strong>{money.format(product.unitPriceCents / 100)}</strong></div>
                      <a className="button button-primary" href={`mailto:hola@housecam.com?subject=${encodeURIComponent(`Consulta por ${product.name}`)}`}>Consultar</a>
                    </div>
                    {product.pack10PriceCents && <small>Pack de 10: {money.format(product.pack10PriceCents / 100)}</small>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
