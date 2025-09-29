import type { Metadata } from "next";
import "../src/styles/reset.css";
import "../src/styles/globals.css";
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
  weight: ["400", "700", "800"], 
  variable: "--font-lexend",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"], 
  variable: "--font-instrument-sans",
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
  }
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
