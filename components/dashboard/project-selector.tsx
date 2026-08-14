"use client"
import { Globe, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface ProjectItem {
  id: string
  name: string
  domain: string
  color?: string | null
}

interface ProjectSelectorProps {
  projects: ProjectItem[]
  selectedProjectId?: string
}

export function ProjectSelector({ projects, selectedProjectId }: ProjectSelectorProps) {
  const selected = projects.find((p) => p.id === selectedProjectId) ?? projects[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 px-3 text-xs bg-background">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
            style={{ background: selected?.color ?? "#6366f1" }}
          >
            {selected?.domain?.[0]?.toUpperCase() ?? "P"}
          </div>
          <span className="font-semibold truncate max-w-[140px]">{selected?.name ?? "Select Project"}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Select Active Project</DropdownMenuLabel>
        {projects.map((p) => (
          <DropdownMenuItem key={p.id} asChild className="cursor-pointer text-xs">
            <Link href={`/projects/${p.id}`} className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-brand" />
              <div className="truncate">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{p.domain}</p>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}