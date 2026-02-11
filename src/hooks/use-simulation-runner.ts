import { useCallback, useRef } from 'react'
import { useUIStore } from '@/store/ui-store'
import { Edge, Node } from '@xyflow/react'

export function useSimulationRunner() {
    const { setSimulationState, setSimulationRunning } = useUIStore()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const runSimulation = useCallback((nodes: Node[], edges: Edge[]) => {
        // 1. Identify Key Nodes
        // Finding the Hub: Check for isHub flag OR category 'mdf' (MDF Hub)
        const hubNode = nodes.find(n => (n.data as any)?.isHub || n.data.category === 'mdf')
        if (!hubNode) {
            console.warn("No Hub node found for simulation")
            return
        }

        // Find a source connected to Hub
        const sourceEdge = edges.find(e => e.target === hubNode.id)
        const sourceNode = sourceEdge ? nodes.find(n => n.id === sourceEdge.source) : null

        // Find a destination connected from Hub
        const destEdge = edges.find(e => e.source === hubNode.id)
        const destNode = destEdge ? nodes.find(n => n.id === destEdge.target) : null

        if (!sourceNode || !destNode) {
            console.warn("Incomplete pipeline for simulation (Source -> Hub -> Dest required)")
            // Fallback or simple run
            setSimulationRunning(true)
            setTimeout(() => setSimulationRunning(false), 3000)
            return
        }

        // 2. Start Sequence
        setSimulationRunning(true)

        // Dynamic Payload Generation
        const sourceLabel = (sourceNode.data.label as string) || ''
        const isCRM = sourceLabel.toLowerCase().includes('salesforce') || sourceLabel.toLowerCase().includes('crm')
        const isWeb = sourceLabel.toLowerCase().includes('web') || sourceLabel.toLowerCase().includes('analytics')

        let extractionPayload
        if (isCRM) {
            extractionPayload = {
                input: {
                    id: "LEAD-001",
                    name: "JOHN DOE",
                    phone: "123.456.7890",
                    source: "Salesforce CRM",
                    status: "New"
                }
            }
        } else if (isWeb) {
            extractionPayload = {
                input: {
                    cookieId: "ga_1.2.345",
                    event: "form_submit",
                    url: "/pricing",
                    device: "Mobile - iPhone"
                }
            }
        } else {
            extractionPayload = {
                input: {
                    id: "RAW-882",
                    type: "Batch File",
                    size: "24.5 KB",
                    records: 150
                }
            }
        }

        // Step 1: Extraction (Source)
        setSimulationState({
            status: 'extraction',
            activeNodeId: sourceNode.id,
            dataPayload: extractionPayload
        })

        // Step 2: Move to Hub (Transformation)
        timeoutRef.current = setTimeout(() => {
            // Clear active node to trigger edge animation flow
            setSimulationState({ status: 'start_flow', activeNodeId: null })

            // Wait for edge travel time
            setTimeout(() => {
                // Transformation Payload
                let diffPayload
                if (isCRM) {
                    diffPayload = {
                        name: { original: "JOHN DOE", new: "John Doe" },
                        phone: { original: "123.456.7890", new: "+1 (123) 456-7890" },
                        id: { original: "LEAD-001", new: "UP-8812" }
                    }
                } else if (isWeb) {
                    diffPayload = {
                        id: { original: "ga_1.2.345", new: "UP-8812 (Matched)" },
                        event: { original: "form_submit", new: "Conversion" },
                        confidence: { original: "n/a", new: "High (Deterministic)" }
                    }
                } else {
                    diffPayload = {
                        status: { original: "Raw", new: "Standardized" },
                        quality: { original: "Low", new: "High" },
                        schema: { original: "CSV", new: "XDM" }
                    }
                }

                setSimulationState({
                    status: 'transformation',
                    activeNodeId: hubNode.id,
                    dataPayload: { diff: diffPayload }
                })

                // Step 3: Move to Dest (Activation)
                timeoutRef.current = setTimeout(() => {
                    setSimulationState({ status: 'start_flow', activeNodeId: null })

                    setTimeout(() => {
                        // Activation Payload
                        let activationPayload = {
                            output: {
                                id: "UP-8812",
                                name: "John Doe",
                                segment: "High Value",
                                action: "Email Trigger"
                            }
                        }

                        setSimulationState({
                            status: 'activation',
                            activeNodeId: destNode.id,
                            dataPayload: activationPayload
                        })

                        // End
                        timeoutRef.current = setTimeout(() => {
                            setSimulationState({ status: 'complete', activeNodeId: null })
                            setSimulationRunning(false)
                            setSimulationState({ status: 'idle', dataPayload: null })
                        }, 4000)

                    }, 1500) // Edge travel time

                }, 5000) // Transformation viewing time
            }, 1500) // Edge travel time 

        }, 4000) // Extraction viewing time

    }, [setSimulationState, setSimulationRunning])

    const stopSimulation = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setSimulationRunning(false)
        setSimulationState({ status: 'idle', activeNodeId: null, dataPayload: null })
    }, [setSimulationRunning, setSimulationState])

    return { runSimulation, stopSimulation }
}
