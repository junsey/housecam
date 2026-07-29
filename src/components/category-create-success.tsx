"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function CategoryCreateSuccess({ name }: { name: string }) {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => router.replace("/admin/categorias"), 2400);
    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <div className="admin-category-created" role="status" aria-live="polite">
      <span className="admin-category-created-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
      </span>
      <div>
        <h2 id="new-category-title">Categoría creada</h2>
        <p><strong>{name}</strong> se agregó correctamente al catálogo.</p>
      </div>
      <button type="button" onClick={() => router.replace("/admin/categorias")}>Crear otra categoría</button>
    </div>
  );
}
