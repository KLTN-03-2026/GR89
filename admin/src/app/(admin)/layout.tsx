import { AdminLayout } from "@/components/layouts";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore?.get('refresh_token_admin')?.value;
  if (!refreshToken) {
    return redirect('/login');
  }

  return <AdminLayout>{children}</AdminLayout>;
}