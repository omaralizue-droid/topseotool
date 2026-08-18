import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/query-provider";

function getValidBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") || "https://topseotool.net";
  try {
    const formatted = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    return new URL(formatted);
  } catch {
    return new URL("https://topseotool.net");
  }
}

const metadataBaseUrl = getValidBaseUrl();
const baseUrl = metadataBaseUrl.origin;

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: "TOPSEOTOOL — AI Search & SEO Intelligence Platform",
    template: "%s | TOPSEOTOOL",
  },
  description:
    "Measure and improve your visibility across traditional search engines and AI-powered search experiences. SEO audits, AI brand mentions, citation tracking, competitor analysis, and automated reporting.",
  keywords: [
    "SEO audit",
    "AI search visibility",
    "AI brand mentions",
    "AEO",
    "answer engine optimization",
    "SEO intelligence",
    "competitor analysis",
    "citation tracking",
    "TopSEOTool",
    "ChatGPT SEO",
    "Perplexity visibility",
  ],
  authors: [{ name: "TOPSEOTOOL Team", url: baseUrl }],
  creator: "TOPSEOTOOL",
  publisher: "TOPSEOTOOL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "TOPSEOTOOL",
    title: "TOPSEOTOOL — AI Search & SEO Intelligence Platform",
    description:
      "Measure and improve your visibility across search engines and AI-powered answers.",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TOPSEOTOOL — AI Search & SEO Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOPSEOTOOL — AI Search & SEO Intelligence",
    description:
      "SEO audits, AI brand mentions, citation tracking, and competitor intelligence in one platform.",
    creator: "@topseotool",
    images: [`${baseUrl}/og-image.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1c2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
