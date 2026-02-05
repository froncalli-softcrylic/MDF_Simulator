'use client'

// Toolbar - Top toolbar for canvas controls
// Responsive with slide animation and home button

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useReactFlow } from '@xyflow/react'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { useProfileStore } from '@/store/profile-store'
import { applyAutoLayout } from '@/lib/layout-engine'
import { generateSuggestedFixes } from '@/lib/auto-layout-engine'
import { demoProfiles, profileOptions } from '@/data/demo-profiles'
import { generateDefaultDiagramForProfile } from '@/lib/diagram-generator'
import { DemoProfile } from '@/types'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
    LayoutGrid, Undo2, Redo2, Maximize,
    Download, Share2, Zap, BarChart2, Users, Shield,
    ChevronDown, ChevronUp, MoreHorizontal, Home, Sparkles, Loader2
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

// Value overlay buttons
const overlayButtons = [
    { id: 'activation', label: 'Activation', icon: Zap, color: 'text-green-500', bgActive: 'bg-green-500' },
    { id: 'measurement', label: 'Measurement', icon: BarChart2, color: 'text-pink-500', bgActive: 'bg-pink-500' },
    { id: 'identity', label: 'Identity', icon: Users, color: 'text-emerald-500', bgActive: 'bg-emerald-500' },
    { id: 'governance', label: 'Governance', icon: Shield, color: 'text-amber-500', bgActive: 'bg-amber-500' },
] as const

export default function Toolbar() {
    const router = useRouter()
    const [isExpanded, setIsExpanded] = useState(true)
    const { nodes, edges, setNodes, canUndo, canRedo, undo, redo } = useCanvasStore()
    const {
        activeOverlay,
        toggleOverlay,
        openLeadModal,
        isAutoLayoutRunning,
        setAutoLayoutRunning,
        setSmartConnectFixes,
        setShowSmartConnectPanel
    } = useUIStore()
    const { activeProfile, setActiveProfile } = useProfileStore()
    const { fitView } = useReactFlow()

    const handleAutoLayout = useCallback(async () => {
        if (nodes.length === 0) return
        setAutoLayoutRunning(true)

        try {
            // Step 1: Apply ELK.js layout
            const layoutedNodes = await applyAutoLayout(nodes, edges)
            setNodes(layoutedNodes)
            setTimeout(() => fitView({ padding: 0.2, duration: 200 }), 100)

            // Step 2: Generate smart connect suggestions
            const canvasNodes = layoutedNodes.map(n => ({
                id: n.id,
                catalogId: (n.data as any)?.catalogId || '',
                category: (n.data as any)?.category || 'source',
                position: n.position
            }))
            const canvasEdges = edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.sourceHandle,
                targetHandle: e.targetHandle
            }))

            const fixes = generateSuggestedFixes(canvasNodes, canvasEdges)

            // Show panel if there are suggestions
            if (fixes.suggestedEdges.length > 0 || fixes.missingNodes.length > 0) {
                setSmartConnectFixes(fixes)
                setShowSmartConnectPanel(true)
            }
        } finally {
            setAutoLayoutRunning(false)
        }
    }, [nodes, edges, setNodes, fitView, setAutoLayoutRunning, setSmartConnectFixes, setShowSmartConnectPanel])

    const handleExport = useCallback(async () => {
        openLeadModal('export')
    }, [openLeadModal])

    const handleShare = useCallback(() => {
        openLeadModal('share')
    }, [openLeadModal])

    const handleProfileChange = useCallback((value: string) => {
        const profile = value as DemoProfile
        setActiveProfile(profile)
        // Regenerate diagram with new profile's default stack
        const graph = generateDefaultDiagramForProfile(profile)
        useCanvasStore.getState().loadGraph(graph)
        setTimeout(() => fitView({ padding: 0.2, duration: 200 }), 100)
    }, [setActiveProfile, fitView])

    const handleGoHome = useCallback(() => {
        router.push('/')
    }, [router])

    return (
        <>
            {/* Collapsed toolbar toggle */}
            <div
                className={cn(
                    'absolute top-2 left-1/2 -translate-x-1/2 z-20',
                    'transition-all duration-300 ease-out',
                    isExpanded ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'
                )}
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsExpanded(true)}
                    className="gap-2 shadow-lg"
                >
                    <ChevronDown className="w-4 h-4" />
                    Show Toolbar
                </Button>
            </div>

            {/* Main toolbar with slide animation */}
            <div
                className={cn(
                    'absolute left-0 right-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 overflow-hidden shadow-sm',
                    'transition-all duration-300 ease-out',
                    isExpanded ? 'top-0 opacity-100' : '-top-14 opacity-0'
                )}
            >
                <div className="flex items-center justify-between px-2 py-1.5 gap-2 min-w-0">
                    {/* Left: Home + Core actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Home button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleGoHome}
                            title="Back to Home"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                            <Home className="w-4 h-4" />
                        </Button>

                        <div className="w-px h-5 bg-slate-200 mx-1" />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleAutoLayout}
                            disabled={nodes.length === 0 || isAutoLayoutRunning}
                            className="h-8 px-2 gap-1.5"
                            title="Auto Layout + Smart Connect"
                        >
                            {isAutoLayoutRunning ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LayoutGrid className="w-4 h-4" />
                            )}
                            <Sparkles className="w-3 h-3 text-blue-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={undo}
                            disabled={!canUndo()}
                            title="Undo"
                            className="h-8 w-8 p-0"
                        >
                            <Undo2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={redo}
                            disabled={!canRedo()}
                            title="Redo"
                            className="h-8 w-8 p-0"
                        >
                            <Redo2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fitView({ padding: 0.2 })}
                            title="Fit View"
                            className="h-8 w-8 p-0"
                        >
                            <Maximize className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Center: Overlay toggles */}
                    <div className="flex items-center gap-0.5 flex-shrink min-w-0">
                        {overlayButtons.map(({ id, label, icon: Icon, color, bgActive }) => (
                            <Button
                                key={id}
                                variant={activeOverlay === id ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => toggleOverlay(id as any)}
                                title={label}
                                className={cn(
                                    'h-8 w-8 p-0 lg:w-auto lg:px-2 lg:gap-1',
                                    activeOverlay === id && bgActive
                                )}
                            >
                                <Icon className={cn('w-4 h-4', activeOverlay !== id && color)} />
                                <span className="hidden lg:inline text-xs">{label}</span>
                            </Button>
                        ))}
                    </div>

                    {/* Right: Profile & Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Select value={activeProfile} onValueChange={handleProfileChange}>
                            <SelectTrigger className="w-[90px] lg:w-[130px] h-8 text-xs">
                                <SelectValue placeholder="Profile" />
                            </SelectTrigger>
                            <SelectContent>
                                {profileOptions.map(profile => (
                                    <SelectItem key={profile.id} value={profile.id} className="text-xs">
                                        {profile.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Desktop: Show both buttons */}
                        <div className="hidden md:flex items-center gap-1">
                            <Button variant="outline" size="sm" onClick={handleExport} className="h-8 px-2">
                                <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="default" size="sm" onClick={handleShare} className="h-8 px-2">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Tablet: More menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="md:hidden">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExport}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleShare}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleGoHome}>
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Home
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsExpanded(false)}>
                                    <ChevronUp className="w-4 h-4 mr-2" />
                                    Hide Toolbar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Desktop: Hide button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(false)}
                            title="Hide Toolbar"
                            className="hidden md:flex h-8 w-8 p-0"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
