import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://topseotool.net"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/projects/",
          "/api/",
          "/settings/",
          "/onboarding/",
          "/login",
          "/signup",
          "/reports/share/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
