import { DemoProfile, NodeCategory } from '@/types'

// ============================================
// PROFILE DEFINITION SCHEMA
// ============================================

export interface ProfileDefinition {
    // Identity
    profileId: DemoProfile
    displayName: string
    description: string
    brandColor: string
    category: 'vendor_suite' | 'marketing_ecosystem' | 'general'

    // Node Specification
    requiredNodes: string[]      // Must be present for conformance
    recommendedNodes: string[]   // Suggested but optional
    optionalNodes: string[]      // Available in palette
    hiddenNodes: string[]        // Not shown in palette

    // Edge Specification (canonical flow)
    requiredEdges: Array<{ source: string; target: string }>
    recommendedEdges: Array<{ source: string; target: string }>

    // Special Positioning
    governanceRailNodes: string[]   // Positioned at top
    identityHubNodes: string[]      // Positioned in center cluster

    // Strategy Hints
    identityStrategy: 'warehouse_native' | 'cdp_native' | 'platform_native' | 'intent_enriched'
    governanceStrategy: 'distributed' | 'centralized'

    // Templates
    defaultTemplateId: string
    alternativeTemplateIds: string[]
    columnOverrides?: Record<string, number>
}

// ============================================
// PROFILE DEFINITIONS
// ============================================

export const PROFILE_DEFINITIONS: Record<string, ProfileDefinition> = {
    // -------------------------------------------------------------
    // VENDOR SUITE PROFILES
    // -------------------------------------------------------------

    // 1. Adobe Experience Platform (Consolidated into adobe_summit)
    adobe_summit: {
        profileId: 'adobe_summit',
        displayName: 'Adobe Summit',
        description: 'Sources → MDF Hub → Destinations. The MDF Hub encapsulates the full Marketing Data Foundation.',
        brandColor: '#FA0F00',
        category: 'vendor_suite',

        requiredNodes: [
            // Sources
            'marketo', 'salesforce_crm', 'web_app_events', 'product_events',
            // Hub
            'mdf_hub',
            // Destinations
            'adobe_target', 'journey_optimizer_dest', 'meta_ads'
        ],
        recommendedNodes: [],
        optionalNodes: [],
        hiddenNodes: [],

        requiredEdges: [
            { source: 'marketo', target: 'mdf_hub' },
            { source: 'salesforce_crm', target: 'mdf_hub' },
            { source: 'web_app_events', target: 'mdf_hub' },
            { source: 'product_events', target: 'mdf_hub' },
            { source: 'mdf_hub', target: 'adobe_target' },
            { source: 'mdf_hub', target: 'journey_optimizer_dest' },
            { source: 'mdf_hub', target: 'meta_ads' }
        ],
        recommendedEdges: [],

        governanceRailNodes: [],
        identityHubNodes: ['mdf_hub'],
        identityStrategy: 'platform_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'adobe_experience_cloud',
        alternativeTemplateIds: [],

        columnOverrides: {
            'marketo': 0,
            'salesforce_crm': 0,
            'web_app_events': 0,
            'product_events': 0,
            'mdf_hub': 1,
            'adobe_target': 2,
            'journey_optimizer_dest': 2,
            'meta_ads': 2
        }
    },

    generic: {
        profileId: 'generic',
        displayName: 'Blank / Generic',
        description: 'Custom implementation based on needs',
        brandColor: '#64748b',
        category: 'general',
        requiredNodes: [],
        recommendedNodes: [],
        optionalNodes: [],
        hiddenNodes: [],
        requiredEdges: [],
        recommendedEdges: [],
        governanceRailNodes: [],
        identityHubNodes: [],
        identityStrategy: 'warehouse_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'blank',
        alternativeTemplateIds: []
    }
}
