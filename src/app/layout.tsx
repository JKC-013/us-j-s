import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_Infant, Caveat } from "next/font/google";
import "./globals.css";
import { Butterflies } from "@/components/Butterflies";

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-cormorant-garamond",
});

const cormorantInfant = Cormorant_Infant({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-cormorant-infant",
});

const caveat = Caveat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Us",
  description: "A handcrafted memory book",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${cormorantInfant.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-background text-text">
        <div className="bg-texture"></div>
        <Butterflies />
        {children}
      </body>
    </html>
  );
}
