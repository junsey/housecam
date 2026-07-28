"use client";

import { useState, type ReactNode } from "react";

type AdminFlipCardProps = {
  title: string;
  openLabel: string;
  front: ReactNode;
  back: ReactNode;
};

export function AdminFlipCard({ title, openLabel, front, back }: AdminFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className="card admin-flip-card">
      <div className="admin-flip-face" key={flipped ? "back" : "front"}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{flipped ? `${title} · Gestión` : title}</h2>
          {flipped && (
            <button className="admin-flip-back" type="button" onClick={() => setFlipped(false)}>
              ← Volver
            </button>
          )}
        </div>
        <div className="mt-4">{flipped ? back : front}</div>
        {!flipped && (
          <button className="admin-flip-trigger mt-5" type="button" onClick={() => setFlipped(true)}>
            {openLabel}
            <span aria-hidden="true">↻</span>
          </button>
        )}
      </div>
    </section>
  );
}
