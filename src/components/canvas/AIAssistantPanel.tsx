'use client'

// AI Assistant Panel - Conversational MDF advisor (Chat-only, no consultant wizard)

import { useState, useCallback, useRef, useEffect } from 'react'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { getNodeById } from '@/data/node-catalog'
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
    Stethoscope,
    Search,
    Layers,
    BookOpen
} from 'lucide-react'

const quickPrompts = [
    { icon: Stethoscope, label: 'Is MDF right for me?', prompt: 'Help me figure out if a Marketing Data Foundation (MDF) is the right approach for my business. Ask me diagnostic questions to determine my suitability.' },
    { icon: Search, label: 'Analyze my canvas', prompt: 'Analyze the current nodes on my canvas and identify any gaps in my data pipeline. What am I missing? What should I add?' },
    { icon: Layers, label: 'Recommend architecture', prompt: 'Based on a typical B2B SaaS company, recommend a starting data architecture. What components should I have and how should they connect?' },
    { icon: BookOpen, label: 'Explain pipeline stages', prompt: 'Walk me through each stage of an MDF pipeline — from data sources to activation. Explain what each stage does and why it matters.' }
]

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
            content: "Hi! I'm your MDF Data Strategy Advisor. I'm here to help you build the right data pipeline for your business.\n\nTo get started, tell me a little about your situation:\n\n• What tools or data sources are you currently using? (e.g. Salesforce, HubSpot, Google Analytics)\n• What are your biggest pain points with your current setup?\n• What are you ultimately trying to achieve?\n\nThe more context you share, the better I can help!"
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set())
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const applySuggestionsRef = useRef<(messageIndex: number, suggestions: Message['suggestions']) => void>(() => { })

    const { nodes, edges, addNode, setEdges } = useCanvasStore()
    const { validationResults } = useUIStore()

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

            if (!response.ok) {
                throw new Error('Failed to get response')
            }

            const data = await response.json()

            const newMessageIndex = messages.length + 1 // +1 for user message already added

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                suggestions: data.suggestions
            }])

            // AUTO-APPLY: If the response includes suggestions, add them immediately
            if (data.suggestions?.nodes?.length > 0) {
                // Small delay to ensure the message state is committed
                setTimeout(() => {
                    applySuggestionsRef.current(newMessageIndex, data.suggestions)
                }, 300)
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure the GROQ_API_KEY is configured in your .env.local file.'
            }])
        } finally {
            setIsLoading(false)
        }
    }, [input, isLoading, messages, nodes, edges, validationResults])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }, [sendMessage])

    const sendQuickPrompt = useCallback((prompt: string) => {
        setInput(prompt)
        // Small delay so state updates, then send
        setTimeout(() => {
            const fakeInput = prompt
            setInput('')
            const userMessage: Message = { role: 'user', content: fakeInput }
            setMessages(prev => [...prev, userMessage])
            setIsLoading(true)

            fetch('/api/chat', {
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
                .then(res => res.json())
                .then(data => {
                    const newMsgIdx = messages.length + 1
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: data.message,
                        suggestions: data.suggestions
                    }])
                    if (data.suggestions?.nodes?.length > 0) {
                        setTimeout(() => applySuggestionsRef.current(newMsgIdx, data.suggestions), 300)
                    }
                })
                .catch(() => {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'Sorry, I encountered an error. Please check your GROQ_API_KEY configuration.'
                    }])
                })
                .finally(() => setIsLoading(false))
        }, 50)
    }, [messages, nodes, edges, validationResults])

    const applySuggestions = useCallback(async (messageIndex: number, suggestions: Message['suggestions']) => {
        if (!suggestions) return

        // Add nodes with staggered positions
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

        // Add edges after nodes are in the store
        if (suggestions.edges && suggestions.edges.length > 0) {
            // Small delay to ensure nodes are committed to store
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
                    type: 'smoothstep'
                }))

            if (newEdges.length > 0) {
                setEdges([...currentEdges, ...newEdges])
            }
        }

        // Trigger auto-layout after everything is added
        try {
            await new Promise(resolve => setTimeout(resolve, 200))
            const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
            const { nodes: allNodes, edges: allEdges, setNodes } = useCanvasStore.getState()
            const layoutedNodes = await semanticAutoLayout(allNodes, allEdges)
            setNodes(layoutedNodes)
        } catch (e) {
            // Layout is optional, don't block the apply
        }

        setAppliedSuggestions(prev => new Set([...prev, messageIndex]))
    }, [addNode, setEdges])

    // Keep ref in sync so sendMessage can call latest applySuggestions
    useEffect(() => {
        applySuggestionsRef.current = applySuggestions
    }, [applySuggestions])

    return (
        <div
            className={cn(
                'absolute top-4 right-4 z-40',
                'bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200',
                'w-[min(450px,calc(100vw-2rem))] h-[min(600px,calc(100vh-6rem))] flex flex-col overflow-hidden',
                position.x === 0 && position.y === 0 && 'animate-in slide-in-from-right-4 fade-in duration-300',
                isDragging && 'cursor-grabbing',
                className
            )}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                maxWidth: 'calc(100vw - 2rem)',
                maxHeight: 'calc(100vh - 6rem)'
            }}
        >
            {/* Header */}
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
                    <Bot className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-slate-800">MDF Advisor</span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Chat Messages */}
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
                            {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className={cn(
                            "flex-1 rounded-lg px-3 py-2 text-sm",
                            message.role === 'assistant' ? "bg-slate-50 text-slate-700" : "bg-blue-500 text-white"
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
                                            Add {message.suggestions.nodes?.length} component(s) to workspace
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

            {/* Quick-Start Diagnostic Chips */}
            {messages.length <= 1 && !isLoading && (
                <div className="px-4 py-2 border-t border-slate-100 bg-white/50">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Quick Start</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {quickPrompts.map((qp, i) => (
                            <button
                                key={i}
                                onClick={() => sendQuickPrompt(qp.prompt)}
                                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-100 hover:border-purple-200 transition-all duration-150 text-left"
                            >
                                <qp.icon className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{qp.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Input */}
            <div className="p-4 pt-2 bg-slate-50 border-t border-slate-100">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tell me about your data challenges..."
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
