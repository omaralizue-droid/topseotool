"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { ArrowLeft, Sparkles, FileText, Lightbulb, CheckCircle2, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BriefModal } from "@/components/content-opportunity/brief-modal"
import { ContentOpportunity, DetailedContentBrief } from "@/lib/content-opportunity/opportunity-generator"
import { toast } from "sonner"

export default function ProjectContentOpportunitiesPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [selectedBrief, setSelectedBrief] = useState<DetailedContentBrief | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["content-opportunities", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/content-opportunities`)
      const d = await res.json()
      return d.data as ContentOpportunity[]
    }
  })

  const generateBrief = useMutation({
    mutationFn: async (oppId: string) => {
      const res = await fetch(`/api/projects/${projectId}/content-opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: oppId }),
      })
      if (!res.ok) throw new Error("Failed to generate content brief")
      const d = await res.json()
      return d.data as DetailedContentBrief
    },
    onSuccess: (data) => {
      setSelectedBrief(data)
      setModalOpen(true)
      toast.success("Strategic content brief generated!")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">AI Content Opportunities</h1>
            <Badge variant="brand" className="text-[10px]">Strategic Planning</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Identify high-impact content topics to capture AI citation market share</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
      ) : (
        <div className="space-y-4">
          {opportunities?.map((opp) => (
            <Card key={opp.id} className="hover:border-brand/40 transition-all rounded-xl">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={opp.priority === "CRITICAL" ? "error" : "brand"} className="text-[10px]">
                        {opp.priority} Priority
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">{opp.searchIntent}</Badge>
                      <span className="text-[11px] text-muted-foreground">Business Value: <strong>{opp.businessValue}</strong></span>
                    </div>
                    <CardTitle className="text-base font-bold pt-1">{opp.topic}</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="brand"
                    className="w-full sm:w-auto shrink-0"
                    onClick={() => generateBrief.mutate(opp.id)}
                    disabled={generateBrief.isPending}
                  >
                    {generateBrief.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
                    Generate Brief
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="font-semibold text-foreground">AI Visibility Opportunity:</span>
                  <p className="text-muted-foreground leading-relaxed mt-0.5">{opp.aiVisibilityOpportunity}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Questions to Answer:</span>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                      {opp.questionsToAnswer.map((q) => <li key={q} className="truncate">{q}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Target Competitors:</span>
                    <div className="flex flex-wrap gap-1">
                      {opp.relatedCompetitors.map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Interactive Content Brief Modal */}
      <BriefModal open={modalOpen} onOpenChange={setModalOpen} brief={selectedBrief} />
    </div>
  )
}