import Footer from "@/app/_components/footer";
import { AnimatedBackground } from "@/app/_components/animated-background";
import { HOME_OG_IMAGE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import cn from "classnames";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ocura360 Blog - Healthcare Management Insights",
  description: "Stay updated with the latest in healthcare management, clinic operations, and ABDM integration. Expert insights from Ocura360.",
  openGraph: {
    title: "Ocura360 Blog",
    description: "Healthcare management insights and updates",
    images: [HOME_OG_IMAGE_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#000000"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#2563eb" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      </head>
      <body
        className={cn(inter.className, "text-gray-900")}
      >
        <AnimatedBackground />
        <div className="min-h-screen relative z-0">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
