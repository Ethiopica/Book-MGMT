import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን · Church Library",
  description: "Ethiopian Orthodox Tewahedo Church of Finland, Helsinki - Debre Amin Abune Teklehaimanot",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <LanguageProvider>
          <AuthProvider>
            <Nav />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
