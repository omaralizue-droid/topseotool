"use client"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Brain } from "lucide-react"

interface ChartDataPoint {
  date: string
  overall: number
  chatgpt: number
  gemini: number
  perplexity: number
}

interface AIVisibilityChartProps {
  data?: ChartDataPoint[]
}

const DEFAULT_DATA: ChartDataPoint[] = [
  { date: "Mon", overall: 78, chatgpt: 82, gemini: 75, perplexity: 77 },
  { date: "Tue", overall: 82, chatgpt: 85, gemini: 79, perplexity: 82 },
  { date: "Wed", overall: 80, chatgpt: 84, gemini: 77, perplexity: 79 },
  { date: "Thu", overall: 88, chatgpt: 91, gemini: 84, perplexity: 89 },
  { date: "Fri", overall: 85, chatgpt: 89, gemini: 82, perplexity: 84 },
  { date: "Sat", overall: 91, chatgpt: 94, gemini: 88, perplexity: 91 },
  { date: "Sun", overall: 92, chatgpt: 95, gemini: 88, perplexity: 93 },
]

export function AIVisibilityChart({ data = DEFAULT_DATA }: AIVisibilityChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-brand" />
            AI Visibility Trend Across Engines
          </CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Overall</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> ChatGPT</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Gemini</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradChatGPT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="color-mix(in oklch, var(--border) 60%, transparent)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#gradOverall)" name="Overall Score" />
              <Area type="monotone" dataKey="chatgpt" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#gradChatGPT)" name="ChatGPT Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}