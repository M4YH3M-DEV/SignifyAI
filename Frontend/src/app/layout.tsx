import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "@/styles/globals.css"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SignifyAI",
  description: "An AI-powered translator that converts spoken audio or video input into American Sign Language (ASL) gestures in real-time using deep learning and computer vision, featuring gesture animation, cloud accessibility, and support for multilingual and avatar-based rendering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black text-white">
      <body
        className={`${geistMono.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
