'use client'

// AI Assistant Panel — Premium side-panel MDF advisor with scoring & Markdown

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { getNodeById } from '@/data/node-catalog'
import { generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    X,
    Send,
    Bot,
    User,
    Loader2,
    Check,
    Plus,
    Stethoscope,
    Search,
    Layers,
    BookOpen,
    BarChart3,
    ArrowRight,
    Lightbulb,
    Trash2,
    ChevronDown,
    Sparkles,
    TrendingUp,
    Shield,
    Database,
    UserCheck,
    Activity,
    Settings2
} from 'lucide-react'

// =============================================
// Markdown Renderer — lightweight inline parser
// =============================================
function renderMarkdown(text: string): React.ReactNode[] {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let listItems: string[] = []
    let listKey = 0

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`list-${listKey++}`} className="my-1.5 ml-4 space-y-0.5">
                    {listItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                            <span className="text-purple-400 mt-1 text-[10px]">●</span>
                            <span>{renderInline(item)}</span>
                        </li>
                    ))}
                </ul>
            )
            listItems = []
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Headings
        if (line.startsWith('### ')) {
            flushList()
            elements.push(
                <h4 key={i} className="font-bold text-[13px] mt-3 mb-1 text-foreground/90">
                    {renderInline(line.slice(4))}
                </h4>
            )
            continue
        }
        if (line.startsWith('## ')) {
            flushList()
            elements.push(
                <h3 key={i} className="font-bold text-sm mt-3 mb-1 text-foreground">
                    {renderInline(line.slice(3))}
                </h3>
            )
            continue
        }

        // Bullet points
        if (line.match(/^[\s]*[-•*]\s/)) {
            const content = line.replace(/^[\s]*[-•*]\s/, '')
            listItems.push(content)
            continue
        }

        // Empty line
        if (line.trim() === '') {
            flushList()
            elements.push(<div key={i} className="h-1.5" />)
            continue
        }

        // Normal paragraph
        flushList()
        elements.push(
            <p key={i} className="leading-relaxed">
                {renderInline(line)}
            </p>
        )
    }
    flushList()
    return elements
}

function renderInline(text: string): React.ReactNode {
    // Bold (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
        }
        // Italic (*text*)
        const italicParts = part.split(/(\*[^*]+\*)/g)
        return italicParts.map((ip, j) => {
            if (ip.startsWith('*') && ip.endsWith('*') && !ip.startsWith('**')) {
                return <em key={`${i}-${j}`}>{ip.slice(1, -1)}</em>
            }
            return ip
        })
    })
}

// =============================================
// Scorecard Widget
// =============================================
const SCORE_DIMENSIONS = [
    { key: 'dataCoverage', label: 'Data Coverage', icon: Database, color: 'text-blue-500' },
    { key: 'identityResolution', label: 'Identity Resolution', icon: UserCheck, color: 'text-emerald-500' },
    { key: 'analyticsReadiness', label: 'Analytics Readiness', icon: BarChart3, color: 'text-purple-500' },
    { key: 'activationCompleteness', label: 'Activation', icon: Activity, color: 'text-pink-500' },
    { key: 'architectureQuality', label: 'Architecture', icon: Settings2, color: 'text-indigo-500' },
] as const

