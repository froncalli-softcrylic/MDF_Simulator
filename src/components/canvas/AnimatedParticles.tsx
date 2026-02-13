'use client'

// Animated data particles that flow along edges during simulation
// Uses CSS animations on SVG circles for performance

import { useMemo } from 'react'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'

// Category color map for particles
const categoryColors: Record<string, string> = {
    sources: '#06b6d4',
    collection: '#8b5cf6',
    ingestion: '#a855f7',
    storage_raw: '#64748b',
    storage_warehouse: '#3b82f6',
    transform: '#6366f1',
    mdf: '#f59e0b',
    identity: '#10b981',
    governance: '#f59e0b',
    analytics: '#ec4899',
    activation: '#22c55e',
    destination: '#14b8a6',
}

export default function AnimatedParticles() {
    const nodes = useCanvasStore(state => state.nodes)
    const edges = useCanvasStore(state => state.edges)
    const isSimulationRunning = useUIStore(state => state.isSimulationRunning)

    // Build edge path data with positions
    const edgePaths = useMemo(() => {
        if (!isSimulationRunning || !nodes.length || !edges.length) return []

        const nodeMap = new Map(nodes.map(n => [n.id, n]))

        return edges.map((edge, i) => {
            const source = nodeMap.get(edge.source)
            const target = nodeMap.get(edge.target)
            if (!source || !target) return null

            const sx = source.position.x + 120 // right side of node (approx width/2)
            const sy = source.position.y + 40  // center of node (approx height/2)
            const tx = target.position.x        // left side of node
            const ty = target.position.y + 40

            const category = (source.data as any)?.category || 'sources'
            const color = categoryColors[category] || '#06b6d4'

            // Smoothstep-like path
            const midX = (sx + tx) / 2

            return {
                id: edge.id,
                path: `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`,
                color,
                delay: (i * 0.3) % 3, // stagger particles
                duration: 2 + (i % 3) * 0.5 // vary speed slightly
            }
        }).filter(Boolean)
    }, [isSimulationRunning, nodes, edges])

    if (!isSimulationRunning || edgePaths.length === 0) return null

    return (
        <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            style={{ zIndex: 1 }}
        >
            <defs>
                {edgePaths.map((ep: any) => (
                    <filter key={`glow-${ep.id}`} id={`particle-glow-${ep.id}`}>
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                ))}
            </defs>

            {edgePaths.map((ep: any) => (
                <g key={ep.id}>
                    {/* Invisible path for motion */}
                    <path
                        id={`path-${ep.id}`}
                        d={ep.path}
                        fill="none"
                        stroke="none"
                    />

                    {/* Primary particle */}
                    <circle r="3" fill={ep.color} opacity="0.9" filter={`url(#particle-glow-${ep.id})`}>
                        <animateMotion
                            dur={`${ep.duration}s`}
                            repeatCount="indefinite"
                            begin={`${ep.delay}s`}
                        >
                            <mpath href={`#path-${ep.id}`} />
                        </animateMotion>
                        <animate
                            attributeName="opacity"
                            values="0;0.9;0.9;0"
                            dur={`${ep.duration}s`}
                            repeatCount="indefinite"
                            begin={`${ep.delay}s`}
                        />
                    </circle>

                    {/* Trail particle (smaller, delayed) */}
                    <circle r="2" fill={ep.color} opacity="0.4">
                        <animateMotion
                            dur={`${ep.duration}s`}
                            repeatCount="indefinite"
                            begin={`${ep.delay + 0.3}s`}
                        >
                            <mpath href={`#path-${ep.id}`} />
                        </animateMotion>
                        <animate
                            attributeName="opacity"
                            values="0;0.4;0.4;0"
                            dur={`${ep.duration}s`}
                            repeatCount="indefinite"
                            begin={`${ep.delay + 0.3}s`}
                        />
                    </circle>
                </g>
            ))}
        </svg>
    )
}
