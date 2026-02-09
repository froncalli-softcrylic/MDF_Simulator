'use client'

import React from 'react'

// Status Legend - Shows meaning of node status indicators
// Updated to match new clean aesthetic

import { cn } from '@/lib/utils'
import { Check, Sparkles, AlertTriangle, Plus } from 'lucide-react'

const legendItems = [
    {
        status: 'existing',
        icon: Check,
        bg: 'bg-emerald-500',
        label: 'You Have This',
        description: 'Existing Tool'
    },
    {
        status: 'gap',
        icon: Plus,
        bg: 'bg-red-500',
        label: 'Missing Component',
        description: 'Critical Gap'
    },
    {
        status: 'recommended',
        icon: Sparkles,
        bg: 'bg-blue-500',
        label: 'Recommended',
        description: 'Value Add'
    },
    {
        status: 'required',
        icon: AlertTriangle,
        bg: 'bg-amber-500',
        label: 'Required',
        description: 'For Goals'
    }
]

interface StatusLegendProps {
    className?: string
    compact?: boolean
}

export default function StatusLegend({ className, compact = false }: StatusLegendProps) {
    return (
        <div className={cn('bg-white/90 backdrop-blur border rounded-full px-4 py-2 shadow-lg flex items-center gap-4', className)}>
            {legendItems.map(item => {
                const IconComponent: React.ElementType = item.icon
                return (
                    <div key={item.status} className="flex items-center gap-2">
                        <div className={cn('w-4 h-4 rounded-full flex items-center justify-center text-white', item.bg)}>
                            {React.createElement(IconComponent, { className: 'w-2.5 h-2.5' })}
                        </div>
                        <span className="text-xs font-medium text-slate-600 hidden sm:inline">{item.label}</span>
                    </div>
                )
            })}
        </div>
    )
}
