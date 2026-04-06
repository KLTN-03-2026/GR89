import { QuizzLayout } from "@/components/layouts";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QuizzLayout>
      {children}
    </QuizzLayout>
  );
}
