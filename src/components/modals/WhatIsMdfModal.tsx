'use client'

import { useState } from 'react'
import { X, ArrowRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WhatIsMdfModalProps {
    open: boolean
    onClose: () => void
}

const tabs = ['What is MDF?', 'The 5 Stages', 'Do I Need One?'] as const
type Tab = typeof tabs[number]

const stages = [
    { name: 'Ingest', emoji: '📥', desc: 'Collect data from all your sources — CRM, marketing tools, product events, billing systems.', color: 'from-cyan-500 to-blue-500' },
    { name: 'Hygiene', emoji: '🧹', desc: 'Clean, standardize, and deduplicate your incoming data so everything is consistent.', color: 'from-purple-500 to-violet-500' },
    { name: 'Identity', emoji: '🔗', desc: 'Link records across systems to build a single, reliable view of each customer or account.', color: 'from-emerald-500 to-green-500' },
    { name: 'Unify', emoji: '🏠', desc: 'Merge all linked records into Golden Profiles — the single source of truth for every entity.', color: 'from-amber-500 to-orange-500' },
    { name: 'Activate', emoji: '🚀', desc: 'Push unified profiles to destinations — ads, email, analytics, CRM — always in sync.', color: 'from-pink-500 to-rose-500' }
]

const criteria = [
    { q: 'Data lives in 4+ disconnected systems', yes: true },
    { q: 'Same customer appears differently across tools', yes: true },
    { q: 'Marketing can\'t attribute revenue accurately', yes: true },
    { q: 'Compliance (GDPR/CCPA/HIPAA) is a concern', yes: true },
    { q: 'You only use 1-2 data sources', yes: false },
    { q: 'Your analytics are already accurate', yes: false }
]

export default function WhatIsMdfModal({ open, onClose }: WhatIsMdfModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('What is MDF?')

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-[min(640px,calc(100vw-2rem))] max-h-[min(600px,calc(100vh-4rem))] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-lg font-bold text-slate-800">📚 Learn About MDF</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Bar */}
                <div className="flex border-b px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                                activeTab === tab
                                    ? 'border-indigo-500 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[400px]">
                    {activeTab === 'What is MDF?' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <h3 className="font-bold text-indigo-800 mb-2">Marketing Data Foundation (MDF)</h3>
                                <p className="text-sm text-indigo-700 leading-relaxed">
                                    An MDF is a <strong>centralized data infrastructure</strong> that collects, cleans, links, and unifies customer data from all your systems into a single source of truth — then activates it everywhere you need it.
                                </p>
                            </div>

                            <h4 className="font-semibold text-slate-700 mt-4">How it compares:</h4>
                            <div className="grid gap-3">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-lg">📊</span>
                                    <div>
                                        <span className="font-semibold text-sm text-slate-700">Raw ETL/ELT</span>
                                        <p className="text-xs text-slate-500 mt-0.5">Moves data but doesn't clean, link, or unify it. Good for analytics, not for customer operations.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-lg">🏢</span>
                                    <div>
                                        <span className="font-semibold text-sm text-slate-700">Customer Data Platform (CDP)</span>
                                        <p className="text-xs text-slate-500 mt-0.5">Pre-packaged identity + activation. An MDF is more flexible — you own the infrastructure and can customize every layer.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                                    <span className="text-lg">⭐</span>
                                    <div>
                                        <span className="font-semibold text-sm text-indigo-700">MDF</span>
                                        <p className="text-xs text-indigo-600 mt-0.5">Best of both: clean data, resolved identities, and unified profiles — with full control and composability.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'The 5 Stages' && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                            <p className="text-sm text-slate-500 mb-4">Every MDF follows a 5-stage pipeline. Data flows from left to right, getting cleaner and more valuable at each step.</p>
                            {stages.map((stage, i) => (
                                <div key={stage.name} className="flex items-start gap-3">
                                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br shrink-0', stage.color)}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{stage.emoji}</span>
                                            <span className="font-bold text-sm text-slate-800">{stage.name}</span>
                                            {i < stages.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300 hidden sm:block" />}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{stage.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Do I Need One?' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <p className="text-sm text-slate-500">Check which of these apply to your business:</p>

                            <div className="space-y-2">
                                {criteria.map((c, i) => (
                                    <div key={i} className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg border text-sm',
                                        c.yes
                                            ? 'bg-green-50 border-green-100 text-green-800'
                                            : 'bg-amber-50 border-amber-100 text-amber-800'
                                    )}>
                                        {c.yes ? (
                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                        )}
                                        <span>{c.q}</span>
                                        <span className={cn(
                                            'ml-auto text-[10px] font-bold uppercase shrink-0',
                                            c.yes ? 'text-green-600' : 'text-amber-600'
                                        )}>
                                            {c.yes ? '→ You need MDF' : '→ Maybe not yet'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-slate-500" />
                                    <span className="font-semibold text-sm text-slate-700">The bottom line</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    If you checked 2+ items from the green list, an MDF will likely save your team significant time and unlock capabilities you can't achieve with disconnected tools. Use the <strong>AI Advisor</strong> in this simulator to get a personalized recommendation.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t bg-slate-50 flex justify-end">
                    <Button size="sm" onClick={onClose} className="rounded-lg px-4">Got It</Button>
                </div>
            </div>
        </div>
    )
}
