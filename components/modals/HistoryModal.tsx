"use client"

import { X, Trash2, ArrowRight, ExternalLink } from "lucide-react"
import type { SavedAudit } from "@/lib/analyzer/types"

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  savedAudits: SavedAudit[]
  onSelectAudit: (audit: SavedAudit) => void
  onDeleteAudit: (id: string) => void
  onClearAll: () => void
}

export function HistoryModal({
  isOpen,
  onClose,
  savedAudits,
  onSelectAudit,
  onDeleteAudit,
  onClearAll,
}: HistoryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Saved Audit History
            </h3>
            <p className="text-xs text-neutral-500">
              Persisted audits stored in your local workspace session.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {savedAudits.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">
              <p>No saved audits yet.</p>
              <p className="text-neutral-400 mt-1">
                Run an analysis and it will automatically be saved to your local history.
              </p>
            </div>
          ) : (
            savedAudits.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-neutral-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center justify-between gap-3 group"
              >
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectAudit(item)
                    onClose()
                  }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-neutral-900 text-sm group-hover:text-blue-600 transition-colors">
                      {item.brand}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {item.domain}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600">
                      {item.tierLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                    <span>Score: <strong className="text-neutral-800">{item.overallScore}/100</strong></span>
                    <span>&bull;</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAudit(item)
                      onClose()
                    }}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                    title="Load Audit"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAudit(item.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedAudits.length > 0 && (
          <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-mono">
              {savedAudits.length} saved audit{savedAudits.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
