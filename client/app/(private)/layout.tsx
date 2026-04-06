import { PrivateLayout } from "@/components/layouts/PrivateLayout";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "English Mastery",
  description: "learning English for English Mastery",
  icons: {
    icon: "/images/logo.png",
  }
};

export default async function PrivateLayoutPage({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore?.get('access_token_user')?.value;
  const refreshToken = cookieStore?.get('refresh_token_user')?.value;
  if (!accessToken && !refreshToken) {
    return redirect('/login');
  }

  return (
    <PrivateLayout>
      {children}
    </PrivateLayout>
  );
}
