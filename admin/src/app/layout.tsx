import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from "@/context/AuthContext";
import { DialogCleanupProvider } from "@/components/common/providers/DialogCleanupProvider";
import { EmergencyCleanupButton } from "@/components/common/providers/EmergencyCleanupButton";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin English Mastery",
  description: "learning English for English Mastery",
  icons: {
    icon: "/images/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${jetbrainsMono.variable} antialiased min-h-screen max-w-screen font-sans`}
      >
        <AuthProvider>
          <DialogCleanupProvider>
            <ToastContainer />
            <EmergencyCleanupButton />
            {children}
          </DialogCleanupProvider>
        </AuthProvider>
      </body>
    </html>

  );
}
