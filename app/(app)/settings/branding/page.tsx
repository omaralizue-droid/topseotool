"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Building2, Palette, Globe, Mail, FileText, Check,
  ShieldCheck, ArrowRight, ExternalLink, RefreshCw,
  Sparkles, Save, Upload, Copy, Info, CheckCircle2,
  Lock, Eye, AlertCircle, Laptop, Smartphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  AgencyBrandingConfig,
  DEFAULT_AGENCY_BRANDING
} from "@/lib/agency/branding-service"

const COLOR_PRESETS = [
  { name: "Ocean Cyan (ABC Digital)", primary: "#0284c7", accent: "#38bdf8" },
  { name: "Emerald Growth", primary: "#059669", accent: "#34d399" },
  { name: "Indigo Royal", primary: "#4f46e5", accent: "#818cf8" },
  { name: "Electric Violet", primary: "#7c3aed", accent: "#a78bfa" },
  { name: "Crimson Tech", primary: "#e11d48", accent: "#fb7185" },
  { name: "Sunset Amber", primary: "#d97706", accent: "#fbbf24" },
]

export default function AgencyBrandingSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifyingDns, setVerifyingDns] = useState(false)
  const [previewTab, setPreviewTab] = useState<"report" | "portal" | "email">("report")
  const [config, setConfig] = useState<AgencyBrandingConfig>(DEFAULT_AGENCY_BRANDING)
  const [isEligible, setIsEligible] = useState(true)
  const [planName, setPlanName] = useState("AGENCY")

  useEffect(() => {
    async function loadBranding() {
      try {
        setLoading(true)
        const res = await fetch("/api/settings/branding")
        if (res.ok) {
          const json = await res.json()
          if (json?.data?.branding) {
            setConfig(json.data.branding)
          }
          if (json?.data?.eligibility) {
            setIsEligible(json.data.eligibility.isEligible)
            setPlanName(json.data.eligibility.plan)
          }
        }
      } catch {
        // Fallback to default
      } finally {
        setLoading(false)
      }
    }
    loadBranding()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        toast.success("Agency white-label settings saved successfully!")
      } else {
        toast.error("Failed to save settings")
      }
    } catch {
      toast.error("Network error while saving settings")
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyDns = async () => {
    setVerifyingDns(true)
    try {
      const res = await fetch("/api/settings/branding/verify-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: config.customDomain.domain }),
      })

      const json = await res.json()
      if (res.ok && json.ok) {
        setConfig((prev) => ({
          ...prev,
          customDomain: {
            ...prev.customDomain,
            status: "VERIFIED",
            sslStatus: "ACTIVE",
            verifiedAt: json.data.verifiedAt,
          },
        }))
        toast.success(json.data.message || "Custom domain DNS and SSL verified!")
      } else {
        toast.error(json.error || "DNS verification pending. Please ensure CNAME is propagated.")
      }
    } catch {
      toast.error("Error during DNS verification")
    } finally {
      setVerifyingDns(false)
    }
  }

  const effectiveReportTitle = config.reportBranding.reportTitleTemplate.replace(
    /\{company\}/g,
    config.companyName || "ABC Digital"
  )

  const effectiveFooter = config.reportBranding.customFooterText.replace(
    /\{company\}/g,
    config.companyName || "ABC Digital"
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">White-Label &amp; Agency Branding</h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold tracking-wider">
              Agency &amp; Enterprise
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Customize logos, company name, brand colors, custom domains, and sender masking across client deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="brand"
            size="sm"
            onClick={handleSave}
            disabled={saving || loading}
            className="gap-1.5 shadow-brand text-xs h-9 px-4"
          >
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? "Saving Changes..." : "Save Branding"}</span>
          </Button>
        </div>
      </div>

      {/* ── Plan Eligibility Banner (If Not on Agency/Enterprise) ── */}
      {!isEligible && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-foreground">Agency &amp; Enterprise Feature</p>
              <p className="text-muted-foreground">
                Your workspace is currently on the <strong>{planName}</strong> tier. Upgrade to Agency or Enterprise to activate custom domains, 100% white-label reports, and email sender masking.
              </p>
            </div>
          </div>
          <Button size="sm" variant="brand" asChild className="shrink-0 h-8 text-xs">
            <Link href="/billing">Upgrade to Agency</Link>
          </Button>
        </div>
      )}

      {/* ── Live Client View Hero Teaser ── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-brand/30 bg-brand-muted/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand">Client Experience Transformation</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-foreground">
              Client sees: <span className="text-brand underline underline-offset-4">&ldquo;{effectiveReportTitle}&rdquo;</span> instead of TopSEOTool branding.
            </p>
            <p className="text-xs text-muted-foreground">
              All PDF downloads, web links ({config.customDomain.domain}), and emails reflect your agency identity 100%.
            </p>
          </div>

          <Badge variant="outline" className="text-xs px-3 py-1 font-semibold border-brand/40 text-brand bg-background shrink-0">
            Active Identity: {config.companyName}
          </Badge>
        </div>
      </div>

      {/* ── Main Layout: Config Panels (Left) + Live Preview (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 6 Configuration Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Company Name & Tagline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 font-bold">
                <Building2 className="h-4 w-4 text-brand" /> Company Name &amp; Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Company / Agency Name</Label>
                  <Input
                    value={config.companyName}
                    onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                    placeholder="e.g. ABC Digital"
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Replaces all TopSEOTool brand headers and client footers.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Agency Tagline</Label>
                  <Input
                    value={config.tagline}
                    onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                    placeholder="e.g. Premier Growth Partners"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Logo Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 font-bold">
                <Upload className="h-4 w-4 text-brand" /> Logo &amp; Brand Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Agency Logo Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.logoUrl}
                    onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                    placeholder="https://youragency.com/logo.png"
                    className="h-8 text-xs"
                  />
                  {config.logoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs shrink-0"
                      onClick={() => setConfig({ ...config, logoUrl: "" })}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Recommended: High-resolution PNG or SVG with transparent background (height ~60px).
                </p>
              </div>

              {/* Logo Preview box */}
              <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-xs">Header Logo Preview</p>
                  <p className="text-[10px] text-muted-foreground">How your logo displays on client PDF &amp; web covers</p>
                </div>
                <div className="h-10 px-3 rounded-lg bg-card border border-border flex items-center justify-center min-w-[120px]">
                  {config.logoUrl ? (
                    <img src={config.logoUrl} alt={config.companyName} className="h-7 w-auto object-contain" />
                  ) : (
                    <span className="font-black text-xs text-foreground uppercase tracking-wider font-mono">
                      {config.companyName || "ABC DIGITAL"}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Brand Colors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 font-bold">
                <Palette className="h-4 w-4 text-brand" /> Brand Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Presets */}
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground">Curated Agency Palettes</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          brandColors: {
                            ...config.brandColors,
                            primary: preset.primary,
                            accent: preset.accent,
                          },
                        })
                      }
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        config.brandColors.primary === preset.primary
                          ? "border-foreground shadow-xs bg-muted/40 font-bold"
                          : "border-border/60 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <span className="w-3.5 h-3.5 rounded-full border border-background" style={{ backgroundColor: preset.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-background" style={{ backgroundColor: preset.accent }} />
                      </div>
                      <span className="text-[11px] truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Hex Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Primary Brand Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.brandColors.primary}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          brandColors: { ...config.brandColors, primary: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5 bg-background shrink-0"
                    />
                    <Input
                      value={config.brandColors.primary}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          brandColors: { ...config.brandColors, primary: e.target.value },
                        })
                      }
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Secondary Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.brandColors.accent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          brandColors: { ...config.brandColors, accent: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5 bg-background shrink-0"
                    />
                    <Input
                      value={config.brandColors.accent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          brandColors: { ...config.brandColors, accent: e.target.value },
                        })
                      }
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Custom Report Branding */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 font-bold">
                <FileText className="h-4 w-4 text-brand" /> Custom Report Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">100% White-Label PDF Reports</p>
                  <p className="text-[11px] text-muted-foreground">
                    Hide &ldquo;Powered by TopSEOTool&rdquo; completely from all client PDF and web views.
                  </p>
                </div>
                <Switch
                  checked={config.reportBranding.hidePlatformBadge}
                  onCheckedChange={(val) =>
                    setConfig({
                      ...config,
                      reportBranding: { ...config.reportBranding, hidePlatformBadge: val },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Default Report Title Template</Label>
                <Input
                  value={config.reportBranding.reportTitleTemplate}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      reportBranding: {
                        ...config.reportBranding,
                        reportTitleTemplate: e.target.value,
                      },
                    })
                  }
                  placeholder="{company} SEO Report"
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  Variables available: <code className="font-mono bg-muted px-1 py-0.2 rounded">&#123;company&#125;</code> (e.g. {effectiveReportTitle})
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Custom PDF Footer Text</Label>
                <Input
                  value={config.reportBranding.customFooterText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      reportBranding: {
                        ...config.reportBranding,
                        customFooterText: e.target.value,
                      },
                    })
                  }
                  placeholder="Prepared exclusively by {company} • Confidential"
                  className="h-8 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* 5. Custom Domain Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 font-bold">
                  <Globe className="h-4 w-4 text-brand" /> Custom Client Portal Domain
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    config.customDomain.status === "VERIFIED"
                      ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
                      : "border-amber-500/40 text-amber-600 bg-amber-500/10"
                  }`}
                >
                  {config.customDomain.status === "VERIFIED" ? "SSL Active & Verified" : "Pending DNS"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Client Portal Hostname</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.customDomain.domain}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customDomain: { ...config.customDomain, domain: e.target.value },
                      })
                    }
                    placeholder="e.g. reports.abcdigital.com"
                    className="h-8 text-xs font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVerifyDns}
                    disabled={verifyingDns}
                    className="h-8 text-xs shrink-0 gap-1.5"
                  >
                    {verifyingDns ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                    <span>Verify DNS</span>
                  </Button>
                </div>
              </div>

              {/* DNS Instructions Box */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
                <p className="font-semibold text-foreground text-[11px] flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-brand" /> Required DNS CNAME Record
                </p>
                <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-background border border-border/60 font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase text-muted-foreground block">Type</span>
                    <span className="font-bold text-foreground">CNAME</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-muted-foreground block">Host</span>
                    <span className="font-bold text-foreground truncate">{config.customDomain.domain.split(".")[0] || "reports"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-muted-foreground block">Points To</span>
                    <span className="font-bold text-brand truncate">{config.customDomain.cnameTarget}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Automatic SSL wildcard certificates are provisioned within 15 minutes of DNS propagation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Email Sender Branding */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 font-bold">
                <Mail className="h-4 w-4 text-brand" /> Email Sender Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Sender From Name</Label>
                  <Input
                    value={config.emailBranding.senderName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        emailBranding: { ...config.emailBranding, senderName: e.target.value },
                      })
                    }
                    placeholder="ABC Digital Reports"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Sender From Email</Label>
                  <Input
                    value={config.emailBranding.senderEmail}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        emailBranding: { ...config.emailBranding, senderEmail: e.target.value },
                      })
                    }
                    placeholder="reports@abcdigital.com"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Reply-To Address</Label>
                  <Input
                    value={config.emailBranding.replyToEmail}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        emailBranding: { ...config.emailBranding, replyToEmail: e.target.value },
                      })
                    }
                    placeholder="support@abcdigital.com"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Automated Email Footer</Label>
                  <Input
                    value={config.emailBranding.emailFooter}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        emailBranding: { ...config.emailBranding, emailFooter: e.target.value },
                      })
                    }
                    placeholder="Sent by ABC Digital Client Reporting Suite"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Live Client View Preview (5 Cols Sticky) ── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand" />
                <h3 className="font-bold text-sm text-foreground">Live Client View</h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                Real-Time Render
              </Badge>
            </div>

            {/* Preview Viewport Switcher */}
            <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)} className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-muted/60 p-1 text-xs">
                <TabsTrigger value="report" className="text-[11px]">PDF Report</TabsTrigger>
                <TabsTrigger value="portal" className="text-[11px]">Web Portal</TabsTrigger>
                <TabsTrigger value="email" className="text-[11px]">Client Email</TabsTrigger>
              </TabsList>

              {/* 1. PDF Report Cover Preview */}
              <TabsContent value="report" className="mt-3 focus-visible:outline-none">
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md space-y-4 text-xs">
                  {/* Styled Header with Agency Colors */}
                  <div
                    className="p-6 text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${config.brandColors.primary} 0%, #0f172a 100%)`,
                    }}
                  >
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-2">
                        {config.logoUrl ? (
                          <img src={config.logoUrl} alt={config.companyName} className="h-6 w-auto object-contain brightness-0 invert" />
                        ) : (
                          <span className="font-black text-xs uppercase tracking-wider font-mono bg-white/20 px-2 py-0.5 rounded">
                            {config.companyName || "ABC DIGITAL"}
                          </span>
                        )}
                        <Badge variant="outline" className="text-[9px] text-white/90 border-white/30">
                          EXECUTIVE AUDIT
                        </Badge>
                      </div>

                      <h4 className="text-lg font-black tracking-tight text-white leading-tight">
                        {effectiveReportTitle}
                      </h4>

                      <p className="text-[11px] text-white/80">
                        Prepared for <strong className="text-white">Acme Corp</strong> (acme.com)
                      </p>
                    </div>
                  </div>

                  {/* Body Preview */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                        <span className="text-[9px] text-muted-foreground block uppercase">SEO Health</span>
                        <span className="font-extrabold text-base text-emerald-600 font-mono">88/100</span>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                        <span className="text-[9px] text-muted-foreground block uppercase">AI Visibility</span>
                        <span className="font-extrabold text-base font-mono" style={{ color: config.brandColors.primary }}>94%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                        <span className="text-[9px] text-muted-foreground block uppercase">Keywords</span>
                        <span className="font-extrabold text-base text-foreground font-mono">1,420</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                      <span className="font-bold text-[11px] text-foreground">Executive Overview</span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        &ldquo;During this audit period, acme.com maintained market strength with top visibility in ChatGPT and Google Gemini answers.&rdquo;
                      </p>
                    </div>

                    {/* Footer Preview */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[9px] text-muted-foreground">
                      <span className="truncate">{effectiveFooter}</span>
                      <span className="font-mono">Page 1 of 8</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 2. Web Portal Preview */}
              <TabsContent value="portal" className="mt-3 focus-visible:outline-none">
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md text-xs">
                  {/* Browser Bar */}
                  <div className="bg-muted/60 p-2.5 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 text-center bg-background px-3 py-0.5 rounded-md text-[10px] font-mono text-muted-foreground border border-border truncate">
                      https://{config.customDomain.domain}/share/rep-8492
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="font-extrabold text-sm" style={{ color: config.brandColors.primary }}>
                        {config.companyName || "ABC Digital"}
                      </span>
                      <Button size="sm" className="h-7 text-[10px] text-white gap-1" style={{ backgroundColor: config.brandColors.primary }}>
                        Export PDF
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">{effectiveReportTitle}</h4>
                      <p className="text-[11px] text-muted-foreground">Real-time client performance dashboard</p>
                    </div>

                    <div className="h-20 rounded-xl bg-muted/40 border border-border flex items-center justify-center text-muted-foreground text-[11px]">
                      Interactive White-Labeled Client Charts
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 3. Client Email Preview */}
              <TabsContent value="email" className="mt-3 focus-visible:outline-none">
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md text-xs space-y-3 p-4">
                  {/* Email Header */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-[11px]">
                    <p>
                      <strong>From:</strong> {config.emailBranding.senderName} &lt;{config.emailBranding.senderEmail}&gt;
                    </p>
                    <p>
                      <strong>Reply-To:</strong> {config.emailBranding.replyToEmail}
                    </p>
                    <p>
                      <strong>Subject:</strong> {config.companyName} Monthly SEO Audit for Acme Corp
                    </p>
                  </div>

                  {/* Email Body */}
                  <div className="p-3 rounded-xl border border-border space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <span className="font-black text-xs" style={{ color: config.brandColors.primary }}>
                        {config.companyName}
                      </span>
                    </div>

                    <p className="text-[11px] text-foreground leading-relaxed">
                      Hello Acme Team,
                      <br /><br />
                      Your latest monthly SEO &amp; AI Search visibility executive report is ready for review.
                    </p>

                    <div className="text-center py-2">
                      <Button size="sm" className="h-8 text-xs text-white" style={{ backgroundColor: config.brandColors.primary }}>
                        View Executive Client Report →
                      </Button>
                    </div>

                    <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                      {config.emailBranding.emailFooter}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
