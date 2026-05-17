import "./globals.css";
import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Quran Mazid — Read, Study, and Learn The Quran",
  description:
    "A beautiful Quran reading app with translation, audio recitation by Mishary Rashid Al-Afasy, and font customization.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AppProvider>
      </body>
    </html>
  );
}
