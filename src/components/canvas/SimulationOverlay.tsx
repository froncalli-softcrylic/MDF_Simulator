'use client'

import { useUIStore } from '@/store/ui-store'
import { useNodes, useReactFlow } from '@xyflow/react'
import { AnimatePresence } from 'framer-motion'
import { DataTransformationCard } from '@/components/simulation/DataTransformationCard'
import { useEffect, useState } from 'react'

export function SimulationOverlay() {
    const { simulationState } = useUIStore()
    const nodes = useNodes()
    const { setCenter } = useReactFlow()

    // We need to track the position of the active node
    const [position, setPosition] = useState<{ x: number, y: number, placement: 'top' | 'bottom' } | null>(null)

    const activeNode = nodes.find(n => n.id === simulationState.activeNodeId)

    useEffect(() => {
        if (activeNode && activeNode.measured && activeNode.measured.width && activeNode.measured.height) {
            // Camera Follow: Smooth pan to the active node
            const centerX = activeNode.position.x + (activeNode.measured.width / 2)
            const centerY = activeNode.position.y + (activeNode.measured.height / 2)

            setCenter(centerX, centerY, { zoom: 1.1, duration: 1000 })

            // Smart Positioning for the card:
            // Even with camera follow, we keep this to dictate direction of arrows/animations
            const isNearTop = activeNode.position.y < 150

            setPosition({
                x: centerX,
                y: activeNode.position.y,
                placement: isNearTop ? 'bottom' : 'top'
            })
        } else {
            setPosition(null)
        }
    }, [activeNode, simulationState.activeNodeId, setCenter])

    // Only show overlay in active extraction/transformation/activation steps
    const showCard = ['extraction', 'transformation', 'activation'].includes(simulationState.status) && position && activeNode

    if (!showCard) return null

    // We render this inside the viewport, so coordinates match the nodes
    return (
        <div
            className="absolute inset-0 pointer-events-none z-50 overflow-visible"
            style={{
                width: '100%',
                height: '100%',
            }}
        >
            <div
                className="absolute w-0 h-0 visible"
                style={{
                    transform: `translate(${position!.x}px, ${position!.y}px)`
                }}
            >
                <AnimatePresence mode="wait">
                    <DataTransformationCard
                        key={simulationState.status} // Key changes trigger exit/enter animations
                        stage={simulationState.status as any}
                        placement={position?.placement || 'top'}
                        data={{
                            input: simulationState.dataPayload?.input, // From store
                            output: simulationState.dataPayload?.output,
                            diff: simulationState.dataPayload?.diff
                        }}
                        nodeName={activeNode?.data?.label as string || 'Node'}
                    />
                </AnimatePresence>
            </div>
        </div>
    )
}
