"use client";

import { useMemo, useState } from "react";

import { getWhatsappHref } from "@/lib/whatsapp";
import { useCartStore } from "@/stores/cart-store";

type ProductBuyPanelProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    storefront: "housecam" | "housepet";
    unitPriceCents: number;
    pack10PriceCents: number | null;
    availableUnits: number;
    imageUrl: string | null;
  };
  whatsappNumber: string;
};

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export function ProductBuyPanel({ product, whatsappNumber }: ProductBuyPanelProps) {
  const [mode, setMode] = useState<"unit" | "pack10">("unit");
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const price = mode === "pack10" ? product.pack10PriceCents : product.unitPriceCents;
  const requiredUnits = quantity * (mode === "pack10" ? 10 : 1);
  const available = product.availableUnits >= requiredUnits;
  const canBuyPack = product.pack10PriceCents !== null && product.availableUnits >= 10;
  const whatsappHref = useMemo(() => getWhatsappHref(
    whatsappNumber,
    `Hola, quiero comprar ${quantity} ${mode === "pack10" ? "pack(s) de 10" : "unidad(es)"} de ${product.name}.`,
  ), [mode, product.name, quantity, whatsappNumber]);
  const requestHref = useMemo(() => getWhatsappHref(
    whatsappNumber,
    `Hola, quiero consultar disponibilidad de ${product.name}. Necesito ${quantity} ${mode === "pack10" ? "pack(s) de 10" : "unidad(es)"}.`,
  ), [mode, product.name, quantity, whatsappNumber]);

  function addToCart() {
    if (!available || price === null) return setFeedback("La cantidad seleccionada no está disponible.");
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      storefront: product.storefront,
      purchaseMode: mode,
      quantity,
      unitPriceCents: price,
      imageUrl: product.imageUrl,
    });
    setFeedback("Producto agregado al carrito.");
  }

  function buyNow() {
    if (product.availableUnits === 0) {
      if (!requestHref) return setFeedback("La consulta por WhatsApp está temporalmente deshabilitada.");
      window.open(requestHref, "_blank", "noopener,noreferrer");
      return;
    }
    if (!available) return setFeedback("No hay suficientes unidades disponibles.");
    if (!whatsappHref) return setFeedback("La compra por WhatsApp está temporalmente deshabilitada.");
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
  }

  return (
    <aside className="product-buy-panel" aria-label="Opciones de compra">
      <h1>{product.name}</h1>
      <p className={`product-availability ${product.availableUnits > 0 ? "is-available" : "is-unavailable"}`}>
        <span />{product.availableUnits > 0 ? "Disponible" : "Agotado"}
      </p>
      <strong className="product-buy-price">{price === null ? "No disponible" : money.format(price / 100)}</strong>

      {product.pack10PriceCents !== null && <fieldset className="product-buy-modes">
        <legend>Presentación</legend>
        <button className={mode === "unit" ? "is-active" : ""} type="button" onClick={() => { setMode("unit"); setFeedback(""); }}>Unidad</button>
        <button className={mode === "pack10" ? "is-active" : ""} type="button" disabled={!canBuyPack} onClick={() => { setMode("pack10"); setFeedback(""); }}>Pack de 10</button>
      </fieldset>}

      <label className="product-quantity">Cantidad
        <div><button type="button" aria-label="Restar uno" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number.parseInt(event.target.value || "1", 10)))} /><button type="button" aria-label="Sumar uno" onClick={() => setQuantity((value) => value + 1)}>+</button></div>
      </label>

      <button className="product-buy-primary" type="button" onClick={buyNow}>{product.availableUnits === 0 ? "Pedir por encargo" : "Comprar ahora"}</button>
      <button className="product-buy-secondary" type="button" disabled={product.availableUnits === 0} onClick={addToCart}>Agregar al carrito</button>
      {feedback && <p className="product-buy-feedback" role="status">{feedback}</p>}
      {!available && feedback && requestHref && <div className="product-stock-request">
        <p>Podemos ayudarte a conseguirlo o informarte cuándo vuelve a ingresar.</p>
        <a href={requestHref} target="_blank" rel="noopener noreferrer">Consultar disponibilidad</a>
      </div>}
      <p className="product-buy-note">Posterior a la compra, podrás coordinar medios de pago, envío u organizar el retiro en Córdoba Capital.</p>
    </aside>
  );
}
