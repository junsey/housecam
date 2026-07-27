import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <main className="shell py-20">Configurá Clerk para habilitar el registro.</main>;
  }
  return <main className="grid min-h-screen place-items-center p-6"><SignUp /></main>;
}
