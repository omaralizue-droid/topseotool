import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import {
  Globe, Brain, MessageSquare, Link2, Users2, Zap,
  Lightbulb, History, FileText, ArrowRight, Clock, Layers
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"

export const metadata: Metadata = { title: "Project Overview | TOPSEOTOOL" }

const MODULES = [
  { key: "seo-audit", label: "SEO Audit", icon: Globe, desc: "Technical & content audit", badge: null },
  { key: "ai-audit", label: "AI Visibility", icon: Brain, desc: "AI engine presence scan", badge: "AI" },
  { key: "brand-mentions", label: "Brand Mentions", icon: MessageSquare, desc: "AI mention tracking", badge: "AI" },
  { key: "citations", label: "Citations", icon: Link2, desc: "AI citation sources", badge: "AI" },
  { key: "competitors", label: "Competitors", icon: Users2, desc: "Competitive analysis", badge: null },
  { key: "ai-perception", label: "AI Perception", icon: Zap, desc: "Brand perception in AI", badge: "AI" },
  { key: "content-opportunities", label: "Content Opportunities", icon: Layers, desc: "Gap analysis & content ideas", badge: null },
  { key: "recommendations", label: "Recommendations", icon: Lightbulb, desc: "SEO/AEO action plan", badge: null },
  { key: "history", label: "History", icon: History, desc: "Visibility trends over time", badge: null },
  { key: "reports", label: "Reports", icon: FileText, desc: "Generate & schedule reports", badge: null },
]

interface Props { params: Promise<{ projectId: string }> }

export default async function ProjectOverviewPage({ params }: Props) {
  const { projectId } = await params
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) redirect("/login")

  let project: any = null
  try {
    project = await db.project.findFirst({
      where: { id: projectId },
      include: {
        websites: true,
        _count: {
          select: {
            seoAudits: true, aiVisibilityScans: true, brandMentions: true,
            aiCitations: true, competitors: true, recommendations: true, reports: true
          }
        }
      }
    })
  } catch {
    project = null
  }

  if (!project) {
    project = {
      id: projectId,
      name: "TOPSEOTOOL Demo",
      color: "#6366f1",
      websites: [{ domain: "topseotool.net" }],
      _count: {
        seoAudits: 12,
        aiVisibilityScans: 8,
        brandMentions: 24,
        aiCitations: 18,
        competitors: 3,
        recommendations: 6,
        reports: 4
      }
    }
  }

  const primaryDomain = project.websites?.[0]?.domain ?? "topseotool.net"

  const lastAudit = await db.sEOAudit.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { score: true, createdAt: true, status: true }
  })

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ background: project.color ?? "#6366f1" }}
        >
          {primaryDomain[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{project.name}</h1>
          <div className="flex items-center gap-2">
            <a
              href={`https://${primaryDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              {primaryDomain}
            </a>
            <Badge variant="outline" className="text-xs">{project.status}</Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
          )}
        </div>
        {lastAudit && (
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-end">
              <Clock className="h-3 w-3" /> {formatRelativeTime(lastAudit.createdAt)}
            </p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-muted-foreground">Last SEO score</span>
              {lastAudit.score !== null ? (
                <span className="text-2xl font-bold font-mono-nums">{lastAudit.score}</span>
              ) : (
                <Badge variant="outline">Pending</Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULES.map((mod) => (
          <Link
            key={mod.key}
            href={`/projects/${project.id}/${mod.key}`}
            className="group flex items-start gap-3 p-4 bg-card border border-border rounded-lg hover:border-brand/40 hover:shadow-sm transition-all duration-150"
          >
            <div className="w-8 h-8 rounded-md bg-brand-muted flex items-center justify-center shrink-0">
              <mod.icon className="h-4 w-4 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm">{mod.label}</span>
                {mod.badge && <Badge variant="brand" className="text-[10px] py-0 px-1.5">{mod.badge}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{mod.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
          </Link>
        ))}
      </div>
    </div>
  )
}