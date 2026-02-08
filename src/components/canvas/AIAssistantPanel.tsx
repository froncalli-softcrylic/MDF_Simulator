'use client'

// AI Assistant Panel - LLM-powered MDF flow generation assistant

import { useState, useCallback, useRef, useEffect } from 'react'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { useProfileStore } from '@/store/profile-store'
import { getNodeById } from '@/data/node-catalog'
import { getProfileConfig } from '@/data/demo-profiles'
import { generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    X,
    Send,
    GripHorizontal,
    Bot,
    User,
    Loader2,
    Check,
    Plus,
    Sparkles,
    Shield,
    ClipboardList
} from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
    suggestions?: {
        nodes?: Array<{ catalogId: string; name: string; stage: string }>
        edges?: Array<{ source: string; target: string }>
        explanation?: string
    }
}

interface AIAssistantPanelProps {
    onClose: () => void
    className?: string
}

export default function AIAssistantPanel({
    onClose,
    className
}: AIAssistantPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your MDF Assistant. Tell me about your data pipeline needs and I'll suggest the right components. For example:\n\n• \"I need to sync HubSpot data to Snowflake\"\n• \"Help me set up a B2B marketing stack\"\n• \"What nodes do I need for identity resolution?\""
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set())
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const { nodes, edges, addNode, setEdges } = useCanvasStore()
    const { validationResults } = useUIStore()
    const { activeProfile } = useProfileStore()

    // Onboarding state
    const [showOnboarding, setShowOnboarding] = useState(true)
    const [onboardingData, setOnboardingData] = useState({
        currentStack: '',
        painPoints: '',
        goals: ''
    })

    const handleOnboardingSubmit = useCallback(() => {
        const { currentStack, painPoints, goals } = onboardingData
        if (!currentStack.trim() && !painPoints.trim() && !goals.trim()) return

        const prompt = [
            'Based on my context, propose 2-3 pipeline architecture variants:',
            currentStack.trim() && `**Current Stack**: ${currentStack.trim()}`,
            painPoints.trim() && `**Pain Points**: ${painPoints.trim()}`,
            goals.trim() && `**Goals**: ${goals.trim()}`,
            '',
            'For each variant: list the nodes (by catalog ID), explain tradeoffs, and recommend which is best for my situation. Return JSON with nodes and edges arrays I can apply.'
        ].filter(Boolean).join('\n')

        setShowOnboarding(false)
        setInput(prompt)
        setTimeout(() => {
            inputRef.current?.focus()
        }, 50)
    }, [onboardingData])

    // Drag functionality
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null)

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        }
    }, [position])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragRef.current) return
            const deltaX = e.clientX - dragRef.current.startX
            const deltaY = e.clientY - dragRef.current.startY
            setPosition({
                x: dragRef.current.initialX + deltaX,
                y: dragRef.current.initialY + deltaY
            })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            dragRef.current = null
        }

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const sendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = { role: 'user', content: input.trim() }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const profileConfig = getProfileConfig(activeProfile)

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
                    } : null,
                    profileContext: {
                        id: profileConfig.id,
                        name: profileConfig.name,
                        description: profileConfig.description,
                        identityStrategy: profileConfig.identityStrategy,
                        governanceRailNodes: profileConfig.governanceRailNodes
                    }
                })
            })

            if (!response.ok) {
                throw new Error('Failed to get response')
            }

            const data = await response.json()

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                suggestions: data.suggestions
            }])
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure the GROQ_API_KEY is configured in your .env.local file.'
            }])
        } finally {
            setIsLoading(false)
        }
    }, [input, isLoading, messages, nodes, edges, validationResults, activeProfile])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }, [sendMessage])

    const handleQuickAction = (action: 'review' | 'fix' | 'identity') => {
        let text = ''
        switch (action) {
            case 'review':
                text = "Review my current architecture against the active profile. Identify gaps and suggest improvements."
                break
            case 'fix':
                text = "Explain the current validation errors and provide a JSON fix plan."
                break
            case 'identity':
                text = "What is the best Identity Resolution strategy for this stack?"
                break
        }
        setInput(text)
        // Focus input
        setTimeout(() => inputRef.current?.focus(), 10)
    }

    const applySuggestions = useCallback((messageIndex: number, suggestions: Message['suggestions']) => {
        if (!suggestions) return

        // Add nodes
        if (suggestions.nodes) {
            suggestions.nodes.forEach((node, i) => {
                const catalogNode = getNodeById(node.catalogId)
                if (catalogNode) {
                    addNode(
                        node.catalogId,
                        node.name || catalogNode.name,
                        catalogNode.category,
                        { x: 100 + i * 200, y: 200 }
                    )
                }
            })
        }

        // Add edges (after a small delay to ensure nodes exist)
        if (suggestions.edges && suggestions.edges.length > 0) {
            setTimeout(() => {
                const currentNodes = useCanvasStore.getState().nodes
                const currentEdges = useCanvasStore.getState().edges

                const newEdges = suggestions.edges!
                    .filter(e => {
                        const sourceExists = currentNodes.some(n => n.data?.catalogId === e.source || n.id === e.source)
                        const targetExists = currentNodes.some(n => n.data?.catalogId === e.target || n.id === e.target)
                        return sourceExists && targetExists
                    })
                    .map(e => ({
                        id: `edge-${generateId()}`,
                        source: currentNodes.find(n => n.data?.catalogId === e.source)?.id || e.source,
                        target: currentNodes.find(n => n.data?.catalogId === e.target)?.id || e.target,
                        type: 'smoothstep'
                    }))

                if (newEdges.length > 0) {
                    setEdges([...currentEdges, ...newEdges])
                }
            }, 100)
        }

        setAppliedSuggestions(prev => new Set([...prev, messageIndex]))
    }, [addNode, setEdges])

    return (
        <div
            className={cn(
                'absolute top-4 right-4 z-40',
                'bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200',
                'w-[400px] h-[500px] flex flex-col overflow-hidden',
                position.x === 0 && position.y === 0 && 'animate-in slide-in-from-right-4 fade-in duration-300',
                isDragging && 'cursor-grabbing',
                className
            )}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`
            }}
        >
            {/* Header - Drag Handle */}
            <div
                onMouseDown={handleMouseDown}
                className={cn(
                    "px-4 py-3 border-b border-slate-100 flex items-center justify-between",
                    "bg-gradient-to-r from-purple-50 to-indigo-50",
                    "cursor-grab select-none",
                    isDragging && "cursor-grabbing"
                )}
            >
                <div className="flex items-center gap-2">
                    <GripHorizontal className="w-4 h-4 text-slate-400" />
                    <Bot className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-slate-800">
                        MDF Assistant
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        AI
                    </span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className={cn(
                        "flex gap-3",
                        message.role === 'user' && "flex-row-reverse"
                    )}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            message.role === 'assistant'
                                ? "bg-purple-100 text-purple-600"
                                : "bg-blue-100 text-blue-600"
                        )}>
                            {message.role === 'assistant' ? (
                                <Bot className="w-4 h-4" />
                            ) : (
                                <User className="w-4 h-4" />
                            )}
                        </div>
                        <div className={cn(
                            "flex-1 rounded-lg px-3 py-2 text-sm",
                            message.role === 'assistant'
                                ? "bg-slate-50 text-slate-700"
                                : "bg-blue-500 text-white"
                        )}>
                            <div className="whitespace-pre-wrap">{message.content}</div>

                            {/* Suggestions Apply Button */}
                            {message.suggestions && (message.suggestions.nodes?.length || 0) > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                    {appliedSuggestions.has(index) ? (
                                        <div className="flex items-center gap-2 text-green-600 text-xs">
                                            <Check className="w-4 h-4" />
                                            <span>Added to canvas</span>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => applySuggestions(index, message.suggestions)}
                                            className="w-full bg-purple-500 hover:bg-purple-600"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add {message.suggestions.nodes?.length} node(s) to canvas
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            <span className="text-sm text-slate-500">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Onboarding Form */}
            {showOnboarding && messages.length <= 1 && (
                <div className="border-t border-slate-100 bg-gradient-to-b from-purple-50/50 to-white p-3 space-y-2">
                    <div className="flex items-center gap-1.5 mb-1">
                        <ClipboardList className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs font-semibold text-purple-700">Quick Onboarding</span>
                        <button onClick={() => setShowOnboarding(false)} className="ml-auto text-xs text-slate-400 hover:text-slate-600">Skip</button>
                    </div>
                    <input
                        type="text"
                        value={onboardingData.currentStack}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, currentStack: e.target.value }))}
                        placeholder="Current stack (e.g., Salesforce, HubSpot, Snowflake...)"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <input
                        type="text"
                        value={onboardingData.painPoints}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, painPoints: e.target.value }))}
                        placeholder="Pain points (e.g., no unified identity, manual data syncs...)"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <input
                        type="text"
                        value={onboardingData.goals}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, goals: e.target.value }))}
                        placeholder="Goals (e.g., ABM activation, reduce time-to-insight...)"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <Button
                        size="sm"
                        className="w-full h-7 text-xs bg-purple-500 hover:bg-purple-600"
                        onClick={handleOnboardingSubmit}
                        disabled={!onboardingData.currentStack.trim() && !onboardingData.painPoints.trim() && !onboardingData.goals.trim()}
                    >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Generate Pipeline Suggestions
                    </Button>
                </div>
            )}

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex gap-2 overflow-x-auto no-scrollbar">
                <Button variant="outline" size="sm" className="h-7 text-xs whitespace-nowrap bg-white" onClick={() => handleQuickAction('review')}>
                    <Sparkles className="w-3 h-3 mr-1 text-purple-500" /> Full Review
                </Button>
                {validationResults && validationResults.errors.length > 0 && (
                    <Button variant="outline" size="sm" className="h-7 text-xs whitespace-nowrap bg-white border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleQuickAction('fix')}>
                        <Shield className="w-3 h-3 mr-1" /> Fix Errors
                    </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs whitespace-nowrap bg-white" onClick={() => handleQuickAction('identity')}>
                    <User className="w-3 h-3 mr-1 text-blue-500" /> Identity Strategy
                </Button>
                {!showOnboarding && (
                    <Button variant="outline" size="sm" className="h-7 text-xs whitespace-nowrap bg-white" onClick={() => setShowOnboarding(true)}>
                        <ClipboardList className="w-3 h-3 mr-1 text-purple-500" /> Onboarding
                    </Button>
                )}
            </div>

            {/* Input */}
            <div className="p-4 pt-2 bg-slate-50">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your data pipeline needs..."
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="bg-purple-500 hover:bg-purple-600"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
