import { Branding, LoginForm } from "@/features/login"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function page() {
  const cookieStore = await cookies();
  const accessToken = cookieStore?.get('access_token_admin')?.value;

  if (accessToken) {
    return redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <Branding />
        <LoginForm />
      </div>
    </div>
  )
}
