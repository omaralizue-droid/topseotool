"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileText, Copy, Check, Code, Sparkles, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { DetailedContentBrief } from "@/lib/content-opportunity/opportunity-generator"

interface BriefModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brief: DetailedContentBrief | null
}

export function BriefModal({ open, onOpenChange, brief }: BriefModalProps) {
  const [copied, setCopied] = useState(false)

  if (!brief) return null

  function copySchema() {
    if (!brief) return
    navigator.clipboard.writeText(brief.schemaRecommendation.jsonLdSnippet)
    setCopied(true)
    toast.success("Schema JSON-LD snippet copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="brand" className="text-[10px]">Strategic Brief</Badge>
            <span className="text-xs text-muted-foreground font-mono">Suggested Words: {brief.suggestedWordCount}</span>
          </div>
          <DialogTitle className="text-xl font-bold">{brief.topic}</DialogTitle>
          <DialogDescription className="text-xs">
            Strategic content planning brief designed for human-in-the-loop review and author guidance.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="brief" className="w-full mt-2">
          <TabsList className="grid grid-cols-4 w-full h-9">
            <TabsTrigger value="brief" className="text-xs">Brief & Outline</TabsTrigger>
            <TabsTrigger value="titles" className="text-xs">Title & Meta</TabsTrigger>
            <TabsTrigger value="faqs" className="text-xs">FAQ Suggestions</TabsTrigger>
            <TabsTrigger value="schema" className="text-xs">JSON-LD Schema</TabsTrigger>
          </TabsList>

          {/* TAB 1: Brief & Outline */}
          <TabsContent value="brief" className="space-y-4 pt-3">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Target Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {brief.targetKeywords.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Suggested Article Outline</span>
              {brief.outline.map((sec, idx) => (
                <div key={sec.heading} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                  <p className="text-xs font-bold text-foreground">H2 {idx + 1}: {sec.heading}</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-1">
                    {sec.keyPoints.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: Title & Meta */}
          <TabsContent value="titles" className="space-y-4 pt-3">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">SEO & AEO Title Options</span>
              {brief.titleOptions.map((title, i) => (
                <div key={title} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs">
                  <span className="font-medium">{title}</span>
                  <Badge variant="outline" className="text-[10px]">Option {i + 1}</Badge>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Optimized Meta Description</span>
              <div className="p-3 rounded-lg border border-brand/30 bg-brand-muted/20 text-xs font-medium text-foreground">
                {brief.metaDescription}
              </div>
              <span className="text-[10px] text-muted-foreground block text-right">Length: {brief.metaDescription.length} characters</span>
            </div>
          </TabsContent>

          {/* TAB 3: FAQ Suggestions */}
          <TabsContent value="faqs" className="space-y-3 pt-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Recommended Question & Answer Pairs</span>
            {brief.faqSuggestions.map((faq) => (
              <div key={faq.question} className="p-3 rounded-lg border border-border bg-card space-y-1 text-xs">
                <p className="font-bold text-foreground flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5 text-brand shrink-0" /> Q: {faq.question}
                </p>
                <p className="text-muted-foreground leading-relaxed pl-4">A: {faq.answer}</p>
              </div>
            ))}
          </TabsContent>

          {/* TAB 4: JSON-LD Schema */}
          <TabsContent value="schema" className="space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommended Schema: {brief.schemaRecommendation.type}</span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={copySchema}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copied ? "Copied" : "Copy JSON-LD"}
              </Button>
            </div>
            <pre className="p-4 rounded-lg bg-muted font-mono text-[11px] overflow-x-auto text-foreground border border-border">
              {brief.schemaRecommendation.jsonLdSnippet}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}