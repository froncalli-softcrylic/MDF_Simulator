'use client'

import { useUIStore } from '@/store/ui-store'
import { useNodes, useReactFlow } from '@xyflow/react'
import { AnimatePresence } from 'framer-motion'
import { DataTransformationCard } from '@/components/simulation/DataTransformationCard'
import { useEffect } from 'react'

function getStageForCategory(category: string): 'extraction' | 'transformation' | 'activation' {
    if (['sources', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse'].includes(category)) {
        return 'extraction'
    }
    if (['transform', 'mdf', 'identity', 'governance'].includes(category)) {
        return 'transformation'
    }
    return 'activation'
}

export function SimulationOverlay() {
    const { simulationState } = useUIStore()
    const nodes = useNodes()
    const { setCenter } = useReactFlow()

    const activeNode = nodes.find(n => n.id === simulationState.activeNodeId)

    // Camera follow: pan to the active node so it's visible on canvas
    useEffect(() => {
        if (activeNode && activeNode.measured && activeNode.measured.width && activeNode.measured.height) {
            const centerX = activeNode.position.x + (activeNode.measured.width / 2)
            const centerY = activeNode.position.y + (activeNode.measured.height / 2)
            setCenter(centerX, centerY, { zoom: 1.0, duration: 1000 })
        }
    }, [activeNode, simulationState.activeNodeId, setCenter])

    // Only show card when stepping (actively on a node)
    const showCard = simulationState.status === 'stepping' && activeNode

    if (!showCard) return null

    // Determine the stage based on the active node's category
    const activeCategory = (activeNode?.data as any)?.category as string || 'sources'
    const stage = getStageForCategory(activeCategory)

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none translate-x-[20vw]">
            <AnimatePresence mode="wait">
                <DataTransformationCard
                    key={`${simulationState.currentStepIndex}-${simulationState.status}`}
                    stage={stage}
                    data={{
                        input: simulationState.dataPayload?.input,
                        output: simulationState.dataPayload?.output,
                        diff: simulationState.dataPayload?.diff
                    }}
                    nodeName={activeNode?.data?.label as string || 'Node'}
                    stepInfo={{
                        current: simulationState.currentStepIndex + 1,
                        total: simulationState.pathSteps.length,
                        category: activeCategory
                    }}
                />
            </AnimatePresence>
        </div>
    )
}
