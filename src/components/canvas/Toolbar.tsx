import { useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useReactFlow } from '@xyflow/react'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { useProfileStore } from '@/store/profile-store'
import { semanticAutoLayout } from '@/lib/semantic-layout-engine'
import { generateFixPlan as generateLegacyFixPlan, sanitizeEdges } from '@/lib/smart-connect-engine'
import { calculateFlowImpact } from '@/lib/recommendation-engine'
import { demoProfiles, profileOptions } from '@/data/demo-profiles'
import { generateDefaultDiagramForProfile } from '@/lib/diagram-generator'
import {
    loadProfileDefinition,
    buildGraphFromProfile,
    normalizeGraph,
    validateConformance,
    generateFixPlan as generateProfileFixPlan
} from '@/lib/profile-pipeline'
import { calculateLayout } from '@/lib/auto-layout-engine'
import type { PipelineStage } from '@/types'
import { DemoProfile } from '@/types'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
    LayoutGrid, Undo2, Redo2, Maximize,
    Download, Share2, Zap, BarChart2, Users, Shield,
    ChevronDown, ChevronUp, MoreHorizontal, Home, Sparkles, Loader2, Bot, Activity, AlertTriangle, HelpCircle, FileText
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
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
        setShowSmartConnectPanel,
        showAIAssistant,
        setShowAIAssistant,
        startTour,
        lastActionWasAutoFix,
        setLastActionWasAutoFix
    } = useUIStore()
    const { activeProfile, setActiveProfile } = useProfileStore()
    const { fitView } = useReactFlow()

    // Calculate Flow Health Score
    const flowScore = useMemo(() => calculateFlowImpact(nodes), [nodes])

    const handleAutoLayout = useCallback(async () => {
        if (!nodes || nodes.length === 0) return
        setAutoLayoutRunning(true)

        try {
            // Aggressively sanitize inputs
            const safeNodes = nodes.filter(n => n?.id)
            const safeEdges = sanitizeEdges(edges)

            // Step 1: Clean store state (prevents React Flow render crashes if edges were malformed)
            if (safeEdges.length !== edges.length) {
                const { setEdges } = useCanvasStore.getState()
                setEdges(safeEdges)
            }

            // Step 1: Apply Semantic Layout (ELK with stage partitioning)
            const layoutedNodes = await semanticAutoLayout(safeNodes, safeEdges)
            setNodes(layoutedNodes)
            setTimeout(() => fitView({ padding: 0.35, duration: 200 }), 100)

            // Step 2: Generate Smart Connect Level 2 fix plan
            if (layoutedNodes && layoutedNodes.length > 0) {
                try {
                    const profileDef = loadProfileDefinition(activeProfile)
                    const fixPlan = generateLegacyFixPlan(layoutedNodes, safeEdges, profileDef)

                    // Show panel if there are suggestions
                    if (fixPlan.totalSuggestions > 0) {
                        setSmartConnectFixes(fixPlan as any)
                        setShowSmartConnectPanel(true)
                        setLastActionWasAutoFix(true)
                    } else {
                        setLastActionWasAutoFix(false)
                    }
                } catch (err) {
                    console.error('Smart Connect generation failed:', err)
                    // Don't crash the whole layout if smart connect fails
                }
            }
        } catch (error) {
            console.error('Auto Layout failed:', error)
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

    const handleMarkdownExport = useCallback(async () => {
        const { exportToMarkdown, downloadMarkdown } = await import('@/lib/export-service')
        const { validateGraph } = await import('@/lib/validation-engine')
        const { loadProfileDefinition } = await import('@/lib/profile-pipeline')
        const profileDef = loadProfileDefinition(activeProfile)
        const validation = validateGraph(nodes, edges, profileDef)
        const md = exportToMarkdown({
            nodes,
            edges,
            profileName: activeProfile,
            validationResults: validation
        })
        downloadMarkdown(md)
    }, [nodes, edges, activeProfile])

    const handleProfileChange = useCallback((value: string) => {
        // Unsaved changes check (simplified)
        // In a real app, we'd check a 'dirty' flag in the store
        if (nodes.length > 5 && !window.confirm('Switching profiles will reset your current diagram. Continue?')) {
            return
        }

        const profileId = value as DemoProfile
        setActiveProfile(profileId)

        try {
            // 1. Load Definition
            const profileDef = loadProfileDefinition(profileId)
            if (!profileDef) {
                console.error('Profile definition not found:', profileId)
                return
            }

            // 2. Build & Normalize Graph
            let graph = buildGraphFromProfile(profileDef)
            graph = normalizeGraph(graph, profileDef)

            // 3. Run Layout (Synchronous for now)
            const stageAssignments = new Map<string, PipelineStage>()
            graph.nodes.forEach(n => {
                if (n.data.stage) stageAssignments.set(n.id, n.data.stage as PipelineStage)
            })

            // Adapt to AutoLayout types
            const canvasNodes = graph.nodes.map(n => ({
                id: n.id,
                catalogId: n.data.catalogId,
                category: n.data.category,
                position: n.position
            }))

            const layoutResult = calculateLayout(canvasNodes, stageAssignments)

            // Apply positions
            graph.nodes = graph.nodes.map(n => ({
                ...n,
                position: layoutResult.positions.get(n.id) || n.position
            }))

            // 4. Update Store
            useCanvasStore.getState().loadGraph(graph)

            // 5. Generate Fix Plan (Smart Connect)
            const fixPlan = generateProfileFixPlan(graph, profileDef)
            setSmartConnectFixes(fixPlan)
            if (fixPlan.totalSuggestions > 0) {
                setShowSmartConnectPanel(true)
            }

            // 6. Conformance Check
            const conformance = validateConformance(graph, profileDef)
            if (!conformance.valid) {
                console.warn('Profile conformance issues:', conformance.violations)
            }

            setTimeout(() => fitView({ padding: 0.35, duration: 600 }), 50)

        } catch (error) {
            console.error('Profile pipeline failed:', error)
            // Fallback
            const graph = generateDefaultDiagramForProfile(profileId)
            useCanvasStore.getState().loadGraph(graph)
        }
    }, [nodes.length, setActiveProfile, fitView, setSmartConnectFixes, setShowSmartConnectPanel])

    const handleGoHome = useCallback(() => {
        router.push('/')
    }, [router])

    return (
        <>
            {/* Collapsed toolbar toggle */}
            <div
                className={cn(
                    'absolute top-4 left-1/2 -translate-x-1/2 z-20',
                    'transition-all duration-300 ease-out',
                    isExpanded ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'
                )}
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsExpanded(true)}
                    className="gap-2 shadow-lg bg-white/90 backdrop-blur-md hover:bg-white border border-white/20 text-xs font-semibold rounded-full px-4 h-9"
                >
                    <ChevronDown className="w-3 h-3" />
                    Show Toolbar
                </Button>
            </div>

            {/* Main floating dock */}
            <div
                className={cn(
                    'absolute left-1/2 -translate-x-1/2 z-20',
                    'transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
                    isExpanded ? 'top-4 opacity-100 scale-100' : '-top-20 opacity-0 scale-95'
                )}
            >
                <div id="tour-toolbar" className={cn(
                    'flex items-center gap-1 p-2 rounded-2xl',
                    'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-2xl ring-1 ring-black/5',
                    'min-w-max animate-float'
                )}>
                    {/* Home Group */}
                    <div className="flex items-center px-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleGoHome}
                            title="Back to Home"
                            className="h-9 w-9 rounded-xl hover:bg-slate-200/50 hover:text-primary transition-colors"
                        >
                            <Home className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Editor Actions */}
                    <div className="flex items-center gap-1">
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    undo()
                                    setLastActionWasAutoFix(false)
                                }}
                                disabled={!canUndo()}
                                title="Undo"
                                aria-label="Undo last action"
                                className="h-9 w-9 rounded-xl"
                            >
                                <Undo2 className="w-4 h-4" />
                            </Button>
                            {lastActionWasAutoFix && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={redo}
                            disabled={!canRedo()}
                            title="Redo"
                            aria-label="Redo last action"
                            className="h-9 w-9 rounded-xl"
                        >
                            <Redo2 className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleAutoLayout}
                            disabled={nodes.length === 0 || isAutoLayoutRunning}
                            className={cn(
                                "h-9 px-3 gap-2 rounded-xl text-xs font-medium transition-all",
                                isAutoLayoutRunning ? "bg-primary/10 text-primary" : "hover:bg-slate-100"
                            )}
                            title="Auto Layout"
                        >
                            {isAutoLayoutRunning ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LayoutGrid className="w-4 h-4" />
                            )}
                            <span className="hidden xl:inline">Clean Up</span>
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Flow Health Score (New) */}
                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-9 gap-2 px-3 rounded-xl transition-all font-semibold",
                                        flowScore.rating === 'excellent' ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" :
                                            flowScore.rating === 'good' ? "text-blue-600 bg-blue-50 hover:bg-blue-100" :
                                                flowScore.rating === 'fair' ? "text-amber-600 bg-amber-50 hover:bg-amber-100" :
                                                    "text-red-600 bg-red-50 hover:bg-red-100"
                                    )}
                                >
                                    <Activity className="w-4 h-4" />
                                    <span className="hidden sm:inline">{flowScore.rating.charAt(0).toUpperCase() + flowScore.rating.slice(1)}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60">
                                <DropdownMenuLabel>Architecture Health</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="p-3 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">ROI Potential</span>
                                        <span className={cn(
                                            "font-bold",
                                            flowScore.roiScore > 70 ? "text-emerald-600" : "text-slate-700"
                                        )}>{flowScore.roiScore}/100</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Complexity</span>
                                        <span className={cn(
                                            "font-bold",
                                            flowScore.complexityScore > 70 ? "text-red-600" : "text-emerald-600"
                                        )}>{flowScore.complexityScore}/100</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{ width: `${flowScore.roiScore}%` }}
                                        />
                                    </div>
                                </div>

                                {flowScore.warnings.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <div className="p-2 bg-amber-50 rounded-b-lg">
                                            {flowScore.warnings.map((w, i) => (
                                                <div key={i} className="flex gap-2 text-[10px] text-amber-700 mb-1 last:mb-0">
                                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                                    {w}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* AI & Features */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant={showAIAssistant ? 'default' : 'secondary'}
                            size="sm"
                            onClick={() => setShowAIAssistant(!showAIAssistant)}
                            className={cn(
                                "h-9 gap-2 px-3 rounded-xl transition-all shadow-sm",
                                showAIAssistant
                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-purple-500/25"
                                    : "bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800"
                            )}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="hidden sm:inline text-xs font-bold">AI Assistant</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={startTour}
                            title="Help Guide"
                            className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-500"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Overlays */}
                    <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
                        {overlayButtons.map(({ id, label, icon: Icon, color, bgActive }) => (
                            <Button
                                key={id}
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleOverlay(id as any)}
                                title={label}
                                className={cn(
                                    'h-8 w-8 p-0 rounded-lg transition-all duration-300',
                                    activeOverlay === id && 'bg-white shadow-sm scale-110'
                                )}
                            >
                                <Icon className={cn('w-4 h-4 transition-colors', activeOverlay === id ? color : 'text-slate-400')} />
                            </Button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Profile Selector */}
                    <div className="flex items-center gap-2 px-1">
                        <Select value={activeProfile} onValueChange={handleProfileChange}>
                            <SelectTrigger className="w-[140px] h-9 text-xs border-0 bg-transparent hover:bg-slate-100/50 focus:ring-0 rounded-xl">
                                <SelectValue placeholder="Profile" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Vendor Suites</SelectLabel>
                                    {profileOptions.filter(p => p.category === 'Vendor Suite').map(profile => (
                                        <SelectItem key={profile.id} value={profile.id} className="text-xs pl-6">
                                            {profile.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                                <SelectSeparator />
                                <SelectGroup>
                                    <SelectLabel>Marketing Ecosystems</SelectLabel>
                                    {profileOptions.filter(p => p.category === 'Marketing Ecosystem').map(profile => (
                                        <SelectItem key={profile.id} value={profile.id} className="text-xs pl-6">
                                            {profile.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                                <SelectSeparator />
                                <SelectGroup>
                                    <SelectLabel>General / Legacy</SelectLabel>
                                    {profileOptions.filter(p => !p.category || (p.category !== 'Vendor Suite' && p.category !== 'Marketing Ecosystem')).map(profile => (
                                        <SelectItem key={profile.id} value={profile.id} className="text-xs pl-6">
                                            {profile.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-1 pl-1">
                            <Button variant="ghost" size="icon" onClick={handleShare} className="h-9 w-9 rounded-xl hover:bg-slate-100">
                                <Share2 className="w-4 h-4 text-slate-500" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100" title="Export">
                                        <Download className="w-4 h-4 text-slate-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Export as</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleExport}>
                                        <Download className="w-3.5 h-3.5 mr-2" />
                                        PNG Image
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleMarkdownExport}>
                                        <FileText className="w-3.5 h-3.5 mr-2" />
                                        Markdown + Rationale
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Hide Handle */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-12 rounded-full bg-slate-200/50 hover:bg-slate-300/50 p-0"
                        onClick={() => setIsExpanded(false)}
                    >
                        <ChevronUp className="w-3 h-3 text-slate-500" />
                    </Button>
                </div>
            </div>
        </>
    )
}
