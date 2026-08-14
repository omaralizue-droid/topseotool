import * as React from "react"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
  variant?: "spinner" | "cards" | "table"
}

export function LoadingState({
  text = "Loading data...",
  variant = "spinner",
  className,
  ...props
}: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3 gap-4", className)} {...props}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3 bg-card">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-2 flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        <Skeleton className="h-10 w-full rounded-md" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)} {...props}>
      <Loader2 className="h-7 w-7 animate-spin text-brand mb-3" />
      <p className="text-sm text-muted-foreground font-medium">{text}</p>
    </div>
  )
}