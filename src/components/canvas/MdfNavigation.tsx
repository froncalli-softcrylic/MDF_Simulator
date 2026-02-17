import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Layers } from 'lucide-react'

interface MdfNavigationProps {
    onBack: () => void
}

export function MdfNavigation({ onBack }: MdfNavigationProps) {
    return (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-2 px-4 rounded-full shadow-lg">
            <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-slate-800 rounded-full w-8 h-8"
            >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
            </Button>

            <div className="h-6 w-px bg-slate-700" />

            <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="font-medium text-sm text-slate-200">MDF Hub Configuration</span>
            </div>
        </div>
    )
}
