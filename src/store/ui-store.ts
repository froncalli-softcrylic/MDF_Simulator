// UI Store - Zustand store for UI state
// Manages selection, overlays, modals, and validation results

import { create } from 'zustand'
import type { ValueOverlay, ValidationOutput, SuggestedFixes, DuplicateConflict } from '@/types'

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
    setPendingReplaceConflict: (conflict) => set({ pendingReplaceConflict: conflict })
}))

