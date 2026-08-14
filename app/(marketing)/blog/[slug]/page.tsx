import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, ArrowRight, Share2 } from "lucide-react"
import { BLOG_POSTS } from "@/lib/content/blog-data"
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

interface PageParams {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return { title: "Post Not Found" }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://topseotool.net"
  const url = `${baseUrl}/blog/${post.slug}`

  return {
    title: `${post.title} | TOPSEOTOOL Blog`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 animate-fade-in">
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        url={`/blog/${post.slug}`}
        publishedAt={post.publishedAt}
        authorName={post.author.name}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Blog", item: "/blog" },
          { name: post.title, item: `/blog/${post.slug}` },
        ]}
      />

      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to blog
        </Link>
      </Button>

      {/* Article Header */}
      <header className="space-y-4 border-b border-border pb-8">
        <Badge variant="brand">{post.category}</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-balance leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {post.description}
        </p>

        <div className="flex items-center justify-between pt-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">{post.author.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
        </div>
      </header>

      {/* Article Content */}
      <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed space-y-6">
        {post.content.split("\n\n").map((block, idx) => {
          if (block.startsWith("## ")) {
            return (
              <h2 key={idx} className="text-2xl font-bold tracking-tight mt-8 mb-4">
                {block.replace("## ", "")}
              </h2>
            )
          }
          if (block.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-xl font-semibold mt-6 mb-3">
                {block.replace("### ", "")}
              </h3>
            )
          }
          if (block.startsWith("- ")) {
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1 text-muted-foreground">
                {block.split("\n").map((item, i) => (
                  <li key={i}>{item.replace("- ", "")}</li>
                ))}
              </ul>
            )
          }
          if (block.startsWith("1. ")) {
            return (
              <ol key={idx} className="list-decimal pl-5 space-y-1 text-muted-foreground">
                {block.split("\n").map((item, i) => (
                  <li key={i}>{item.replace(/^\d+\.\s*/, "")}</li>
                ))}
              </ol>
            )
          }
          return (
            <p key={idx} className="text-base text-muted-foreground leading-relaxed">
              {block}
            </p>
          )
        })}
      </div>

      {/* Footer CTA */}
      <Card className="p-8 mt-12 bg-brand/5 border-brand/20 text-center space-y-4">
        <h3 className="text-xl font-bold">Ready to track your brand across AI search engines?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Start your free audit today and discover where your business ranks in ChatGPT, Gemini, and Perplexity.
        </p>
        <Button size="lg" variant="brand" asChild>
          <Link href="/signup">
            Start Free Audit <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </Card>
    </article>
  )
}