function ScorecardWidget({ scorecard }: { scorecard: any }) {
    if (!scorecard) return null

    const gradeColor: Record<string, string> = {
        'A': 'text-green-500 dark:text-green-400',
        'B': 'text-blue-500 dark:text-blue-400',
        'C': 'text-amber-500 dark:text-amber-400',
        'D': 'text-orange-500 dark:text-orange-400',
        'F': 'text-red-500 dark:text-red-400'
    }

    const scoreBg: Record<number, string> = {
        5: 'bg-green-500/20 text-green-700 dark:text-green-300',
        4: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
        3: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
        2: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
        1: 'bg-red-500/20 text-red-700 dark:text-red-300',
    }

    const percentage = Math.round(((scorecard.totalScore || 0) / (scorecard.maxScore || 30)) * 100)

    return (
        <div className="mt-3 rounded-xl border border-border/50 bg-card/50 dark:bg-white/5 p-3 space-y-3">
            {/* Overall Grade */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl",
                        "bg-gradient-to-br from-purple-500/20 to-indigo-500/20",
                        gradeColor[scorecard.overall] || 'text-slate-500'
                    )}>
                        {scorecard.overall || '?'}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">Pipeline Health Score</p>
                        <p className="text-[11px] text-muted-foreground">{scorecard.totalScore || 0}/{scorecard.maxScore || 30} points ({percentage}%)</p>
                    </div>
                </div>
                {/* Mini progress ring */}
                <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                            className="stroke-muted/30" />
                        <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                            strokeDasharray={`${percentage * 0.94} 100`}
                            strokeLinecap="round"
                            className={cn(
                                percentage >= 80 ? 'stroke-green-500' :
                                    percentage >= 60 ? 'stroke-blue-500' :
                                        percentage >= 40 ? 'stroke-amber-500' : 'stroke-red-500'
                            )} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                        {percentage}%
                    </span>
                </div>
            </div>

            {/* Dimension Bars */}
            <div className="space-y-1.5">
                {SCORE_DIMENSIONS.map(dim => {
                    const score = scorecard[dim.key] || 0
                    const Icon = dim.icon
                    return (
                        <div key={dim.key} className="flex items-center gap-2">
                            <Icon className={cn("w-3.5 h-3.5 shrink-0", dim.color)} />
                            <span className="text-[11px] text-muted-foreground w-28 truncate">{dim.label}</span>
                            <div className="flex-1 flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className={cn(
                                        "h-2 flex-1 rounded-sm transition-all",
                                        n <= score
                                            ? (scoreBg[score] || 'bg-slate-300')
                                            : 'bg-muted/30 dark:bg-white/5'
                                    )} />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground w-4 text-right">{score}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


// =============================================
// Quick Prompts — Tabbed System
// =============================================
const PROMPT_TABS = [
    {
        id: 'diagnose',
        label: 'Diagnose',
        icon: Stethoscope,
        prompts: [
            { label: 'Is MDF right for me?', prompt: 'Help me figure out if a Marketing Data Foundation (MDF) is the right approach for my business. Ask me diagnostic questions.' },
            { label: 'Analyze my canvas', prompt: 'Analyze the current nodes on my canvas and identify any gaps in my data pipeline. What\'s missing? What should I add?' },
            { label: 'Where are my data silos?', prompt: 'Look at my current setup and identify where I likely have data silos or disconnected systems.' },
        ]
    },
    {
        id: 'score',
        label: 'Score',
        icon: BarChart3,
        prompts: [
            { label: 'Score my pipeline', prompt: 'Score my current pipeline setup across all dimensions — data coverage, identity resolution, analytics, activation, and architecture quality. Give me a detailed assessment with grades.' },
            { label: 'ROI assessment', prompt: 'Based on my current pipeline, estimate the ROI impact of filling in the gaps you can see. What improvements would have the biggest business impact?' },
            { label: 'Best practices check', prompt: 'Compare my current architecture against industry best practices. Where am I following them and where am I falling short?' },
        ]
    },
    {
        id: 'recommend',
        label: 'Recommend',
        icon: Lightbulb,
        prompts: [
            { label: 'Recommend architecture', prompt: 'Based on my current setup, recommend a complete data architecture. What components should I add and in what order?' },
            { label: 'Compare tool options', prompt: 'What are the pros and cons of different tool options for the gaps in my pipeline? Help me choose the right ones.' },
            { label: 'Phased implementation', prompt: 'Create a phased implementation plan for improving my data pipeline. What should I do first, second, third?' },
        ]
    },
    {
        id: 'learn',
        label: 'Learn',
        icon: BookOpen,
        prompts: [
            { label: 'What is MDF?', prompt: 'Explain what a Marketing Data Foundation is, why it matters, and how it differs from a traditional data warehouse or CDP. Use plain English.' },
            { label: 'Explain pipeline stages', prompt: 'Walk me through each stage of an MDF pipeline — from data sources to activation. Explain what each stage does and why it matters.' },
            { label: 'Identity resolution 101', prompt: 'Explain identity resolution in plain English. Why is it important, how does it work, and what happens without it?' },
        ]
    }
]

// =============================================
// Message types
// =============================================
interface Message {
    role: 'user' | 'assistant'
    content: string
    suggestions?: {
        nodes?: Array<{ catalogId: string; name: string; stage: string }>
        edges?: Array<{ source: string; target: string }>
        scorecard?: any
        explanation?: string
    }
}

interface AIAssistantPanelProps {
    onClose: () => void
    className?: string
}

// =============================================
// Main Component
// =============================================
export default function AIAssistantPanel({
    onClose,
    className
}: AIAssistantPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "### Welcome to MDF Advisor 👋\n\nI'm your **Marketing Data Foundation** strategy consultant. I can help you:\n\n- **Diagnose** gaps in your data pipeline\n- **Score** your setup against best practices\n- **Recommend** the right tools and architecture\n- **Answer** any questions about data strategy\n\nWhat would you like to explore? Use the quick prompts below or tell me about your situation."
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set())
    const [activeTab, setActiveTab] = useState<string>('diagnose')
    const [showQuickPrompts, setShowQuickPrompts] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const applySuggestionsRef = useRef<(messageIndex: number, suggestions: Message['suggestions']) => void>(() => { })

    const { nodes, edges, addNode, setEdges } = useCanvasStore()
    const { validationResults } = useUIStore()

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus textarea on mount
    useEffect(() => {
        textareaRef.current?.focus()
    }, [])

    // Auto-resize textarea
    const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
        const el = e.target
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }, [])

    // ---- Send Message ----
    const sendMessage = useCallback(async (messageText?: string) => {
        const text = messageText || input.trim()
        if (!text || isLoading) return

        const userMessage: Message = { role: 'user', content: text }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        setShowQuickPrompts(false)

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    currentGraph: { nodes, edges },
                    validationResults: validationResults ? {
                        errors: validationResults.errors.map((e: any) => e.message),
                        warnings: validationResults.warnings.map((w: any) => w.message)
                    } : null
                })
            })

            if (!response.ok) throw new Error('Failed to get response')

            const data = await response.json()
            const newMessageIndex = messages.length + 1

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                suggestions: data.suggestions
            }])

            // Auto-apply if suggestions include nodes
            if (data.suggestions?.nodes?.length > 0) {
                setTimeout(() => applySuggestionsRef.current(newMessageIndex, data.suggestions), 300)
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please check that the **GROQ_API_KEY** is configured in your `.env.local` file.'
            }])
        } finally {
            setIsLoading(false)
        }
    }, [input, isLoading, messages, nodes, edges, validationResults])

    // ---- Keyboard ----
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }, [sendMessage])

    // ---- Apply Suggestions ----
    const applySuggestions = useCallback(async (messageIndex: number, suggestions: Message['suggestions']) => {
        if (!suggestions) return

        if (suggestions.nodes && suggestions.nodes.length > 0) {
            suggestions.nodes.forEach((node, i) => {
                const catalogNode = getNodeById(node.catalogId)
                if (catalogNode) {
                    addNode(
                        node.catalogId,
                        node.name || catalogNode.name,
                        catalogNode.category,
                        { x: 200 + i * 250, y: 150 + (i % 3) * 150 }
                    )
                }
            })
        }

        if (suggestions.edges && suggestions.edges.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 150))
            const currentNodes = useCanvasStore.getState().nodes
            const currentEdges = useCanvasStore.getState().edges
            const newEdges = suggestions.edges
                .filter(e => {
                    const sourceExists = currentNodes.some(n => (n.data as any)?.catalogId === e.source || n.id === e.source)
                    const targetExists = currentNodes.some(n => (n.data as any)?.catalogId === e.target || n.id === e.target)
                    return sourceExists && targetExists
                })
                .map(e => ({
                    id: `edge-${generateId()}`,
                    source: currentNodes.find(n => (n.data as any)?.catalogId === e.source)?.id || e.source,
                    target: currentNodes.find(n => (n.data as any)?.catalogId === e.target)?.id || e.target,
                }))

            if (newEdges.length > 0) {
                setEdges([...currentEdges, ...newEdges])
            }
        }

        // Auto-layout
        try {
            await new Promise(resolve => setTimeout(resolve, 200))
            window.dispatchEvent(new Event('trigger-auto-layout'))
        } catch { }

        setAppliedSuggestions(prev => new Set([...prev, messageIndex]))
    }, [addNode, setEdges])

    useEffect(() => {
        applySuggestionsRef.current = applySuggestions
    }, [applySuggestions])

    // Clear conversation
    const clearChat = useCallback(() => {
        setMessages([{
            role: 'assistant',
            content: "### Fresh Start 🔄\n\nConversation cleared. What would you like to explore?"
        }])
        setAppliedSuggestions(new Set())
        setShowQuickPrompts(true)
    }, [])

    // Current tab prompts
    const currentPrompts = useMemo(() => {
        return PROMPT_TABS.find(t => t.id === activeTab)?.prompts || []
    }, [activeTab])

    return (
        <div
            className={cn(
                'fixed top-0 right-0 z-50 h-screen',
                'bg-background/95 dark:bg-background/98 backdrop-blur-xl',
                'border-l border-border/50',
                'w-[min(480px,100vw)] flex flex-col',
                'animate-in slide-in-from-right duration-300 ease-out',
                'shadow-2xl shadow-black/10 dark:shadow-black/40',
                className
            )}
        >
            {/* ===== HEADER ===== */}
            <div className={cn(
                "px-4 py-3 flex items-center justify-between",
                "bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10",
                "dark:from-purple-500/20 dark:via-indigo-500/20 dark:to-blue-500/20",
                "border-b border-border/30"
            )}>
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Bot className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-foreground">MDF Advisor</h2>
                        <p className="text-[10px] text-muted-foreground">Pipeline Strategy Consultant</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearChat}
                        title="Clear conversation"
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        title="Close"
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* ===== MESSAGES ===== */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className={cn(
                        "flex gap-3",
                        message.role === 'user' && "flex-row-reverse"
                    )}>
                        {/* Avatar */}
                        <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                            message.role === 'assistant'
                                ? "bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400"
                                : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400"
                        )}>
                            {message.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>

                        {/* Bubble */}
                        <div className={cn(
                            "flex-1 rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[85%]",
                            message.role === 'assistant'
                                ? "bg-muted/50 dark:bg-white/5 text-foreground/85 border border-border/30"
                                : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/15"
                        )}>
                            {message.role === 'assistant' ? (
                                <div className="space-y-0.5">
                                    {renderMarkdown(message.content)}
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{message.content}</div>
                            )}

                            {/* Scorecard Widget */}
                            {message.suggestions?.scorecard && (
                                <ScorecardWidget scorecard={message.suggestions.scorecard} />
                            )}

                            {/* Apply Suggestions Button */}
                            {message.suggestions && (message.suggestions.nodes?.length || 0) > 0 && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                    {appliedSuggestions.has(index) ? (
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs">
                                            <Check className="w-4 h-4" />
                                            <span className="font-medium">Added to workspace</span>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => applySuggestions(index, message.suggestions)}
                                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg text-xs h-8 shadow-lg shadow-purple-500/20"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                                            Add {message.suggestions.nodes?.length} component(s) to workspace
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="bg-muted/50 dark:bg-white/5 border border-border/30 rounded-xl px-4 py-3 flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs text-muted-foreground ml-1">MDF Advisor is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ===== QUICK PROMPTS ===== */}
            {showQuickPrompts && (
                <div className="border-t border-border/30 bg-muted/20 dark:bg-white/[0.02]">
                    {/* Tab Bar */}
                    <div className="flex border-b border-border/20">
                        {PROMPT_TABS.map(tab => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-medium transition-all",
                                        activeTab === tab.id
                                            ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-500/5"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Icon className="w-3 h-3" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Prompt Cards */}
                    <div className="p-2.5 space-y-1.5">
                        {currentPrompts.map((qp, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(qp.prompt)}
                                disabled={isLoading}
                                className={cn(
                                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs",
                                    "text-foreground/80 hover:text-foreground",
                                    "bg-background/50 hover:bg-purple-500/10 dark:bg-white/5 dark:hover:bg-purple-500/10",
                                    "border border-border/30 hover:border-purple-500/30",
                                    "transition-all duration-150 text-left group"
                                )}
                            >
                                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-purple-500 transition-colors shrink-0" />
                                <span className="font-medium">{qp.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== CHAT INPUT ===== */}
            <div className="p-3 bg-muted/30 dark:bg-white/[0.02] border-t border-border/30">
                {/* Quick prompt toggle if hidden */}
                {!showQuickPrompts && messages.length > 1 && (
                    <button
                        onClick={() => setShowQuickPrompts(true)}
                        className="mb-2 flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Sparkles className="w-3 h-3" />
                        Show quick prompts
                    </button>
                )}
                <div className="flex gap-2 items-end">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleTextareaInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your data pipeline..."
                        rows={1}
                        className={cn(
                            "flex-1 px-3 py-2 text-sm rounded-xl resize-none",
                            "bg-background dark:bg-white/5 border border-border/50",
                            "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent",
                            "placeholder:text-muted-foreground/50",
                            "text-foreground",
                            "transition-all"
                        )}
                        style={{ maxHeight: '120px' }}
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "h-9 w-9 rounded-xl shrink-0 transition-all",
                            input.trim()
                                ? "bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/20"
                                : "bg-muted text-muted-foreground"
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-[9px] text-muted-foreground/50 mt-1.5 text-center">
                    Shift+Enter for new line • Powered by Llama 3.3
                </p>
            </div>
        </div>
    )
}
