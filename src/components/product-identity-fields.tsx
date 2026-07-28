"use client";

import { useState } from "react";

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductIdentityFields({ className, disabled }: { className: string; disabled: boolean }) {
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  return (
    <>
      <label className="grid gap-2 text-sm font-semibold">
        Nombre
        <input
          className={className}
          name="name"
          required
          disabled={disabled}
          onChange={(event) => {
            if (!slugEdited) setSlug(toSlug(event.target.value));
          }}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        SKU
        <input className={className} value="Se genera automáticamente" disabled readOnly aria-describedby="sku-help" />
        <small className="font-normal text-[var(--muted)]" id="sku-help">HouseCam asignará un código único al crear el producto.</small>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Slug
        <input
          className={className}
          name="slug"
          value={slug}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          placeholder="camara-wifi-exterior"
          required
          disabled={disabled}
          aria-describedby="slug-help"
          onChange={(event) => {
            setSlugEdited(true);
            setSlug(toSlug(event.target.value));
          }}
        />
        <small className="font-normal text-[var(--muted)]" id="slug-help">Se usa en la URL. Solo minúsculas, números y guiones medios.</small>
      </label>
    </>
  );
}
