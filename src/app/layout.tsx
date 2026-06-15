import type { Metadata } from "next";
import { FinanceProvider } from "@/context/FinanceContext";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helo Finanças",
  description: "Plataforma minimalista e profissional para controle financeiro pessoal.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Helo Finanças",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: 'var(--font-outfit), var(--font-inter), sans-serif' }}>
        <FinanceProvider>
          <AppShell>
            {children}
          </AppShell>
        </FinanceProvider>
      </body>
    </html>
  );
}
