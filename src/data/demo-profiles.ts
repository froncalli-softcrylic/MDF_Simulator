// Demo Profiles - B2B SaaS Optimized
// Configured for proper preferred stack and profile-based filtering

import { DemoProfile, DemoProfileConfig } from '@/types'
import { nodeCatalog } from './node-catalog'

// =============================================================
// Profile Options (for dropdowns)
// =============================================================

export const profileOptions: Array<{ id: DemoProfile; name: string; description: string }> = [
    { id: 'preferred_stack', name: 'Preferred Stack', description: 'Snowflake + AWS + Neptune + Hightouch' },
    { id: 'adobe_summit', name: 'Adobe Summit', description: 'Adobe Experience Cloud ecosystem' },
    { id: 'google_cloud', name: 'Google Cloud', description: 'BigQuery + Looker + GCP services' },
    { id: 'salesforce', name: 'Salesforce', description: 'Salesforce CDP + Data Cloud' },
    { id: 'generic', name: 'Generic', description: 'All components available' }
]

// =============================================================
// Profile Configurations
// =============================================================

export const demoProfiles: Record<DemoProfile, DemoProfileConfig> = {
    // Preferred Stack: Snowflake + AWS + Neptune + Hightouch
    preferred_stack: {
        id: 'preferred_stack',
        name: 'Preferred Stack (B2B SaaS)',
        description: 'Enterprise B2B stack with Snowflake, AWS, Neptune Graph, and Hightouch',
        brandColor: '#06b6d4', // Cyan
        emphasizedNodes: [
            'product_events', 'salesforce_crm', 'billing_system',
            'segment', 'kinesis', 'kinesis_firehose', 's3_raw', 'snowflake',
            'dbt_core', 'neptune_graph', 'account_resolution', 'sixsense', 'clearbit',
            'consent_manager', 'access_control', 'data_quality',
            'looker', 'opportunity_influence',
            'hightouch', 'salesforce_crm_dest', 'linkedin_ads', 'slack_alerts'
        ],
        hiddenNodes: [
            // GCP-specific
            'pubsub', 'gcs_raw', 'bigquery', 'dataflow',
            // Salesforce-specific
            'salesforce_cdp', 'marketing_cloud', 'commerce_cloud',
            // Adobe-specific
            'adobe_analytics', 'aep_cdp', 'aep_identity'
        ],
        templates: ['b2b_saas_preferred', 'account_based_marketing'],
        defaultCopy: {
            heroTitle: 'B2B SaaS Marketing Data Foundation',
            heroSubtitle: 'See how your data stack connects from product events to pipeline'
        }
    },

    // Adobe Summit Profile
    adobe_summit: {
        id: 'adobe_summit',
        name: 'Adobe Summit',
        description: 'Adobe Experience Cloud powered MDF',
        brandColor: '#ff0000', // Adobe Red
        emphasizedNodes: [
            'web_app_events', 'marketo', 'ad_platforms',
            's3_raw', 'snowflake', 'dbt_core',
            'consent_manager', 'data_quality',
            'attribution_model', 'mmm_model',
            'hightouch', 'meta_ads', 'email_sms'
        ],
        hiddenNodes: [
            // GCP-specific
            'pubsub', 'gcs_raw', 'bigquery', 'dataflow',
            // AWS-specific (some)
            'kinesis', 'kinesis_firehose', 'glue',
            // Salesforce-specific
            'salesforce_cdp', 'hubspot_crm', 'marketing_cloud'
        ],
        templates: ['adobe_experience_platform', 'multi_channel_attribution'],
        defaultCopy: {
            heroTitle: 'Adobe Experience Cloud Foundation',
            heroSubtitle: 'Unified customer experiences powered by first-party data'
        }
    },

    // Google Cloud Profile
    google_cloud: {
        id: 'google_cloud',
        name: 'Google Cloud',
        description: 'BigQuery + Looker + GCP native stack',
        brandColor: '#4285f4', // Google Blue
        emphasizedNodes: [
            'web_app_events', 'product_events', 'salesforce_crm',
            'segment', 'amplitude',
            'pubsub', 'gcs_raw', 'bigquery',
            'dbt_core', 'dbt_cloud',
            'contact_stitching', 'clearbit',
            'consent_manager', 'data_quality',
            'looker', 'attribution_model',
            'census', 'google_ads', 'linkedin_ads'
        ],
        hiddenNodes: [
            // AWS-specific
            'kinesis', 'kinesis_firehose', 's3_raw', 'glue', 'redshift', 'neptune_graph',
            // Azure-specific
            'event_hubs', 'azure_blob', 'synapse'
        ],
        templates: ['gcp_analytics', 'bigquery_ml'],
        defaultCopy: {
            heroTitle: 'Google Cloud Data Foundation',
            heroSubtitle: 'Serverless analytics with BigQuery and Looker'
        }
    },

    // Salesforce Profile
    salesforce: {
        id: 'salesforce',
        name: 'Salesforce',
        description: 'Salesforce CDP + Data Cloud stack',
        brandColor: '#00a1e0', // Salesforce Blue
        emphasizedNodes: [
            'salesforce_crm', 'hubspot_crm', 'support_tickets', 'marketo',
            'fivetran', 'airbyte',
            'snowflake', 'dbt_core',
            'contact_stitching', 'sixsense', 'zoominfo',
            'consent_manager', 'data_quality',
            'tableau', 'opportunity_influence',
            'hightouch', 'salesforce_crm_dest', 'outreach', 'salesloft'
        ],
        hiddenNodes: [
            // AWS-specific
            'kinesis', 'kinesis_firehose', 'neptune_graph',
            // GCP-specific
            'pubsub', 'gcs_raw', 'bigquery', 'dataflow'
        ],
        templates: ['salesforce_data_cloud', 'sales_ops'],
        defaultCopy: {
            heroTitle: 'Salesforce Data Foundation',
            heroSubtitle: 'Connect your CRM to a modern data stack'
        }
    },

    // Generic Profile (all nodes available)
    generic: {
        id: 'generic',
        name: 'Generic',
        description: 'All components available',
        emphasizedNodes: [],
        hiddenNodes: [],
        templates: ['b2b_saas_preferred', 'warehouse_first', 'real_time_streaming'],
        defaultCopy: {
            heroTitle: 'Marketing Data Foundation Simulator',
            heroSubtitle: 'Design your ideal data architecture'
        }
    }
}

// =============================================================
// Helper Functions
// =============================================================

/**
 * Check if a node is visible for a given profile
 */
export function isNodeVisibleInProfile(nodeId: string, profile: DemoProfile): boolean {
    const config = demoProfiles[profile]
    if (!config) return true

    // Generic shows everything
    if (profile === 'generic') return true

    // Check if explicitly hidden
    if (config.hiddenNodes.includes(nodeId)) return false

    // Check if node is available for this profile (from catalog)
    const catalogNode = nodeCatalog.find(n => n.id === nodeId)
    if (!catalogNode) return false

    return catalogNode.vendorProfileAvailability.includes(profile)
}

/**
 * Check if a node is emphasized for a given profile
 */
export function isNodeEmphasizedInProfile(nodeId: string, profile: DemoProfile): boolean {
    const config = demoProfiles[profile]
    if (!config) return false
    return config.emphasizedNodes.includes(nodeId)
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
