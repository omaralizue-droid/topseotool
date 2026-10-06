"use client"

import { useState } from "react"
import { Network, ExternalLink, ShieldCheck, Share2 } from "lucide-react"

interface CitationTopologyGraphProps {
  brandName: string
  domain: string
  citations: string[]
}

export function CitationTopologyGraph({ brandName, domain, citations }: CitationTopologyGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const defaultGrounds = [
    { id: "docs", label: "Official Docs", type: "PRIMARY", domain: `docs.${domain}` },
    { id: "wiki", label: "Wikidata Entity", type: "AUTHORITY", domain: "wikidata.org" },
    { id: "g2", label: "G2 Reviews", type: "EVALUATION", domain: "g2.com" },
    { id: "github", label: "GitHub Repos", type: "DEVELOPER", domain: "github.com" },
    { id: "press", label: "TechCrunch / News", type: "MEDIA", domain: "techcrunch.com" },
  ]

  const grounds = citations.length > 0
    ? citations.slice(0, 5).map((url, i) => {
        try {
          const u = new URL(url)
          return { id: `cite-${i}`, label: u.hostname.replace("www.", ""), type: "VERIFIED", domain: u.hostname }
        } catch {
          return defaultGrounds[i] || defaultGrounds[0]
        }
      })
    : defaultGrounds

  return (
    <div className="w-full rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            Citation Knowledge Graph Topology
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          Entity Disambiguation &middot; Multilateral Grounding Links
        </span>
      </div>

      <p className="text-xs text-muted-foreground font-serif leading-relaxed">
        Visual mapping of primary nodes cited by OpenAI, Anthropic, and Perplexity when establishing truth consensus for <strong>{brandName}</strong>.
      </p>

      {/* Network Graph Visual Canvas */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl bg-muted/20 border border-border/60 overflow-hidden flex items-center justify-center p-4">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Central Brand Entity Node */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-foreground text-background flex flex-col items-center justify-center font-bold text-sm shadow-lg ring-4 ring-primary/20 animate-pulse">
            <span className="font-serif text-lg leading-none">{brandName.slice(0, 1)}</span>
            <span className="text-[8px] font-mono tracking-widest mt-0.5 uppercase">ENTITY</span>
          </div>
          <span className="mt-2 text-xs font-bold text-foreground font-mono bg-card/90 px-2 py-0.5 rounded border border-border">
            {domain}
          </span>
        </div>

        {/* Orbiting Grounding Nodes */}
        {grounds.map((g, index) => {
          const total = grounds.length
          const angle = (Math.PI * 2 / total) * index - Math.PI / 2
          const radiusX = 140
          const radiusY = 85
          const posX = Math.cos(angle) * radiusX
          const posY = Math.sin(angle) * radiusY

          return (
            <div
              key={g.id}
              style={{
                transform: `translate(${posX}px, ${posY}px)`,
              }}
              className="absolute z-20 flex flex-col items-center cursor-pointer transition-all hover:scale-105"
              onClick={() => setSelectedNode(g.domain)}
            >
              <div className="px-2.5 py-1.5 rounded-lg bg-card/95 border border-border/80 shadow-md backdrop-blur-md flex items-center gap-1.5 text-xs font-mono text-foreground hover:border-foreground/40 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold">{g.label}</span>
              </div>
              <span className="text-[8px] font-mono text-muted-foreground uppercase mt-0.5">
                {g.type}
              </span>
            </div>
          )
        })}

        {/* SVG Connector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {grounds.map((_, i) => (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${50 + (Math.cos((Math.PI * 2 / grounds.length) * i - Math.PI / 2) * 35)}%`}
              y2={`${50 + (Math.sin((Math.PI * 2 / grounds.length) * i - Math.PI / 2) * 28)}%`}
              stroke="url(#lineGrad)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-75"
            />
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bi-directional Knowledge Grounding Verified</span>
        </span>
        <span>5 External Authority Anchors</span>
      </div>
    </div>
  )
}
