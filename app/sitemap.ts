import type { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/lib/content/blog-data"
import { FREE_TOOLS } from "@/lib/content/tools-data"
import { USE_CASES } from "@/lib/content/use-cases-data"
import { RESOURCES } from "@/lib/content/resources-data"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://topseotool.net"
  const now = new Date()

  // Static marketing routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/use-cases`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]

  // Dynamic Blog routes
  const blogRoutes: MetadataRoute.Sitemap = (BLOG_POSTS || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  // Dynamic Free Tools routes
  const toolRoutes: MetadataRoute.Sitemap = (FREE_TOOLS || []).map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // Dynamic Use Cases routes
  const useCaseRoutes: MetadataRoute.Sitemap = (USE_CASES || []).map((uc) => ({
    url: `${baseUrl}/use-cases/${uc.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  // Dynamic Resource guides routes
  const resourceRoutes: MetadataRoute.Sitemap = (RESOURCES || []).map((res) => ({
    url: `${baseUrl}/resources/${res.slug}`,
    lastModified: new Date(res.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...toolRoutes,
    ...useCaseRoutes,
    ...resourceRoutes,
  ]
}
