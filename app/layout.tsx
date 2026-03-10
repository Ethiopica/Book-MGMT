import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

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
      <body className="antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Nav />
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
