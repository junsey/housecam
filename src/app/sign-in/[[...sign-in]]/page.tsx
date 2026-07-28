import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <main className="shell py-20">Configurá Clerk para habilitar el acceso.</main>;
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
