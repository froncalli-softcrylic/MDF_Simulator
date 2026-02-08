'use client'

// Stage column labels — rendered as non-interactive flow-space elements
// These labels scroll and zoom with the canvas because they're positioned
// using the ReactFlow viewport transform, not a fixed Panel.

import { useMemo, useEffect, useState } from 'react'
import { useReactFlow, useViewport } from '@xyflow/react'
import { useCanvasStore } from '@/store/canvas-store'
import { getStageColumnsFromNodes, type StageColumn } from '@/lib/semantic-layout-engine'

// Stage colors matching the node category themes
const stageColors: Record<string, { bg: string; text: string; accent: string }> = {
    sources: { bg: 'rgba(6, 182, 212, 0.08)', text: '#0e7490', accent: 'rgba(6, 182, 212, 0.25)' },
    collection: { bg: 'rgba(147, 51, 234, 0.08)', text: '#7c3aed', accent: 'rgba(147, 51, 234, 0.25)' },
    ingestion: { bg: 'rgba(139, 92, 246, 0.08)', text: '#6d28d9', accent: 'rgba(139, 92, 246, 0.25)' },
    storage_raw: { bg: 'rgba(100, 116, 139, 0.08)', text: '#475569', accent: 'rgba(100, 116, 139, 0.25)' },
    storage_warehouse: { bg: 'rgba(59, 130, 246, 0.08)', text: '#2563eb', accent: 'rgba(59, 130, 246, 0.25)' },
    transform: { bg: 'rgba(99, 102, 241, 0.08)', text: '#4338ca', accent: 'rgba(99, 102, 241, 0.25)' },
    identity: { bg: 'rgba(16, 185, 129, 0.08)', text: '#059669', accent: 'rgba(16, 185, 129, 0.25)' },
    governance: { bg: 'rgba(245, 158, 11, 0.08)', text: '#d97706', accent: 'rgba(245, 158, 11, 0.25)' },
    analytics: { bg: 'rgba(236, 72, 153, 0.08)', text: '#db2777', accent: 'rgba(236, 72, 153, 0.25)' },
    activation: { bg: 'rgba(34, 197, 94, 0.08)', text: '#16a34a', accent: 'rgba(34, 197, 94, 0.25)' },
    clean_room: { bg: 'rgba(100, 116, 139, 0.06)', text: '#64748b', accent: 'rgba(100, 116, 139, 0.20)' },
    realtime_serving: { bg: 'rgba(249, 115, 22, 0.08)', text: '#ea580c', accent: 'rgba(249, 115, 22, 0.25)' },
    destination: { bg: 'rgba(20, 184, 166, 0.08)', text: '#0d9488', accent: 'rgba(20, 184, 166, 0.25)' },
}

// Step number per stage
const stageStepNumber: Record<string, number> = {
    sources: 1,
    collection: 2,
    ingestion: 3,
    storage_raw: 4,
    storage_warehouse: 5,
    transform: 6,
    identity: 7,
    analytics: 8,
    activation: 9,
    destination: 10,
}

export default function StageLabels() {
    const nodes = useCanvasStore(state => state.nodes)
    const { x, y, zoom } = useViewport()

    const columns = useMemo(() => {
        if (!nodes || nodes.length < 2) return []
        return getStageColumnsFromNodes(nodes)
    }, [nodes])

    // Find the top-most node Y position to place labels above
    const minNodeY = useMemo(() => {
        let minY = Infinity
        for (const node of nodes) {
            if (node.position.y < minY) minY = node.position.y
        }
        return minY === Infinity ? 0 : minY
    }, [nodes])

    if (columns.length === 0) return null

    const labelY = minNodeY - 50 // Place labels 50px above the first node row

    return (
        <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ zIndex: 0 }}
        >
            {/* Transform container that follows the viewport */}
            <div
                style={{
                    position: 'absolute',
                    transformOrigin: '0 0',
                    transform: `translate(${x}px, ${y}px) scale(${zoom})`,
                }}
            >
                {columns.map((col) => {
                    const colors = stageColors[col.stage] || stageColors.sources
                    const step = stageStepNumber[col.stage]

                    // Calculate the column height to cover all nodes
                    const colHeight = 2000 // Large enough to cover any layout

                    return (
                        <div key={col.stage}>
                            {/* Swim lane background strip */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${col.x - 10}px`,
                                    top: `${labelY - 20}px`,
                                    width: `${col.width + 20}px`,
                                    height: `${colHeight}px`,
                                    background: colors.bg,
                                    borderLeft: `1px solid ${colors.accent}`,
                                    borderRight: `1px solid ${colors.accent}`,
                                    borderRadius: '12px 12px 0 0',
                                }}
                            />
                            {/* Label pill at the top */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${col.x + col.width / 2}px`,
                                    top: `${labelY - 15}px`,
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '3px 12px 3px 8px',
                                    borderRadius: '8px',
                                    background: 'white',
                                    border: `1px solid ${colors.accent}`,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {step && (
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: 900,
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: colors.accent,
                                        color: colors.text,
                                    }}>
                                        {step}
                                    </span>
                                )}
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    color: colors.text,
                                }}>
                                    {col.label}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
