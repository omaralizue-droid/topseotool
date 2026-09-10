"use client"

import { useState } from "react"
import {
  Users2, UserPlus, Shield, ShieldCheck, Mail,
  CheckCircle2, AlertCircle, Trash2, MoreVertical,
  Building2, Sparkles, UserCheck, ArrowRight, Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ROLE_DESCRIPTIONS, type OrgRole } from "@/lib/tenant/roles"

interface TeamMember {
  id: string
  name: string
  email: string
  role: OrgRole
  joinedAt: string
  avatarColor: string
}

const INITIAL_MEMBERS: TeamMember[] = [
  { id: "1", name: "Omar Ali", email: "omar@topseotool.net", role: "OWNER", joinedAt: "Jan 12, 2026", avatarColor: "bg-brand" },
  { id: "2", name: "Sarah Jenkins", email: "sarah.j@topseotool.net", role: "ADMIN", joinedAt: "Feb 03, 2026", avatarColor: "bg-indigo-600" },
  { id: "3", name: "David Chen", email: "david.c@topseotool.net", role: "MANAGER", joinedAt: "Feb 18, 2026", avatarColor: "bg-teal-600" },
  { id: "4", name: "Elena Rostova", email: "elena.r@topseotool.net", role: "MEMBER", joinedAt: "Mar 01, 2026", avatarColor: "bg-purple-600" },
  { id: "5", name: "Production ETL Ingest", email: "api-service@topseotool.net", role: "API_USER", joinedAt: "Mar 05, 2026", avatarColor: "bg-slate-700" },
]

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<OrgRole>("MEMBER")
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      joinedAt: "Just now",
      avatarColor: inviteRole === "API_USER" ? "bg-slate-700" : "bg-emerald-600",
    }

    setMembers(prev => [...prev, newMember])
    setInviteEmail("")
    setInviteModalOpen(false)
    setFeedbackMessage(`Member added: ${inviteEmail} assigned role ${ROLE_DESCRIPTIONS[inviteRole].title}`)
    setTimeout(() => setFeedbackMessage(null), 3500)
  }

  const handleRoleChange = (memberId: string, newRole: OrgRole) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
    setFeedbackMessage(`Member role updated to ${ROLE_DESCRIPTIONS[newRole].title}`)
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  const handleRemoveMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    if (member?.role === "OWNER") {
      alert("The organization Owner cannot be removed.")
      return
    }
    setMembers(prev => prev.filter(m => m.id !== memberId))
    setFeedbackMessage("Member removed from workspace.")
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  const getRoleBadge = (role: OrgRole) => {
    switch (role) {
      case "OWNER":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">Owner</Badge>
      case "ADMIN":
        return <Badge className="bg-brand/10 text-brand border border-brand/30 text-[10px] font-bold">Admin</Badge>
      case "MANAGER":
        return <Badge className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-[10px] font-bold">Manager</Badge>
      case "MEMBER":
        return <Badge variant="secondary" className="text-[10px] font-medium">Member</Badge>
      case "API_USER":
        return <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/30 text-[10px] font-bold">Enterprise API User</Badge>
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users2 className="h-6 w-6 text-brand" /> Team &amp; Workspace Access
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Enterprise RBAC</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Strict role-based access control (RBAC) across Owner, Admin, Manager, Member, and Enterprise API Users
          </p>
        </div>

        {/* Invite Member Modal */}
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm">
              <UserPlus className="h-3.5 w-3.5" /> Add Member / API User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Add Workspace User or API Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email / Service Identifier</label>
                <Input
                  type="text"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com or api-service"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Assigned Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["ADMIN", "MANAGER", "MEMBER", "API_USER"] as OrgRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        inviteRole === r
                          ? "border-brand bg-brand/10 text-brand shadow-xs"
                          : "border-border/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="font-bold">{ROLE_DESCRIPTIONS[r].title}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{ROLE_DESCRIPTIONS[r].desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-brand text-xs font-semibold">
                Save &amp; Grant Access
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in-0">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Role Hierarchy Matrix Card */}
      <Card className="p-5 border-border/80 shadow-xs bg-gradient-to-br from-card to-muted/20 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Enforced Role-Based Access Control (RBAC) Matrix
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
            <span className="font-bold text-amber-600 dark:text-amber-400">Owner</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Full access. Ownership transfer, org deletion, and root billing.</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
            <span className="font-bold text-brand">Admin</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Manage users, projects, billing and settings.</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
            <span className="font-bold text-teal-600 dark:text-teal-400">Manager</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Manage SEO projects, reports and team workflows.</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
            <span className="font-bold text-foreground">Member</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Limited project access. View-only audits &amp; analytics.</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
            <span className="font-bold text-slate-500 dark:text-slate-300 flex items-center gap-1">
              <Key className="h-3 w-3" /> API User
            </span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Can access API according to organization's API limits.</p>
          </div>
        </div>
      </Card>

      {/* Current Members List */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="py-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-brand" /> Active Workspace Accounts ({members.length})
          </CardTitle>
          <span className="text-xs text-muted-foreground">Tenant isolation strictly applied</span>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/30">
          {members.map((member) => (
            <div key={member.id} className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                  {member.role === "API_USER" ? <Key className="h-4 w-4" /> : member.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-xs text-foreground truncate">{member.name}</p>
                    {getRoleBadge(member.role)}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-muted-foreground hidden sm:inline">Active since {member.joinedAt}</span>

                {member.role !== "OWNER" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-xs">
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, "ADMIN")} className="cursor-pointer">
                        Set Role: Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, "MANAGER")} className="cursor-pointer">
                        Set Role: Manager
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, "MEMBER")} className="cursor-pointer">
                        Set Role: Member
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, "API_USER")} className="cursor-pointer">
                        Set Role: Enterprise API User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 focus:text-red-500 cursor-pointer"
                      >
                        Remove Access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
