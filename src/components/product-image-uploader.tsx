"use client";

import { useActionState, useState } from "react";

import { uploadProductImageAction, type ImageUploadState } from "@/features/catalog/catalog-admin.actions";

const initialState: ImageUploadState = { success: false, error: null };
const maxImageBytes = 4 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ProductImageUploader({ productId, fieldClass }: { productId: string; fieldClass: string }) {
  const [state, formAction, pending] = useActionState(uploadProductImageAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      {!open ? (
        <button className="admin-flip-trigger" type="button" onClick={() => setOpen(true)}>
          Subir imagen <span aria-hidden="true">+</span>
        </button>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold">Nueva imagen</h3>
            <button className="admin-flip-back" type="button" onClick={() => setOpen(false)}>Cerrar</button>
          </div>
          <form action={formAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input name="productId" type="hidden" value={productId} />
            <label className="admin-product-field text-sm font-semibold">Archivo
              <input
                className={`${fieldClass} admin-image-file-input`}
                name="file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                required
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return setClientError(null);
                  if (!allowedTypes.has(file.type)) return setClientError("Usá una imagen JPG, PNG o WebP.");
                  if (file.size > maxImageBytes) return setClientError("La imagen supera el máximo de 4 MB.");
                  setClientError(null);
                }}
              />
              <small className="font-normal text-[var(--muted)]">JPG, PNG o WebP de hasta 4 MB.</small>
            </label>
            <label className="admin-product-field text-sm font-semibold">Descripción de la imagen
              <input className={fieldClass} name="alt" placeholder="Ej.: Cámara instalada en una entrada" required />
            </label>
            <div className="admin-image-upload-action">
              <button className="min-h-11 rounded-xl bg-[var(--brand)] px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={pending || Boolean(clientError)}>
                {pending ? "Subiendo…" : "Subir imagen"}
              </button>
            </div>
          </form>
          {(clientError || state.error) && (
            <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm font-semibold text-red-700 dark:text-red-300" role="alert">
              {clientError || state.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
