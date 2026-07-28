"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { getWhatsappHref } from "@/lib/whatsapp";
import { useCartStore } from "@/stores/cart-store";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export function PublicCart({ whatsappNumber }: { whatsappNumber: string }) {
  const [open, setOpen] = useState(false);
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const itemCount = hydrated ? items.reduce((total, item) => total + item.quantity, 0) : 0;
  const total = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const message = `Hola, quiero consultar por este pedido:\n${items.map((item) =>
    `• ${item.quantity} ${item.purchaseMode === "pack10" ? "pack(s) de 10" : "unidad(es)"} de ${item.name}`).join("\n")}\nTotal de referencia: ${money.format(total / 100)}.`;
  const checkoutHref = useMemo(() => getWhatsappHref(whatsappNumber, message), [message, whatsappNumber]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="public-cart" ref={panelRef}>
      <button className="public-cart-trigger" type="button" aria-label={`Abrir carrito${itemCount ? `, ${itemCount} productos` : ""}`} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 7H6" /><circle cx="10" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" /></svg>
        {itemCount > 0 && <span>{itemCount > 99 ? "99+" : itemCount}</span>}
      </button>
      {open && <>
        <button className="public-cart-backdrop" type="button" aria-label="Cerrar carrito" onClick={() => setOpen(false)} />
        <aside className="public-cart-panel" aria-label="Carrito">
          <div className="public-cart-heading">
            <div><p>Tu carrito</p><span>{itemCount} {itemCount === 1 ? "producto" : "productos"}</span></div>
            <button type="button" aria-label="Cerrar carrito" onClick={() => setOpen(false)}>×</button>
          </div>
          {items.length ? <>
            <div className="public-cart-items">
              {items.map((item) => {
                const detailPath = item.storefront === "housepet" ? `/housepet/productos/${item.slug}` : `/productos/${item.slug}`;
                return <article className="public-cart-item" key={`${item.productId}-${item.purchaseMode}`}>
                  <Link className="public-cart-item-image" href={detailPath as Route} onClick={() => setOpen(false)}>
                    {item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="72px" /> : <span aria-hidden="true">HC</span>}
                  </Link>
                  <div>
                    <Link href={detailPath as Route} onClick={() => setOpen(false)}>{item.name}</Link>
                    <small>{item.purchaseMode === "pack10" ? "Pack de 10" : "Unidad"}</small>
                    <strong>{money.format(item.unitPriceCents / 100)}</strong>
                    <div className="public-cart-quantity">
                      <button type="button" aria-label="Restar uno" onClick={() => setQuantity(item.productId, item.purchaseMode, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label="Sumar uno" onClick={() => setQuantity(item.productId, item.purchaseMode, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="public-cart-remove" type="button" onClick={() => removeItem(item.productId, item.purchaseMode)}>Eliminar</button>
                </article>;
              })}
            </div>
            <div className="public-cart-summary">
              <div><span>Total estimado</span><strong>{money.format(total / 100)}</strong></div>
              {checkoutHref
                ? <a className="button button-primary" href={checkoutHref} target="_blank" rel="noopener noreferrer">Realizar pedido</a>
                : <button className="button button-primary" type="button" disabled>Contacto no disponible</button>}
              <button className="public-cart-clear" type="button" onClick={clear}>Vaciar carrito</button>
            </div>
          </> : <div className="public-cart-empty"><span>Tu carrito está vacío</span><p>Agregá productos desde su página de detalle.</p></div>}
        </aside>
      </>}
    </div>
  );
}
