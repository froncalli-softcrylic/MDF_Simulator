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
        displayName: 'Adobe Experience Platform',
        description: 'Complete Adobe Experience Cloud stack with AEP, RTCDP, CJA, Journey Optimizer, Target, and Marketo',
        brandColor: '#FF0000',
        category: 'vendor_suite',

        requiredNodes: [
            // Collection Layer
            'adobe_web_sdk', 'adobe_analytics',
            // Ingestion Layer
            'aep_sources',
            // Storage (Bottom Band)
            'aep_data_lake',
            // Central MDF HUB (Replaces Hygiene/Identity/Measurement/Profile nodes)
            'mdf_hub',
            // Analytics
            'customer_journey_analytics',
            // Activation
            'rtcdp_activation',
            // Destinations
            'journey_optimizer', 'adobe_target'
        ],
        recommendedNodes: [
            'marketo', 'web_app_events', 'salesforce_crm'
        ],
        optionalNodes: ['snowflake', 'bigquery', 'facebook_ads', 'google_ads'],
        hiddenNodes: ['segment', 'hightouch', 'mparticle', 'hubspot_crm'],

        requiredEdges: [
            // Collection to Ingestion
            { source: 'adobe_web_sdk', target: 'aep_sources' },
            { source: 'adobe_analytics', target: 'aep_sources' },
            // Ingestion to Storage (Data Lake)
            { source: 'aep_sources', target: 'aep_data_lake' },
            // Ingestion to MDF Hub
            { source: 'aep_sources', target: 'mdf_hub' },
            // Storage to MDF Hub (Bottom band feed)
            { source: 'aep_data_lake', target: 'mdf_hub' },
            // MDF Hub to Analytics
            { source: 'mdf_hub', target: 'customer_journey_analytics' },
            // MDF Hub to Activation
            { source: 'mdf_hub', target: 'rtcdp_activation' },
            // Activation to Destinations
            { source: 'rtcdp_activation', target: 'journey_optimizer' },
            { source: 'rtcdp_activation', target: 'adobe_target' }
        ],
        recommendedEdges: [
            { source: 'marketo', target: 'aep_sources' },
            { source: 'web_app_events', target: 'adobe_web_sdk' },
            { source: 'salesforce_crm', target: 'aep_sources' },
            { source: 'rtcdp_activation', target: 'facebook_ads' },
            { source: 'rtcdp_activation', target: 'google_ads' }
        ],

        governanceRailNodes: ['aep_data_governance', 'privacy_service'],
        identityHubNodes: ['mdf_hub'],
        identityStrategy: 'platform_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'adobe_experience_cloud',
        alternativeTemplateIds: []
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
