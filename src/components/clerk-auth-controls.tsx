"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function ClerkAuthControls() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="redirect"><button className="footer-auth-button" type="button">Ingresar</button></SignInButton>
        <SignUpButton mode="redirect"><button className="footer-auth-button" type="button">Crear cuenta</button></SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link className="footer-admin-link" href="/admin">Administración</Link>
        <UserButton />
      </Show>
    </>
  );
}
