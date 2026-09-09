"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  TrendingUp, BarChart3, Search, Plus, Filter,
  ArrowUpRight, ArrowDownRight, Minus, Sparkles,
  Smartphone, Monitor, Globe, Award, Download,
  CheckCircle2, ChevronRight, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TrackedKeyword {
  id: string
  keyword: string
  pos: number
  prevPos: number
  bestPos: number
  volume: number
  features: string[]
  device: "desktop" | "mobile"
  url: string
  tag: string
}

const INITIAL_KEYWORDS: TrackedKeyword[] = [
  { id: "1", keyword: "ai seo tools", pos: 2, prevPos: 5, bestPos: 1, volume: 18100, features: ["AI Overview", "Featured Snippet"], device: "desktop", url: "https://topseotool.net", tag: "Core Brand" },
  { id: "2", keyword: "enterprise aeo platform", pos: 1, prevPos: 2, bestPos: 1, volume: 6400, features: ["AI Overview", "People Also Ask"], device: "desktop", url: "https://topseotool.net/features", tag: "AEO" },
  { id: "3", keyword: "chatgpt brand visibility tracker", pos: 3, prevPos: 7, bestPos: 2, volume: 9200, features: ["AI Overview"], device: "desktop", url: "https://topseotool.net/ai-perception", tag: "AI Search" },
  { id: "4", keyword: "best seo audit software", pos: 4, prevPos: 4, bestPos: 3, volume: 22400, features: ["People Also Ask"], device: "desktop", url: "https://topseotool.net/seo-audit", tag: "Audit" },
  { id: "5", keyword: "competitor backlink analysis", pos: 6, prevPos: 9, bestPos: 4, volume: 14800, features: ["Site Links"], device: "desktop", url: "https://topseotool.net/backlinks", tag: "Backlinks" },
  { id: "6", keyword: "seo writing assistant online", pos: 5, prevPos: 3, bestPos: 2, volume: 16500, features: ["People Also Ask"], device: "desktop", url: "https://topseotool.net/content-optimizer", tag: "Content" }
]

