import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Heart, ThumbsUp, Minus, ThumbsDown } from "lucide-react"

interface SentimentDistributionProps {
  positive: number
  neutral: number
  negative: number
}

export function SentimentDistribution({ positive, neutral, negative }: SentimentDistributionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-500" />
          AI Sentiment Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ThumbsUp className="h-3.5 w-3.5" /> Positive Sentiment
            </span>
            <span className="font-mono-nums font-bold">{positive}%</span>
          </div>
          <Progress value={positive} className="h-2 bg-emerald-100 dark:bg-emerald-950" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
              <Minus className="h-3.5 w-3.5" /> Neutral Sentiment
            </span>
            <span className="font-mono-nums font-bold">{neutral}%</span>
          </div>
          <Progress value={neutral} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
              <ThumbsDown className="h-3.5 w-3.5" /> Negative / Critical
            </span>
            <span className="font-mono-nums font-bold">{negative}%</span>
          </div>
          <Progress value={negative} className="h-2 bg-red-100 dark:bg-red-950" />
        </div>
      </CardContent>
    </Card>
  )
}