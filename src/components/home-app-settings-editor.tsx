"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

import {
  updateHomeAppSettingsAction,
  type HomeAppSettingsState,
} from "@/features/catalog/catalog-admin.actions";

const initialState: HomeAppSettingsState = { success: false, error: null };
const maxImageBytes = 4 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type Props = {
  configured: boolean;
  qrUrl: string | null;
  appStoreUrl: string;
  googlePlayUrl: string;
};

export function HomeAppSettingsEditor({ configured, qrUrl, appStoreUrl, googlePlayUrl }: Props) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateHomeAppSettingsAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold">Descarga de la aplicación</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              {qrUrl ? "QR personalizado cargado." : "Se muestra el QR temporal."} Los enlaces vacíos llevan a la Home de HouseCam.
            </p>
          </div>
          <button className="admin-secondary-button" type="button" onClick={() => setEditing(true)} disabled={!configured}>Editar</button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 grid gap-5 border-t border-[var(--border)] pt-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold">Descarga de la aplicación</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Personalizá el QR y los destinos de las tiendas.</p>
        </div>
        <button className="admin-secondary-button" type="button" onClick={() => setEditing(false)}>Cancelar</button>
      </div>

      <div className="grid gap-5 sm:grid-cols-[96px_1fr] sm:items-center">
        <div className="admin-app-qr-preview">
          {qrUrl ? <Image src={qrUrl} alt="QR configurado para HouseCam" fill sizes="96px" /> : <span>QR</span>}
        </div>
        <label className="admin-field">
          <span>Nuevo código QR</span>
          <input
            name="qrFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return setClientError(null);
              if (!allowedTypes.has(file.type)) return setClientError("Usá una imagen JPG, PNG o WebP.");
              if (file.size > maxImageBytes) return setClientError("La imagen supera el máximo de 4 MB.");
              setClientError(null);
            }}
          />
          <small>JPG, PNG o WebP de hasta 4 MB. Dejalo vacío para conservar el QR actual.</small>
        </label>
      </div>

      <label className="admin-field">
        <span>Enlace de App Store</span>
        <input name="appStoreUrl" type="url" defaultValue={appStoreUrl} placeholder="https://apps.apple.com/..." />
        <small>Si queda vacío, el badge abrirá la Home de HouseCam.</small>
      </label>
      <label className="admin-field">
        <span>Enlace de Google Play</span>
        <input name="googlePlayUrl" type="url" defaultValue={googlePlayUrl} placeholder="https://play.google.com/store/apps/..." />
        <small>Si queda vacío, el badge abrirá la Home de HouseCam.</small>
      </label>

      {(clientError || state.error) && (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm font-semibold text-red-700 dark:text-red-300" role="alert">
          {clientError || state.error}
        </p>
      )}

      <div className="flex justify-end">
        <button className="admin-primary-button" type="submit" disabled={pending || Boolean(clientError) || !configured}>
          {pending ? "Guardando…" : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}
