import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://joincovenantapp.com"),
  title: {
    default: "Covenant - Discipline, remembered.",
    template: "%s - Covenant",
  },
  description:
    "A quiet system for honest habits, daily progress, and returning to yourself.",
  openGraph: {
    title: "Covenant - Discipline, remembered.",
    description:
      "A quiet system for honest habits, daily progress, and returning to yourself.",
    url: "https://joincovenantapp.com",
    siteName: "Covenant",
    images: [
      {
        url: "/images/covenant-ritual-bg.png",
        width: 1200,
        height: 630,
        alt: "Covenant ritual background",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
