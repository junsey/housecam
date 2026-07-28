"use client";

import { useState } from "react";

function toSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function CategoryIdentityFields({ fieldClass, disabled }: { fieldClass: string; disabled: boolean }) {
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  return (
    <>
      <label className="grid gap-2 text-sm font-semibold">Nombre
        <input className={fieldClass} name="name" required disabled={disabled} onChange={(event) => {
          if (!slugEdited) setSlug(toSlug(event.target.value));
        }} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">Slug
        <input className={fieldClass} name="slug" value={slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="camaras-exteriores" required disabled={disabled} onChange={(event) => {
          setSlugEdited(true);
          setSlug(toSlug(event.target.value));
        }} />
        <small className="font-normal text-[var(--muted)]">Se usa en la URL. Solo minúsculas, números y guiones medios.</small>
      </label>
    </>
  );
}
