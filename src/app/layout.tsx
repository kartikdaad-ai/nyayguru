import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NyayGuru — India's First Legal AI Chatbot",
  description:
    "Get instant, AI-powered legal guidance on Indian law. Free and confidential. Ask questions on Criminal, Civil, Constitutional, Family, Property, Labour, Consumer, Corporate law and more.",
  keywords: [
    "legal AI",
    "Indian law",
    "legal chatbot",
    "NyayGuru",
    "free legal advice",
    "AI lawyer India",
  ],
  openGraph: {
    title: "NyayGuru — India's First Legal AI Chatbot",
    description:
      "Get instant, AI-powered legal guidance on Indian law. Free and confidential.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
