'use client'

// Replace Modal - Prompts user when adding singleton node that already exists

import { useCallback } from 'react'
import type { DuplicateConflict } from '@/types'
import { getNodeById } from '@/data/node-catalog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Plus, X } from 'lucide-react'

interface ReplaceModalProps {
    conflict: DuplicateConflict
    onReplace: () => void
    onKeepBoth: () => void
    onCancel: () => void
}

export default function ReplaceModal({
    conflict,
    onReplace,
    onKeepBoth,
    onCancel
}: ReplaceModalProps) {
    const existingNode = getNodeById(conflict.existingCatalogId)
    const newNode = getNodeById(conflict.newCatalogId)

    if (!existingNode || !newNode) return null

    // Format uniqueness key for display
    const keyParts = conflict.uniquenessKey.split(':')
    const roleLabel = keyParts[0].replace(/_/g, ' ')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-[440px] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Replace Existing Component?</h3>
                        <p className="text-sm text-slate-500">
                            Only one {roleLabel} is recommended
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="ml-auto text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    <p className="text-sm text-slate-600 mb-4">
                        You already have <strong className="text-slate-800">{existingNode.name}</strong> as
                        your {roleLabel}. Adding <strong className="text-slate-800">{newNode.name}</strong> will:
                    </p>

                    <div className="space-y-3">
                        {/* Option 1: Replace */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                                <RefreshCw className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-sm text-slate-700">Replace (Recommended)</span>
                            </div>
                            <p className="text-xs text-slate-500 ml-6">
                                Remove {existingNode.name} and add {newNode.name}.
                                Edges will be transferred to the new node.
                            </p>
                        </div>

                        {/* Option 2: Keep Both */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Plus className="w-4 h-4 text-slate-500" />
                                <span className="font-medium text-sm text-slate-700">Keep Both (Advanced)</span>
                            </div>
                            <p className="text-xs text-slate-500 ml-6">
                                Add {newNode.name} alongside {existingNode.name}.
                                You&apos;ll need to manually configure connections.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onKeepBoth}
                    >
                        Keep Both
                    </Button>
                    <Button
                        size="sm"
                        onClick={onReplace}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Replace {existingNode.name}
                    </Button>
                </div>
            </div>
        </div>
    )
}
