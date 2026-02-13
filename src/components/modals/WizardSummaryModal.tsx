'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight, AlertTriangle, Target, Check, Loader2 } from 'lucide-react'
import { useProfileStore } from '@/store/profile-store'
import { painPoints as painPointsData, goals as goalsData } from '@/data/wizard-options'

interface WizardSummaryModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onApply: () => void
    onSkip: () => void
}

export default function WizardSummaryModal({ isOpen, onOpenChange, onApply, onSkip }: WizardSummaryModalProps) {
    const { wizardData } = useProfileStore()
    const [isApplying, setIsApplying] = useState(false)

    // Derived data - safely handle if wizardData is null
    const selectedPainPoints = (wizardData?.painPoints || [])
        .map(id => painPointsData.find(p => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p)

    const selectedGoals = (wizardData?.goals || [])
        .map(id => goalsData.find(g => g.id === id))
        .filter((g): g is NonNullable<typeof g> => !!g)

    const handleApply = async () => {
        setIsApplying(true)
        // Simulate "thinking" / processing time for effect
        await new Promise(resolve => setTimeout(resolve, 800))
        onApply()
        setIsApplying(false)
        onOpenChange(false)
    }

    if (!wizardData) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 border-none bg-background shadow-2xl">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 border-b">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-primary" />
                            Your Custom Architecture
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground/90">
                            Based on your inputs, we've designed a Marketing Data Foundation that addresses your specific challenges.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-8">
                    {/* Left: The Users' Context */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Your Challenge
                            </h3>
                            <div className="space-y-3">
                                {selectedPainPoints.length > 0 ? selectedPainPoints.slice(0, 3).map((pp) => (
                                    <div key={pp.id} className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30">
                                        <div className="font-semibold text-sm text-red-900 dark:text-red-200">{pp.name}</div>
                                        <div className="text-xs text-red-700/80 dark:text-red-400 mt-1">{pp.description}</div>
                                    </div>
                                )) : (
                                    <div className="text-sm text-muted-foreground italic">No specific pain points selected.</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-cyan-500" />
                                Your Goal
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedGoals.length > 0 ? selectedGoals.slice(0, 4).map((g) => (
                                    <Badge key={g.id} variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200/50">
                                        {g.name}
                                    </Badge>
                                )) : (
                                    <div className="text-sm text-muted-foreground italic">No specific goals selected.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: The Solution Preview */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse-glow">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">MDF Solution v1.0</h4>
                            <p className="text-sm text-muted-foreground mt-1">Tailored for {wizardData.cloud.toUpperCase()} Stack</p>
                        </div>

                        <div className="w-full space-y-3 text-left bg-white dark:bg-slate-950 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30"><Check className="w-3 h-3 text-green-600 dark:text-green-400" /></div>
                                <span>Integrates <strong>{wizardData.tools.length} existing tools</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30"><Check className="w-3 h-3 text-green-600 dark:text-green-400" /></div>
                                <span>Solves <strong>{selectedPainPoints.length} pain points</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30"><Check className="w-3 h-3 text-green-600 dark:text-green-400" /></div>
                                <span>Includes Identity & Governance rails</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col sm:flex-row gap-3 sm:justify-between items-center border-t">
                    <Button variant="ghost" onClick={onSkip} className="text-muted-foreground hover:text-foreground w-full sm:w-auto">
                        Skip, I'll build it myself
                    </Button>
                    <Button size="lg" onClick={handleApply} disabled={isApplying} className="w-full sm:w-auto gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
                        {isApplying ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating Optimized Stack...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Solve My Pain Points
                                <ArrowRight className="w-4 h-4 opacity-50" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
