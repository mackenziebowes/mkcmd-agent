import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mkcmd.mackenziebowes.com"),
  title: {
    default: "mkcmd-agent: CLIs that agents can drive",
    template: "%s · mkcmd-agent",
  },
  description:
    "Scaffold Bun + TypeScript CLIs with an agent contract built in: flags instead of prompts, one JSON object on stdout, exit codes 0/1/2, and a describe command.",
  openGraph: { siteName: "mkcmd-agent", type: "website" },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "text/plain": "/llms.txt" } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light overflow-x-clip">
      <body className={`${shareTechMono.variable} font-mono antialiased overflow-x-clip`}>{children}</body>
    </html>
  );
}
