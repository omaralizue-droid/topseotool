import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowRight, Clock, Calendar, User } from "lucide-react"
import { BLOG_POSTS } from "@/lib/content/blog-data"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "SEO & AI Search Insights Blog | TOPSEOTOOL",
  description: "Expert guides, empirical research, and tutorials on Answer Engine Optimization (AEO), LLM citation algorithms, and technical SEO audits.",
  alternates: {
    canonical: "/blog",
  },
}

export default function BlogIndexPage() {
  return (
    <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 space-y-12 animate-fade-in">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Blog", item: "/blog" },
        ]}
      />

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="brand" className="mb-1">Insights & Research</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          TOPSEOTOOL Insights Blog
        </h1>
        <p className="text-muted-foreground text-base">
          Cutting-edge strategies and empirical research on SEO, AEO, and AI search engine visibility.
        </p>
      </div>

      {/* Blog list */}
      <div className="grid gap-6">
        {BLOG_POSTS.map((post) => (
          <Card key={post.slug} className="group hover:border-brand/40 transition-all hover:shadow-md bg-card">
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                <Badge variant="brand">{post.category}</Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.publishedAt}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
              </div>
              <Link href={`/blog/${post.slug}`} className="block">
                <CardTitle className="text-xl sm:text-2xl font-bold group-hover:text-brand transition-colors">
                  {post.title}
                </CardTitle>
              </Link>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.description}
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-7 h-7 rounded-full object-cover border border-border"
                  />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{post.author.name}</p>
                    <p className="text-[10px] text-muted-foreground">{post.author.role}</p>
                  </div>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-semibold text-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  Read full article <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}