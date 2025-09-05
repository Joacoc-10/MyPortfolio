import type { Metadata } from "next";
import "../styles/reset.css";
import "../styles/globals.css";
import { Lexend, Instrument_Sans, Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700", "800"], // Example weights for titles (Regular, Bold, ExtraBold)
  variable: "--font-lexend",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"], // Example weights for body text (Regular, Medium)
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "JCoding Portfolio",
  description: "Mi Portafolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} ${instrumentSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
