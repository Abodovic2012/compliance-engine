import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComplyFlow — ISO 27001 & SOC 2 Audit Platform",
  description: "Simplified compliance management for ISO 27001 and SOC 2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
