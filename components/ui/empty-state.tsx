import * as React from "react"
import { LucideIcon, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
    icon?: LucideIcon
  }
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-border rounded-xl bg-card/50",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-base mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Button size="sm" asChild>
            <a href={action.href}>
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </a>
          </Button>
        ) : (
          <Button size="sm" onClick={action.onClick}>
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}