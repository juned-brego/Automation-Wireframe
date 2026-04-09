import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automation Wireframe",
  description: "Automation Wireframe - Data Entry Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
