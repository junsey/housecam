import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getStoreProducts } from "@/features/catalog/catalog-store.data";
import { getWhatsappSettings } from "@/features/catalog/catalog-admin.data";
import { getWhatsappHref } from "@/lib/whatsapp";

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

function categorySlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function StorefrontPage({ brand, selectedCategory = "" }: { brand: "housecam" | "housepet"; selectedCategory?: string }) {
  const isPet = brand === "housepet";
  const [catalog, whatsapp] = await Promise.all([getStoreProducts(brand), getWhatsappSettings()]);
  const categories = [...new Set(catalog.items.map((product) => product.categoryName))].map((name) => ({
    name,
    slug: categorySlug(name),
    count: catalog.items.filter((product) => product.categoryName === name).length,
  }));
  const activeCategory = categories.find((category) => category.slug === selectedCategory);
  const visibleProducts = activeCategory ? catalog.items.filter((product) => product.categoryName === activeCategory.name) : catalog.items;
  const storePath = isPet ? "/housepet/productos" : "/productos";
  const adviceHref = getWhatsappHref(whatsapp.value, `Hola, necesito asesoramiento para elegir una solución ${isPet ? "HousePet" : "HouseCam"}.`);

  return (
    <div className={`store-page brand-page-enter ${isPet ? "brand-housepet" : "brand-housecam"}`}>
      <PublicHeader activePath={isPet ? "/housepet/productos" : "/productos"} brand={brand} whatsappNumber={whatsapp.value} />
      <main id="tienda">
        <section className="store-intro">
          <div className="container">
            <p className="eyebrow">Tienda {isPet ? "HousePet" : "HouseCam"}</p>
            <div className="store-intro-grid">
              <div>
                <h1>{isPet ? "Tecnología para cuidar a quienes son familia." : "Elegí tranquilidad para tu hogar."}</h1>
                <p className="lead">{isPet ? "Monitoreo, alimentación y bienestar conectado para acompañar a tus mascotas todos los días." : "Cámaras, kits y accesorios seleccionados para instalar fácil y acompañarte todos los días."}</p>
              </div>
              {adviceHref ? <a className="button button-secondary" href={adviceHref} target="_blank" rel="noopener noreferrer">¿No sabés cuál elegir? Te asesoramos</a> : <button className="button button-secondary contact-disabled" type="button" disabled title="La función de contacto está temporalmente deshabilitada. Probá más tarde.">Contacto no disponible. Probá más tarde.</button>}
            </div>
            <div className="store-benefits"><span>✓ Asistencia local</span><span>✓ Productos seleccionados</span><span>✓ Acompañamiento real</span></div>
          </div>
        </section>
        <section className="store-catalog" id="catalogo" aria-labelledby="catalog-title">
          <div className="container">
            <div className="store-toolbar">
              <div><p className="section-kicker">Catálogo</p><h2 id="catalog-title">Productos {isPet ? "HousePet" : "HouseCam"}</h2></div>
              <nav className="store-filters" aria-label="Categorías">
                <Link className={!activeCategory ? "is-active" : ""} href={`${storePath}#catalogo`} aria-current={!activeCategory ? "page" : undefined}>
                  Todos <span>{catalog.items.length}</span>
                </Link>
                {categories.map((category) => (
                  <Link className={activeCategory?.slug === category.slug ? "is-active" : ""} href={`${storePath}?categoria=${category.slug}#catalogo`} aria-current={activeCategory?.slug === category.slug ? "page" : undefined} key={category.slug}>
                    {category.name} <span>{category.count}</span>
                  </Link>
                ))}
              </nav>
            </div>
            {catalog.usingDemoData && <p className="store-demo-note">Catálogo de muestra. Conectá el administrador para publicar precios y stock reales.</p>}
            <div className="store-product-grid">
              {visibleProducts.map((product) => (
                <article className="store-product-card" key={product.id}>
                  <div className="store-product-visual">
                    <ProductVisual imageUrl={product.imageUrl} name={product.name} type={product.type} />
                    <span className="store-product-badge">{product.type === "kit" ? `Kit ${isPet ? "HousePet" : "HouseCam"}` : product.categoryName}</span>
                  </div>
                  <div className="store-product-body">
                    <p className="store-product-category">{product.categoryName}</p>
                    <h3><Link className="store-product-detail-link" href={`${storePath}/${product.slug}` as Route}>{product.name}</Link></h3><p>{product.shortDescription}</p>
                    <div className="store-product-footer">
                      <div><span>Desde</span><strong>{money.format(product.unitPriceCents / 100)}</strong></div>
                      {getWhatsappHref(whatsapp.value, `Hola, quiero comprar ${product.name}.`) ? <a className="button button-primary" href={getWhatsappHref(whatsapp.value, `Hola, quiero comprar ${product.name}.`)!} target="_blank" rel="noopener noreferrer">Comprar</a> : <button className="button button-primary contact-disabled" type="button" disabled title="La función de contacto está temporalmente deshabilitada. Probá más tarde.">No disponible</button>}
                    </div>
                    {product.pack10PriceCents && <small>Pack de 10: {money.format(product.pack10PriceCents / 100)}</small>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter brand={brand} />
    </div>
  );
}
