import type { Metadata } from "next";
import { ThemeProvider } from "@/app/Context/theme-provider";
import { AuthProvider } from "@/app/Context/Authcontext";
import { SocketProvider } from "@/app/Context/SocketContext";
import { ThemeToggle } from "@/app/Components/Shared/theme-toggle";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modern Sensei",
  description:
    "Modern Sensei,Empowering the modern educators with limitless, scalable architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader
            color="#7c3aed"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #7c3aed,0 0 5px #7c3aed"
          />
          <AuthProvider>
            <SocketProvider>
              {children}
              <ThemeToggle />
              <Toaster position="top-center" richColors />
              <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
              />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
