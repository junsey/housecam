import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductBuyPanel } from "@/components/product-buy-panel";
import { ProductGallery } from "@/components/product-gallery";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getWhatsappSettings } from "@/features/catalog/catalog-admin.data";
import { getStoreProductBySlug } from "@/features/catalog/catalog-store.data";

export async function PublicProductDetail({ brand, slug }: { brand: "housecam" | "housepet"; slug: string }) {
  const [product, whatsapp] = await Promise.all([getStoreProductBySlug(brand, slug), getWhatsappSettings()]);
  if (!product) notFound();
  const isPet = brand === "housepet";
  const catalogPath = isPet ? "/housepet/productos" : "/productos";
  const cover = product.images.find((image) => image.isCover) ?? product.images[0];

  return (
    <div className={`product-detail-page brand-page-enter ${isPet ? "brand-housepet" : "brand-housecam"}`}>
      <PublicHeader activePath={isPet ? "/housepet/productos" : "/productos"} brand={brand} whatsappNumber={whatsapp.value} />
      <main className="product-detail-main">
        <div className="container">
          <nav className="product-breadcrumb" aria-label="Ruta del producto">
            <Link href={isPet ? "/housepet" : "/desarrollo"}>Inicio</Link><span>›</span>
            <Link href={`${catalogPath}#catalogo`}>Tienda</Link><span>›</span>
            <span>{product.name}</span>
          </nav>

          <div className="product-detail-layout">
            <div className="product-detail-content">
              <section className="product-detail-box">
                <ProductGallery images={product.images} productName={product.name} />
              </section>

              <section className="product-detail-box product-description-box">
                <p className="section-kicker">Descripción</p>
                <h2>Acerca de este producto</h2>
                <p>{product.description}</p>
              </section>

              <section className="product-detail-box product-specs-box">
                <p className="section-kicker">Detalles</p>
                <h2>Características</h2>
                {product.specs.length ? (
                  <dl>{product.specs.map((spec) => <div key={spec.id}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
                ) : <p>Consultanos para conocer todos los detalles técnicos de este producto.</p>}
              </section>
            </div>

            <ProductBuyPanel product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              storefront: brand,
              unitPriceCents: product.unitPriceCents,
              pack10PriceCents: product.pack10PriceCents,
              availableUnits: product.availableUnits,
              imageUrl: cover?.url ?? null,
            }} whatsappNumber={whatsapp.value} />
          </div>
        </div>
      </main>
      <PublicFooter brand={brand} />
    </div>
  );
}
