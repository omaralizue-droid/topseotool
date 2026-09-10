"use client"

import { useState } from "react"
import {
  Layers, CheckCircle2, AlertCircle, ArrowUpRight, Plus,
  Globe, MessageSquare, Database, Sparkles, ExternalLink,
  ShieldCheck, RefreshCw, Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface IntegrationItem {
  id: string
  name: string
  category: "Google Search" | "Analytics" | "Collaboration" | "CMS" | "Data Warehouse"
  description: string
  status: "Connected" | "Disconnected"
  lastSync?: string
  logoText: string
  color: string
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "gsc",
    name: "Google Search Console",
    category: "Google Search",
    description: "Sync organic impressions, average position, and verified XML sitemaps directly from Google.",
    status: "Connected",
    lastSync: "Today at 08:30 AM",
    logoText: "GSC",
    color: "bg-blue-600"
  },
  {
    id: "ga4",
    name: "Google Analytics 4",
    category: "Analytics",
    description: "Track search conversions, organic revenue attribution, and real-time active users.",
    status: "Connected",
    lastSync: "12m ago",
    logoText: "GA4",
    color: "bg-amber-600"
  },
  {
    id: "slack",
    name: "Slack Notifications",
    category: "Collaboration",
    description: "Receive real-time alerts for keyword ranking shifts, crawl errors, and toxic link warnings.",
    status: "Connected",
    lastSync: "Active bot",
    logoText: "SLK",
    color: "bg-purple-600"
  },
  {
    id: "zapier",
    name: "Zapier & Webhooks",
    category: "Collaboration",
    description: "Automate SEO workflows across 5,000+ apps when audits finish or rankings change.",
    status: "Disconnected",
    logoText: "ZAP",
    color: "bg-orange-600"
  },
  {
    id: "bigquery",
    name: "Google BigQuery",
    category: "Data Warehouse",
    description: "Stream raw daily ranking logs, backlink tables, and crawl records into your enterprise data lake.",
    status: "Disconnected",
    logoText: "GBQ",
    color: "bg-sky-600"
  },
  {
    id: "wordpress",
    name: "WordPress Engine Sync",
    category: "CMS",
    description: "Automatically push content optimizer recommendations and meta tags directly to your CMS.",
    status: "Disconnected",
    logoText: "WP",
    color: "bg-slate-700"
  }
]

export default function IntegrationsPage() {
  const [items, setItems] = useState<IntegrationItem[]>(INTEGRATIONS)

  const toggleConnection = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === "Connected" ? "Disconnected" : "Connected"
        return { ...item, status: nextStatus, lastSync: nextStatus === "Connected" ? "Just now" : undefined }
      }
      return item
    }))
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="h-6 w-6 text-brand" /> Ecosystem &amp; Integrations
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Two-Way Sync</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Connect your SEO data pipeline with Google Search Console, GA4, Slack, and enterprise data warehouses
          </p>
        </div>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const isConnected = item.status === "Connected"

          return (
            <Card
              key={item.id}
              className={`border transition-all flex flex-col justify-between ${
                isConnected
                  ? "border-brand/40 bg-brand/[0.02]"
                  : "border-border/70 hover:border-border"
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${item.color} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                      {item.logoText}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">{item.name}</CardTitle>
                      <span className="text-[11px] text-muted-foreground font-medium">{item.category}</span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${
                      isConnected
                        ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>

                <CardDescription className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">
                  {item.lastSync ? `Sync: ${item.lastSync}` : "Not configured"}
                </span>

                <Button
                  variant={isConnected ? "outline" : "brand"}
                  size="sm"
                  onClick={() => toggleConnection(item.id)}
                  className="h-8 text-xs font-semibold px-3"
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
