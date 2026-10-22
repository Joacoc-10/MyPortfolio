import type { Metadata } from "next";
import "../styles/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JCoding Portfolio",
  description: "Desarrollador Web Full-Stack",
  openGraph: {
    title: "JCoding Portfolio",
    description: "Desarrollador Web Full-Stack",
    url: "",
    images: [
      {
        url: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Black%20logo%20-%20no%20background.png?updatedAt=1758109767518",
        alt: "Logo de JCoding",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
