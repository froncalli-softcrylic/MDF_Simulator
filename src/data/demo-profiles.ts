// Demo Profiles - B2B SaaS Optimized
// Configured for proper preferred stack and profile-based filtering

import { DemoProfile, DemoProfileConfig } from '@/types'
import { nodeCatalog } from './node-catalog'

// =============================================================
// Profile Options (for dropdowns)
// =============================================================

export const profileOptions: Array<{ id: DemoProfile; name: string; description: string; category?: string }> = [
    {
        id: 'adobe_summit',
        name: 'Adobe Summit Template',
        description: 'MDF Hub Centric: Marketo -> Hub -> AEP -> Activation',
        category: 'Featured'
    },
    {
        id: 'generic',
        name: 'Generic B2B Stack',
        description: 'MDF Hub Centric: Snowflake -> Hub -> Hightouch',
        category: 'Featured'
    }
]

// =============================================================
// Profile Configurations
// =============================================================

export const demoProfiles: Record<DemoProfile, DemoProfileConfig> = {

    // ===================================
    // ADOBE SUMMIT TEMPLATE (Hub-Centric)
    // ===================================
    adobe_summit: {
        id: 'adobe_summit',
        name: 'Adobe Summit Template',
        description: 'Canonical Adobe flow with MDF Hub as the central engine.',
        brandColor: '#FA0F00',
        identityStrategy: 'MDF Hub + AEP Identity Service',
        governanceRailNodes: ['aep_data_governance', 'consent_manager'],
        defaultDestinations: ['adobe_target', 'journey_optimizer', 'meta_ads'],
        emphasizedNodes: [
            'marketo',
            'salesforce_crm',
            'mdf_hub',
            'adobe_aep',
            'adobe_target',
            'journey_optimizer'
        ],
        hiddenNodes: [],
        templates: ['adobe_experience_cloud'],
        template: {
            nodes: [
                'marketo',
                'salesforce_crm',
                'web_app_events',
                'aep_sources',
                'mdf_hub',
                'adobe_aep',
                'adobe_target',
                'journey_optimizer'
            ],
            edges: [
                // Sources -> Ingestion
                ['marketo', 'aep_sources'],
                ['salesforce_crm', 'aep_sources'],
                ['web_app_events', 'aep_sources'],

                // Ingestion -> MDF Hub
                ['aep_sources', 'mdf_hub'],

                // MDF Hub -> Activation (AEP)
                ['mdf_hub', 'adobe_aep'],

                // Activation -> Destinations
                ['adobe_aep', 'adobe_target'],
                ['adobe_aep', 'journey_optimizer']
            ]
        },
        defaultCopy: {
            heroTitle: 'Adobe Summit Architecture',
            heroSubtitle: 'Unified Data. Real-Time Activation.'
        }
    },

    // ===================================
    // GENERIC B2B (MDF Hub Centric)
    // ===================================
    generic: {
        id: 'generic',
        name: 'Generic B2B Stack',
        description: 'Modern B2B stack with Snowflake, MDF Hub, and Hightouch.',
        brandColor: '#64748b',
        identityStrategy: 'MDF Hub (Deterministic)',
        governanceRailNodes: ['consent_manager'],
        defaultDestinations: ['salesforce_crm_dest', 'linkedin_ads', 'slack_alerts'],
        emphasizedNodes: [
            'salesforce_crm',
            'segment',
            'snowflake',
            'mdf_hub',
            'hightouch',
            'salesforce_crm_dest'
        ],
        hiddenNodes: [],
        templates: ['snowflake_composable_b2b'],
        template: {
            nodes: [
                'salesforce_crm',
                'segment',
                'fivetran',
                'snowflake',
                'dbt_core',
                'mdf_hub',
                'hightouch',
                'salesforce_crm_dest',
                'linkedin_ads'
            ],
            edges: [
                // Sources -> Ingestion
                ['salesforce_crm', 'fivetran'],
                ['segment', 'snowflake'],
                ['fivetran', 'snowflake'],

                // Warehouse -> Transform
                ['snowflake', 'dbt_core'],

                // Transform -> MDF Hub
                ['dbt_core', 'mdf_hub'],

                // MDF Hub -> Activation
                ['mdf_hub', 'hightouch'],

                // Activation -> Destinations
                ['hightouch', 'salesforce_crm_dest'],
                ['hightouch', 'linkedin_ads']
            ]
        },
        defaultCopy: {
            heroTitle: 'Modern Data Foundation',
            heroSubtitle: 'Composable. Scalable. Unified.'
        }
    },

    // ===================================
    // FALLBACKS (Empty to satisfy types)
    // ===================================
    // @ts-ignore
    snowflake_composable: {},
    // @ts-ignore
    databricks_lakehouse: {},
    // @ts-ignore
    gcp_bigquery: {},
    // @ts-ignore
    microsoft_fabric: {},
    // @ts-ignore
    salesforce_data_cloud: {},
    // @ts-ignore
    adobe_aep: {},
    // @ts-ignore
    segment_composable: {},
    // @ts-ignore
    mparticle_composable: {},
    // @ts-ignore
    clean_room_layer: {},
    // @ts-ignore
    marketo_centric: {},
    // @ts-ignore
    hubspot_centric: {},
    // @ts-ignore
    braze_centric: {},
    // @ts-ignore
    sfmc_centric: {},
    // @ts-ignore
    abm_intent_centric: {},
    // @ts-ignore
    sales_activation_centric: {},
    // @ts-ignore
    plg_activation_centric: {},
    // @ts-ignore
    customerio_centric: {},
    // @ts-ignore
    preferred_stack: {},
    // @ts-ignore
    google_cloud: {},
    // @ts-ignore
    salesforce: {}
}

// =============================================================
// Helper Functions
// =============================================================

/**
 * Check if a node is visible for a given profile
 */
export function isNodeVisibleInProfile(nodeId: string, profile: DemoProfile): boolean {
    const config = demoProfiles[profile]
    // If not configured (ts-ignored), hide
    if (!config || !config.id) return false

    // Generic shows everything
    if (profile === 'generic') return true

    // Check if explicitly hidden
    if (config.hiddenNodes?.includes(nodeId)) return false

    // Check if node is available for this profile (from catalog)
    const catalogNode = nodeCatalog.find(n => n.id === nodeId)
    if (!catalogNode) return false

    // If node has specific profile availabilities, check them
    return catalogNode.vendorProfileAvailability?.includes(profile) ||
        catalogNode.vendorProfileAvailability?.includes('generic') || false
}

/**
 * Check if a node is emphasized for a given profile
 */
export function isNodeEmphasizedInProfile(nodeId: string, profile: DemoProfile): boolean {
    const config = demoProfiles[profile]
    if (!config || !config.id) return false
    return config.emphasizedNodes?.includes(nodeId) || false
}

/**
 * Get all visible nodes for a profile
 */
export function getVisibleNodesForProfile(profile: DemoProfile): string[] {
    return nodeCatalog
        .filter(node => isNodeVisibleInProfile(node.id, profile))
        .map(node => node.id)
}

/**
 * Get profile configuration
 */
export function getProfileConfig(profile: DemoProfile): DemoProfileConfig {
    return demoProfiles[profile]
}
