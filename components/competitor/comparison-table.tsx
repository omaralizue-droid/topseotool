import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users2, Check } from "lucide-react"

interface CompetitorRow {
  id: string
  name: string
  domain: string
  seoScore: number
  aiVisibility: number
  mentionRate: number
  citationRate: number
  recommendationRate: number
  sentiment: string
  isUserBrand?: boolean
}

interface ComparisonTableProps {
  rows: CompetitorRow[]
}

export function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users2 className="h-4 w-4 text-brand" />
          Competitor Benchmark Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Brand / Domain</TableHead>
              <TableHead className="text-center font-mono">SEO Health</TableHead>
              <TableHead className="text-center font-mono">AI Visibility</TableHead>
              <TableHead className="text-center font-mono">Mention Rate</TableHead>
              <TableHead className="text-center font-mono">Citation Rate</TableHead>
              <TableHead className="text-center font-mono">Rec. Rate</TableHead>
              <TableHead className="text-center">Sentiment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.domain} className={row.isUserBrand ? "bg-brand-muted/20 font-semibold" : ""}>
                <TableCell className="font-medium text-xs">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{row.name}</span>
                    {row.isUserBrand && <Badge variant="brand" className="text-[9px] px-1 py-0">YOUR BRAND</Badge>}
                  </div>
                  <span className="text-[11px] text-muted-foreground block truncate">{row.domain}</span>
                </TableCell>
                <TableCell className="text-center font-mono-nums font-bold text-sm">{row.seoScore}</TableCell>
                <TableCell className="text-center font-mono-nums font-bold text-sm text-brand">{row.aiVisibility}%</TableCell>
                <TableCell className="text-center font-mono-nums text-xs">{row.mentionRate}%</TableCell>
                <TableCell className="text-center font-mono-nums text-xs">{row.citationRate}%</TableCell>
                <TableCell className="text-center font-mono-nums text-xs">{row.recommendationRate}%</TableCell>
                <TableCell className="text-center">
                  <Badge variant={row.sentiment === "POSITIVE" ? "success" : "secondary"} className="text-[10px]">
                    {row.sentiment}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}