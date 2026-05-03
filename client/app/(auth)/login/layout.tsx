import { AuthLayout } from "@/components/layouts";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "Login ActiveLearning",
  description: "login learning English for ActiveLearning",
  icons: {
    icon: "/images/logo.png",
  }
};

export default async function AuthLayoutPage({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore?.get('access_token_user')?.value;
  const refreshToken = cookieStore?.get('refresh_token_user')?.value;

  if (accessToken || refreshToken) {
    return redirect('/dashboard');
  }
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
}
