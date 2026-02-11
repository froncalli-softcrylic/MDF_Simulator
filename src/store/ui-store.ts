// UI Store - Zustand store for UI state
// Manages selection, overlays, modals, and validation results

import { create } from 'zustand'
import type { ValueOverlay, ValidationOutput, SuggestedFixes, DuplicateConflict } from '@/types'



export type SimulationStep = 'idle' | 'stepping' | 'transitioning' | 'complete' | 'results' | 'error';

export interface SimulationPathStep {
    nodeId: string;
    label: string;
    category: string;
    description: string;
}

export interface SimulationState {
    status: SimulationStep;
    activeNodeId: string | null;
    message: string | null;
    dataPayload: any;
    // Dynamic path
    pathSteps: SimulationPathStep[];
    currentStepIndex: number;
    // Results data
    resultsData: {
        totalNodes: number;
        sourceNames: string[];
        destinationNames: string[];
        categories: string[];
        finalPayload: any;
    } | null;
}

interface UIStore {
    // Selection
    selectedNodeId: string | null
    setSelectedNodeId: (id: string | null) => void

    // Value overlays
    activeOverlay: ValueOverlay
    setActiveOverlay: (overlay: ValueOverlay) => void
    toggleOverlay: (overlay: ValueOverlay) => void

    // Validation
    validationResults: ValidationOutput | null
    setValidationResults: (results: ValidationOutput | null) => void
    isValidationPanelOpen: boolean
    setValidationPanelOpen: (open: boolean) => void

    // Lead capture modal
    showLeadModal: boolean
    leadModalAction: 'save' | 'export' | 'share' | null
    openLeadModal: (action: 'save' | 'export' | 'share') => void
    closeLeadModal: () => void

    // Panels
    isPaletteOpen: boolean
    setIsPaletteOpen: (open: boolean) => void
    togglePalette: () => void

    isInspectorOpen: boolean
    setIsInspectorOpen: (open: boolean) => void
    toggleInspector: () => void

    // View controls
    isMinimapVisible: boolean
    setMinimapVisible: (visible: boolean) => void

    // Auto Layout / Smart Connect
    isAutoLayoutRunning: boolean
    setAutoLayoutRunning: (running: boolean) => void
    smartConnectFixes: SuggestedFixes | null
    setSmartConnectFixes: (fixes: SuggestedFixes | null) => void
    showSmartConnectPanel: boolean
    setShowSmartConnectPanel: (show: boolean) => void

    // Replace Modal (for singleton conflicts)
    pendingReplaceConflict: DuplicateConflict | null
    setPendingReplaceConflict: (conflict: DuplicateConflict | null) => void

    // AI Assistant
    showAIAssistant: boolean
    setShowAIAssistant: (show: boolean) => void
    // Change tracking
    lastActionWasAutoFix: boolean
    setLastActionWasAutoFix: (wasAutoFix: boolean) => void

    // Guided Tour
    isTourOpen: boolean
    currentStep: number
    startTour: () => void
    nextStep: () => void
    prevStep: () => void
    endTour: () => void

    // Simulation
    isSimulationRunning: boolean
    setSimulationRunning: (running: boolean) => void
    simulationState: SimulationState; // NEW
    setSimulationState: (state: Partial<SimulationState>) => void; // NEW
}

export const useUIStore = create<UIStore>((set, get) => ({
    // Selection
    selectedNodeId: null,
    setSelectedNodeId: (id) => set({
        selectedNodeId: id,
        isInspectorOpen: id !== null ? true : get().isInspectorOpen
    }),

    // Value overlays
    activeOverlay: null,
    setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
    toggleOverlay: (overlay) => set({
        activeOverlay: get().activeOverlay === overlay ? null : overlay
    }),

    // Validation
    validationResults: null,
    setValidationResults: (results) => set({ validationResults: results }),
    isValidationPanelOpen: true,
    setValidationPanelOpen: (open) => set({ isValidationPanelOpen: open }),

    // Lead capture modal
    showLeadModal: false,
    leadModalAction: null,
    openLeadModal: (action) => set({ showLeadModal: true, leadModalAction: action }),
    closeLeadModal: () => set({ showLeadModal: false, leadModalAction: null }),

    // Panels
    isPaletteOpen: true,
    setIsPaletteOpen: (open) => set({ isPaletteOpen: open }),
    togglePalette: () => set({ isPaletteOpen: !get().isPaletteOpen }),

    isInspectorOpen: false,
    setIsInspectorOpen: (open) => set({ isInspectorOpen: open }),
    toggleInspector: () => set({ isInspectorOpen: !get().isInspectorOpen }),

    // View controls
    isMinimapVisible: true,
    setMinimapVisible: (visible) => set({ isMinimapVisible: visible }),

    // Auto Layout / Smart Connect
    isAutoLayoutRunning: false,
    setAutoLayoutRunning: (running) => set({ isAutoLayoutRunning: running }),
    smartConnectFixes: null,
    setSmartConnectFixes: (fixes) => set({ smartConnectFixes: fixes }),
    showSmartConnectPanel: false,
    setShowSmartConnectPanel: (show) => set({ showSmartConnectPanel: show }),

    // Replace Modal
    pendingReplaceConflict: null,
    setPendingReplaceConflict: (conflict) => set({ pendingReplaceConflict: conflict }),

    // AI Assistant
    showAIAssistant: false,
    setShowAIAssistant: (show) => set({ showAIAssistant: show }),

    // Change tracking
    lastActionWasAutoFix: false,
    setLastActionWasAutoFix: (wasAutoFix) => set({ lastActionWasAutoFix: wasAutoFix }),

    // Guided Tour
    isTourOpen: false,
    currentStep: 0,
    startTour: () => set({ isTourOpen: true, currentStep: 0, isPaletteOpen: true, isInspectorOpen: true }), // Ensure panels are open for tour
    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
    endTour: () => set({ isTourOpen: false, currentStep: 0 }),

    // Simulation
    // Simulation
    isSimulationRunning: false,
    setSimulationRunning: (running) => set({ isSimulationRunning: running }),

    simulationState: {
        status: 'idle',
        activeNodeId: null,
        message: null,
        dataPayload: null,
        pathSteps: [],
        currentStepIndex: -1,
        resultsData: null
    },
    setSimulationState: (newState) => set((state) => ({
        simulationState: { ...state.simulationState, ...newState }
    }))
}))