export default function RankTrackerPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  const [keywords, setKeywords] = useState<TrackedKeyword[]>(INITIAL_KEYWORDS)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [searchFilter, setSearchFilter] = useState("")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newKeywordInput, setNewKeywordInput] = useState("")
  const [newTagInput, setNewTagInput] = useState("Organic")

  const filtered = keywords.filter((k) =>
    k.keyword.toLowerCase().includes(searchFilter.toLowerCase()) ||
    k.tag.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const top3Count = keywords.filter(k => k.pos <= 3).length
  const top10Count = keywords.filter(k => k.pos <= 10).length
  const avgPos = (keywords.reduce((sum, k) => sum + k.pos, 0) / keywords.length).toFixed(1)

  const handleAddKeywords = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeywordInput.trim()) return

    const lines = newKeywordInput.split("\n").map(l => l.trim()).filter(Boolean)
    const newItems: TrackedKeyword[] = lines.map((line, idx) => ({
      id: `custom_${Date.now()}_${idx}`,
      keyword: line,
      pos: Math.floor(Math.random() * 15) + 2,
      prevPos: Math.floor(Math.random() * 20) + 3,
      bestPos: Math.floor(Math.random() * 5) + 1,
      volume: Math.floor(Math.random() * 18000) + 800,
      features: ["AI Overview"],
      device,
      url: "https://topseotool.net",
      tag: newTagInput.trim() || "General"
    }))

    setKeywords(prev => [...newItems, ...prev])
    setNewKeywordInput("")
    setAddModalOpen(false)
  }

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Keyword,Position,PrevPosition,BestPosition,Volume,Tag", ...keywords.map(k => `"${k.keyword}",${k.pos},${k.prevPos},${k.bestPos},${k.volume},"${k.tag}"`)].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `rankings_${projectId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-brand" /> Daily Rank Tracker &amp; SERP Radar
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Enterprise</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Automated daily keyword rankings, Google AI Overview detection, and winner/loser rank shifts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export Rankings
          </Button>

          {/* Add Keywords Modal */}
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm">
                <Plus className="h-3.5 w-3.5" /> Track Keywords
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Track New Target Keywords</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddKeywords} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Keywords (one per line)</label>
                  <textarea
                    rows={4}
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    placeholder="ai seo software&#10;seo audit agency&#10;rank tracking enterprise"
                    className="w-full rounded-lg border border-border bg-muted/30 p-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Group / Tag Name</label>
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="e.g. Core Features, High-Intent"
                    className="h-8 text-xs"
                  />
                </div>
                <Button type="submit" className="w-full bg-brand text-xs font-semibold">
                  Start Tracking ({newKeywordInput.split("\n").filter(Boolean).length || 1} keywords)
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Position</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono-nums text-foreground">#{avgPos}</span>
              <span className="text-xs font-bold text-emerald-500">+1.8 pts</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Across {keywords.length} active queries</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top 3 Rankings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono-nums text-foreground">{top3Count}</span>
              <span className="text-xs text-muted-foreground">/ {keywords.length}</span>
              <span className="text-xs font-bold text-emerald-500 ml-auto">+2 new</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Dominating high-intent SERPs</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top 10 Rankings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono-nums text-foreground">{top10Count}</span>
              <span className="text-xs text-muted-foreground">/ {keywords.length}</span>
              <span className="text-xs font-bold text-emerald-500 ml-auto">100% in Page 1</span>
            </div>
            <p className="text-[11px] text-muted-foreground">All core targets on Page 1</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Overviews Caught</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono-nums text-indigo-500">
                {keywords.filter(k => k.features.includes("AI Overview")).length}
              </span>
              <Badge variant="outline" className="text-[10px] font-bold border-indigo-500/40 text-indigo-500 ml-auto">
                Google SGE
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Cited in Google Generative Answers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tracked Keywords Table */}
      <Card className="border-border/80 shadow-xs">
        <div className="p-4 sm:p-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter tracked keywords or tags..."
              className="pl-8 h-8 text-xs bg-muted/40 border-border/60"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Device Selector */}
            <div className="flex items-center bg-muted/60 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setDevice("desktop")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  device === "desktop" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  device === "mobile" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile
              </button>
            </div>

            <Badge variant="outline" className="text-xs font-mono">US • Google</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/40">
              <tr>
                <th className="py-3 px-4">Tracked Keyword</th>
                <th className="py-3 px-4">Current Rank</th>
                <th className="py-3 px-4">Change</th>
                <th className="py-3 px-4">Best</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">SERP Features</th>
                <th className="py-3 px-4">Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 font-medium">
              {filtered.map((item) => {
                const diff = item.prevPos - item.pos // positive means improvement (e.g. was 5, now 2 => +3)
                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.keyword}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">{item.url}</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                        item.pos <= 3 ? "bg-emerald-500/10 text-emerald-500" :
                        item.pos <= 10 ? "bg-brand/10 text-brand" : "bg-muted text-foreground"
                      }`}>
                        #{item.pos}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {diff > 0 ? (
                        <span className="text-emerald-500 font-bold flex items-center">
                          <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> +{diff}
                        </span>
                      ) : diff < 0 ? (
                        <span className="text-red-500 font-bold flex items-center">
                          <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" /> {diff}
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center">
                          <Minus className="h-3.5 w-3.5 mr-0.5" /> 0
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground">#{item.bestPos}</td>

                    <td className="py-3 px-4 font-mono">{item.volume.toLocaleString()}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.features.map(f => (
                          <Badge
                            key={f}
                            variant="outline"
                            className={`text-[9px] py-0 px-1.5 font-medium ${
                              f === "AI Overview" ? "border-indigo-500/40 text-indigo-500 bg-indigo-500/5 font-semibold" : ""
                            }`}
                          >
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-[10px] font-normal">{item.tag}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
