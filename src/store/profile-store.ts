// Profile Store - Zustand store for demo profile and wizard state
// Persisted to localStorage to survive page navigation

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DemoProfile, WizardData, CloudProvider, Tool, PainPoint, Goal } from '@/types'
import { logger } from '@/lib/logger'

interface ProfileStore {
    // Current profile
    activeProfile: DemoProfile
    setActiveProfile: (profile: DemoProfile) => void

    // Wizard data (persisted for diagram generation)
    wizardData: WizardData | null
    setWizardData: (data: WizardData | null) => void

    // Wizard step state (for multi-step form)
    wizardStep: number
    setWizardStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void
    resetWizard: () => void

    // Individual wizard field setters
    setCloud: (cloud: CloudProvider) => void
    toggleTool: (tool: Tool) => void
    togglePainPoint: (painPoint: PainPoint) => void
    toggleGoal: (goal: Goal) => void

    // Draft wizard data (for in-progress wizard)
    draftCloud: CloudProvider
    draftTools: Tool[]
    draftPainPoints: PainPoint[]
    draftGoals: Goal[]

    // Finalize wizard
    finalizeWizard: () => WizardData
}

const initialDraft = {
    draftCloud: 'aws' as CloudProvider,
    draftTools: [] as Tool[],
    draftPainPoints: [] as PainPoint[],
    draftGoals: [] as Goal[]
}

export const useProfileStore = create<ProfileStore>()(
    persist(
        (set, get) => ({
            // Current profile
            activeProfile: 'preferred_stack',
            setActiveProfile: (profile) => set({ activeProfile: profile }),

            // Wizard data
            wizardData: null,
            setWizardData: (data) => set({ wizardData: data }),

            // Wizard steps
            wizardStep: 0,
            setWizardStep: (step) => set({ wizardStep: step }),
            nextStep: () => set({ wizardStep: get().wizardStep + 1 }),
            prevStep: () => set({ wizardStep: Math.max(0, get().wizardStep - 1) }),
            resetWizard: () => set({
                wizardStep: 0,
                wizardData: null,
                ...initialDraft
            }),

            // Draft state
            ...initialDraft,

            setCloud: (cloud) => set({ draftCloud: cloud }),

            toggleTool: (tool) => {
                const current = get().draftTools
                const updated = current.includes(tool)
                    ? current.filter(t => t !== tool)
                    : [...current, tool]
                set({ draftTools: updated })
            },

            togglePainPoint: (painPoint) => {
                const current = get().draftPainPoints
                const updated = current.includes(painPoint)
                    ? current.filter(p => p !== painPoint)
                    : [...current, painPoint]
                set({ draftPainPoints: updated })
            },

            toggleGoal: (goal) => {
                const current = get().draftGoals
                const updated = current.includes(goal)
                    ? current.filter(g => g !== goal)
                    : [...current, goal]
                set({ draftGoals: updated })
            },

            finalizeWizard: () => {
                const { draftCloud, draftTools, draftPainPoints, draftGoals } = get()
                const wizardData: WizardData = {
                    cloud: draftCloud,
                    tools: draftTools,
                    painPoints: draftPainPoints,
                    goals: draftGoals
                }
                set({ wizardData })
                logger.debug('🧙 Wizard finalized with data:', wizardData)
                return wizardData
            }
        }),
        {
            name: 'mdf-profile-storage',
            // Persist wizard data AND draft state for page navigation
            partialize: (state) => ({
                activeProfile: state.activeProfile,
                wizardData: state.wizardData,
                draftCloud: state.draftCloud,
                draftTools: state.draftTools,
                draftPainPoints: state.draftPainPoints,
                draftGoals: state.draftGoals
            })
        }
    )
)
