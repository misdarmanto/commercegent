import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "FRESH Ecommerce",
  description: "Belanja kebutuhan segar Anda dengan mudah",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <Providers>
          <Header />
          <main style={{ minHeight: "70vh" }}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
