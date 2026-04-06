import { BackgroundLayoutAuth, Branding, Form } from "@/components/common/layout";

export function AuthLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen h-screen w-screen min-w-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background */}
      <BackgroundLayoutAuth />
      <div className="w-full max-w-7xl flex items-center justify-center gap-8">
        <Branding />

        <Form>
          {children}
        </Form>
      </div>
    </div>
  );
}