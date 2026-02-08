// Demo Profiles - B2B SaaS Optimized
// Configured for proper preferred stack and profile-based filtering

import { DemoProfile, DemoProfileConfig } from '@/types'
import { nodeCatalog } from './node-catalog'

// =============================================================
// Profile Options (for dropdowns)
// =============================================================

export const profileOptions: Array<{ id: DemoProfile; name: string; description: string; category?: string }> = [
    // Vendor Suites
    { id: 'snowflake_composable', name: 'Snowflake Composable', description: 'Warehouse-first with Hightouch & dbt', category: 'Vendor Suite' },
    { id: 'databricks_lakehouse', name: 'Databricks Lakehouse', description: 'Medallion architecture with Delta Lake', category: 'Vendor Suite' },
    { id: 'gcp_bigquery', name: 'Google Cloud Platform', description: 'BigQuery-first analytics', category: 'Vendor Suite' },
    { id: 'microsoft_fabric', name: 'Microsoft Fabric', description: 'OneLake + Synapse + Power BI', category: 'Vendor Suite' },
    { id: 'salesforce_data_cloud', name: 'Salesforce Data Cloud', description: 'CRM-centric Customer 360', category: 'Vendor Suite' },
    { id: 'adobe_aep', name: 'Adobe Experience Platform', description: 'Real-time CDP + Journey Optimizer', category: 'Vendor Suite' },
    { id: 'segment_composable', name: 'Segment Composable', description: 'CDP-first collection & identity', category: 'Vendor Suite' },
    { id: 'mparticle_composable', name: 'mParticle Composable', description: 'Mobile-first identity & data sync', category: 'Vendor Suite' },

    // Marketing Ecosystems
    { id: 'marketo_centric', name: 'Marketo B2B', description: 'Demand gen focus', category: 'Marketing Ecosystem' },
    { id: 'hubspot_centric', name: 'HubSpot Growth', description: 'All-in-one CRM & Marketing', category: 'Marketing Ecosystem' },
    { id: 'braze_centric', name: 'Braze Lifecycle', description: 'Product-led engagement', category: 'Marketing Ecosystem' },
    { id: 'sfmc_centric', name: 'SF Marketing Cloud', description: 'Enterprise email & journeys', category: 'Marketing Ecosystem' },
    { id: 'abm_intent_centric', name: 'ABM / 6sense', description: 'Intent-driven targeting', category: 'Marketing Ecosystem' },
    { id: 'sales_activation_centric', name: 'Sales Activation', description: 'Outreach/Salesloft focus', category: 'Marketing Ecosystem' },
    { id: 'plg_activation_centric', name: 'PLG / Intercom', description: 'In-app & conversational', category: 'Marketing Ecosystem' },
    { id: 'customerio_centric', name: 'Customer.io', description: 'Developer-friendly messaging', category: 'Marketing Ecosystem' },
    { id: 'clean_room_layer', name: 'Clean Room Layer', description: 'Data collaboration', category: 'Marketing Ecosystem' },

    // Fallback/Legacy
    { id: 'generic', name: 'Generic / Custom', description: 'All components available', category: 'General' }
]

// =============================================================
// Profile Configurations
// =============================================================

export const demoProfiles: Record<DemoProfile, DemoProfileConfig> = {

    // ===================================
    // ADOBE EXPERIENCE PLATFORM
    // ===================================
    adobe_aep: {
        id: 'adobe_aep',
        name: 'Adobe Experience Cloud (AEP-first)',
        description: 'Real-time CDP and Journey Optimizer for enterprise.',
        brandColor: '#FF0000',
        identityStrategy: 'AEP Identity Service + Real-Time Customer Profile',
        governanceRailNodes: ['aep_data_governance', 'consent_manager', 'privacy_service'],
        defaultDestinations: ['adobe_aep', 'journey_optimizer', 'adobe_target', 'marketo', 'ad_platforms'],
        emphasizedNodes: ['adobe_web_sdk', 'aep_sources', 'aep_data_lake', 'aep_identity_service', 'rtcdp_profile', 'customer_journey_analytics', 'adobe_analytics', 'journey_optimizer', 'adobe_target', 'marketo'],
        hiddenNodes: ['salesforce_crm', 'hubspot_crm'],
        templates: ['adobe_experience_cloud'],
        template: {
            nodes: ['adobe_web_sdk', 'aep_sources', 'aep_data_lake', 'aep_identity_service', 'rtcdp_profile', 'customer_journey_analytics', 'adobe_analytics', 'journey_optimizer', 'adobe_target', 'marketo'],
            edges: [
                ['adobe_web_sdk', 'aep_sources'],
                ['aep_sources', 'aep_data_lake'],
                ['aep_data_lake', 'aep_identity_service'],
                ['aep_identity_service', 'rtcdp_profile'],
                ['rtcdp_profile', 'customer_journey_analytics'],
                ['rtcdp_profile', 'journey_optimizer'],
                ['rtcdp_profile', 'adobe_target'] // Added edge for Target
            ]
        },
        defaultCopy: {
            heroTitle: 'Adobe Experience Platform',
            heroSubtitle: 'Real-time personalization at scale'
        }
    },

    // ===================================
    // SALESFORCE DATA CLOUD
    // ===================================
    salesforce_data_cloud: {
        id: 'salesforce_data_cloud',
        name: 'Salesforce Data Cloud (CRM-first)',
        description: 'CRM-centric stack with Data Cloud as the identity engine.',
        brandColor: '#00A1E0',
        identityStrategy: 'Salesforce Data Cloud unified profiles',
        governanceRailNodes: ['salesforce_shield', 'consent_manager'],
        defaultDestinations: ['journey_builder', 'salesforce_crm_dest', 'ad_platforms'],
        emphasizedNodes: ['salesforce_crm', 'marketing_cloud', 'salesforce_cdp_connector', 'salesforce_data_cloud', 'salesforce_data_cloud_identity', 'tableau', 'journey_builder'],
        hiddenNodes: ['hubspot_crm', 'marketo'],
        templates: ['salesforce_data_cloud_b2b'],
        template: {
            nodes: ['salesforce_crm', 'marketing_cloud', 'salesforce_cdp_connector', 'salesforce_data_cloud', 'salesforce_data_cloud_identity', 'tableau', 'journey_builder'],
            edges: [
                ['salesforce_crm', 'salesforce_cdp_connector'],
                ['salesforce_cdp_connector', 'salesforce_data_cloud'],
                ['salesforce_data_cloud', 'salesforce_data_cloud_identity'],
                ['salesforce_data_cloud_identity', 'tableau'],
                ['salesforce_data_cloud_identity', 'journey_builder']
            ]
        },
        defaultCopy: {
            heroTitle: 'Salesforce Data Cloud',
            heroSubtitle: 'Connect customer data across Customer 360'
        }
    },

    // ===================================
    // SNOWFLAKE COMPOSABLE
    // ===================================
    snowflake_composable: {
        id: 'snowflake_composable',
        name: 'Snowflake Warehouse-first (Composable)',
        description: 'Warehouse-first architecture with Snowflake, dbt, and Hightouch.',
        brandColor: '#29B5E8',
        identityStrategy: 'Warehouse identity tables + optional graph',
        governanceRailNodes: ['snowflake_horizon', 'consent_manager', 'data_quality'],
        defaultDestinations: ['hightouch', 'linkedin_ads', 'marketo', 'salesforce_crm_dest'],
        emphasizedNodes: ['salesforce_crm', 'segment', 'fivetran', 's3_raw', 'snowflake', 'dbt_core', 'metrics_layer', 'account_graph', 'hightouch', 'linkedin_ads'],
        hiddenNodes: ['databricks_sql', 'bigquery'],
        templates: ['snowflake_composable_b2b'],
        template: {
            nodes: ['salesforce_crm', 'segment', 'fivetran', 's3_raw', 'snowflake', 'dbt_core', 'metrics_layer', 'account_graph', 'hightouch', 'linkedin_ads'],
            edges: [
                ['segment', 's3_raw'],
                ['fivetran', 's3_raw'],
                ['s3_raw', 'snowflake'],
                ['snowflake', 'dbt_core'],
                ['dbt_core', 'metrics_layer'],
                ['dbt_core', 'account_graph'],
                ['account_graph', 'hightouch'],
                ['hightouch', 'linkedin_ads']
            ]
        },
        defaultCopy: {
            heroTitle: 'Snowflake Composable MDF',
            heroSubtitle: 'The modern data stack standard for B2B SaaS'
        }
    },

    // ===================================
    // DATABRICKS LAKEHOUSE
    // ===================================
    databricks_lakehouse: {
        id: 'databricks_lakehouse',
        name: 'Databricks Lakehouse (Medallion)',
        description: 'Medallion architecture with Delta Lake and Unity Catalog.',
        brandColor: '#FF3621',
        identityStrategy: 'Lakehouse identity tables + optional graph',
        governanceRailNodes: ['unity_catalog_governance', 'consent_manager', 'data_quality'],
        defaultDestinations: ['hightouch', 'linkedin_ads', 'marketo'],
        emphasizedNodes: ['kafka', 'delta_lake_bronze', 'delta_lake_silver', 'delta_lake_gold', 'dbt_core', 'unity_catalog_identity', 'metrics_layer', 'hightouch', 'linkedin_ads'],
        hiddenNodes: ['snowflake', 'bigquery', 'redshift'],
        templates: ['databricks_medallion'],
        template: {
            nodes: ['kafka', 'delta_lake_bronze', 'delta_lake_silver', 'delta_lake_gold', 'dbt_core', 'unity_catalog_identity', 'metrics_layer', 'hightouch', 'linkedin_ads'],
            edges: [
                ['kafka', 'delta_lake_bronze'],
                ['delta_lake_bronze', 'delta_lake_silver'],
                ['delta_lake_silver', 'delta_lake_gold'],
                ['delta_lake_gold', 'dbt_core'],
                ['dbt_core', 'unity_catalog_identity'],
                ['dbt_core', 'metrics_layer'], // Assuming dbt feeds metrics
                ['unity_catalog_identity', 'hightouch'],
                ['hightouch', 'linkedin_ads']
            ]
        },
        defaultCopy: {
            heroTitle: 'Databricks Lakehouse',
            heroSubtitle: 'Unified data, analytics, and AI'
        }
    },

    // ===================================
    // GOOGLE CLOUD BIGQUERY
    // ===================================
    gcp_bigquery: {
        id: 'gcp_bigquery',
        name: 'Google Cloud BigQuery-first',
        description: 'Serverless analytics with BigQuery, Looker, and Google Ads.',
        brandColor: '#4285F4',
        identityStrategy: 'BigQuery identity tables',
        governanceRailNodes: ['dataplex', 'consent_manager'], // dataplex as gcp_dlp equivalent
        defaultDestinations: ['hightouch', 'linkedin_ads'],
        emphasizedNodes: ['google_analytics_4', 'pubsub', 'bigquery', 'dbt_core', 'metrics_layer', 'account_graph', 'hightouch', 'linkedin_ads'],
        hiddenNodes: ['snowflake', 'redshift', 's3_raw'],
        templates: ['gcp_analytics'],
        template: {
            nodes: ['google_analytics_4', 'pubsub', 'bigquery', 'dbt_core', 'metrics_layer', 'account_graph', 'hightouch', 'linkedin_ads'],
            edges: [
                ['google_analytics_4', 'pubsub'],
                ['pubsub', 'bigquery'],
                ['bigquery', 'dbt_core'],
                ['dbt_core', 'metrics_layer'],
                ['dbt_core', 'account_graph'],
                ['account_graph', 'hightouch'],
                ['hightouch', 'linkedin_ads']
            ]
        },
        defaultCopy: {
            heroTitle: 'Google Cloud Data Foundation',
            heroSubtitle: 'Scale effortlessly with BigQuery'
        }
    },

    // ===================================
    // MICROSOFT FABRIC
    // ===================================
    microsoft_fabric: {
        id: 'microsoft_fabric',
        name: 'Microsoft Fabric',
        description: 'OneLake, Synapse, and Power BI with Dynamics 365.',
        brandColor: '#0078D4',
        identityStrategy: 'OneLake integrated profiles',
        governanceRailNodes: ['azure_purview', 'consent_manager'],
        defaultDestinations: ['dynamics_365'],
        emphasizedNodes: ['dynamics_365', 'onelake', 'fabric_warehouse', 'synapse_pipelines', 'power_bi_datasets', 'power_bi'],
        hiddenNodes: ['snowflake', 'bigquery'],
        templates: ['microsoft_fabric_analytics'],
        template: {
            nodes: ['dynamics_365', 'synapse_pipelines', 'onelake', 'fabric_warehouse', 'power_bi_datasets', 'power_bi'],
            edges: [
                ['dynamics_365', 'synapse_pipelines'],
                ['synapse_pipelines', 'onelake'],
                ['onelake', 'fabric_warehouse'],
                ['fabric_warehouse', 'power_bi_datasets'],
                ['power_bi_datasets', 'power_bi']
            ]
        },
        defaultCopy: {
            heroTitle: 'Microsoft Fabric',
            heroSubtitle: 'Data in the era of AI'
        }
    },

    // ===================================
    // SEGMENT COMPOSABLE
    // ===================================
    segment_composable: {
        id: 'segment_composable',
        name: 'Segment Composable',
        description: 'Segment for collection & identity, warehouse for storage.',
        brandColor: '#52BD94',
        identityStrategy: 'Segment Unify (Profiles)',
        governanceRailNodes: ['consent_manager'],
        defaultDestinations: ['segment_engage', 'braze'],
        emphasizedNodes: ['segment', 's3_raw', 'snowflake', 'segment_profiles', 'segment_engage'],
        hiddenNodes: [],
        templates: ['segment_composable_b2b'],
        template: {
            nodes: ['segment', 's3_raw', 'snowflake', 'segment_profiles', 'segment_engage'],
            edges: [
                ['segment', 's3_raw'],
                ['s3_raw', 'snowflake'],
                ['snowflake', 'segment_profiles'], // Reverse ETL to Profiles
                ['segment_profiles', 'segment_engage']
            ]
        },
        defaultCopy: {
            heroTitle: 'Segment Composable CDP',
            heroSubtitle: 'Good data in, great experiences out'
        }
    },

    // ===================================
    // MPARTICLE COMPOSABLE
    // ===================================
    mparticle_composable: {
        id: 'mparticle_composable',
        name: 'mParticle Composable',
        description: 'Mobile-first identity resolution and syncing.',
        brandColor: '#0052CC',
        identityStrategy: 'mParticle IDSync',
        governanceRailNodes: ['consent_manager'],
        defaultDestinations: ['mparticle_audiences', 'braze'],
        emphasizedNodes: ['mparticle', 'mparticle_identity', 'snowflake', 'mparticle_audiences'],
        hiddenNodes: [],
        templates: ['mparticle_composable_b2b'],
        template: {
            nodes: ['mparticle', 'mparticle_identity', 'snowflake', 'mparticle_audiences'],
            edges: [
                ['mparticle', 'mparticle_identity'],
                ['mparticle', 'snowflake'],
                ['mparticle_identity', 'mparticle_audiences']
            ]
        },
        defaultCopy: {
            heroTitle: 'mParticle CDP',
            heroSubtitle: 'Solve the data chaos'
        }
    },

    // ===================================
    // CLEAN ROOM LAYER
    // ===================================
    clean_room_layer: {
        id: 'clean_room_layer',
        name: 'Clean Room Augmented',
        description: 'Privacy-first collaboration layer.',
        brandColor: '#6366F1',
        identityStrategy: 'RampID / Warehouse ID',
        governanceRailNodes: ['consent_manager'],
        defaultDestinations: ['liveramp', 'the_trade_desk'],
        emphasizedNodes: ['snowflake', 'snowflake_clean_rooms', 'liveramp', 'measurement_aggregates'],
        hiddenNodes: [],
        templates: ['clean_room_collaboration'],
        template: {
            nodes: ['snowflake', 'snowflake_clean_rooms', 'liveramp', 'measurement_aggregates'],
            edges: [
                ['snowflake', 'snowflake_clean_rooms'],
                ['snowflake', 'liveramp'],
                ['snowflake_clean_rooms', 'measurement_aggregates']
            ]
        },
        defaultCopy: {
            heroTitle: 'Data Collaboration',
            heroSubtitle: 'Collaborate without moving data'
        }
    },

    // =====================================
    // ECOSYSTEM PROFILES (MARKETING FOCUS)
    // =====================================

    marketo_centric: {
        id: 'marketo_centric',
        name: 'Marketo B2B',
        description: 'Marketo for demand gen with warehouse enrichment.',
        brandColor: '#5C4E8B',
        identityStrategy: 'Lead-based (Marketo ID)',
        emphasizedNodes: ['marketo', 'salesforce_crm', 'snowflake', 'hightouch'],
        hiddenNodes: ['hubspot_crm'],
        templates: ['marketo_demand_gen'],
        defaultCopy: { heroTitle: 'Marketo Demand Gen', heroSubtitle: 'Advanced automation' }
    },

    hubspot_centric: {
        id: 'hubspot_centric',
        name: 'HubSpot Growth',
        description: 'All-in-one stack for SMB to mid-market.',
        brandColor: '#FF7A59',
        identityStrategy: 'Contact-based (HubSpot ID)',
        emphasizedNodes: ['hubspot_crm', 'hubspot_tracking', 'hubspot_companies'],
        hiddenNodes: ['salesforce_crm'],
        templates: ['hubspot_growth_stack'],
        defaultCopy: { heroTitle: 'HubSpot Growth', heroSubtitle: 'Grow better' }
    },

    braze_centric: {
        id: 'braze_centric',
        name: 'Braze Lifecycle',
        description: 'Product-led growth with Braze.',
        brandColor: '#FF6B35',
        identityStrategy: 'User-based (External ID)',
        emphasizedNodes: ['braze', 'segment', 'snowflake'],
        hiddenNodes: [],
        templates: ['braze_product_led'],
        defaultCopy: { heroTitle: 'Braze Engagement', heroSubtitle: 'Human connections' }
    },

    sfmc_centric: {
        id: 'sfmc_centric',
        name: 'Salesforce Marketing Cloud',
        description: 'Enterprise lifecycle marketing.',
        brandColor: '#00A1E0',
        identityStrategy: 'Subscriber Key',
        emphasizedNodes: ['marketing_cloud', 'salesforce_crm'],
        hiddenNodes: [],
        templates: ['sfmc_enterprise'],
        defaultCopy: { heroTitle: 'Marketing Cloud', heroSubtitle: 'Personalize every moment' }
    },

    abm_intent_centric: {
        id: 'abm_intent_centric',
        name: 'ABM / 6sense',
        description: 'Intent-driven architecture.',
        brandColor: '#00D4AA',
        identityStrategy: 'Account-based',
        emphasizedNodes: ['sixsense', 'salesforce_crm', 'linkedin_ads'],
        hiddenNodes: [],
        templates: ['abm_full_funnel'],
        defaultCopy: { heroTitle: 'Account-Based Experience', heroSubtitle: 'Capture demand early' }
    },

    sales_activation_centric: {
        id: 'sales_activation_centric',
        name: 'Sales Activation',
        description: 'Sales engagement focus.',
        brandColor: '#5951FF',
        identityStrategy: 'Lead/Contact-based',
        emphasizedNodes: ['outreach', 'salesloft', 'salesforce_crm'],
        hiddenNodes: [],
        templates: ['sales_led_b2b'],
        defaultCopy: { heroTitle: 'Sales Activation', heroSubtitle: 'Automate sales plays' }
    },

    plg_activation_centric: {
        id: 'plg_activation_centric',
        name: 'PLG / Intercom',
        description: 'Product-led and conversational.',
        brandColor: '#1F8FFF',
        identityStrategy: 'User-based',
        emphasizedNodes: ['intercom', 'segment', 'pendo'],
        hiddenNodes: [],
        templates: ['product_led_growth'],
        defaultCopy: { heroTitle: 'Product-Led Growth', heroSubtitle: 'Turn users into advocates' }
    },

    customerio_centric: {
        id: 'customerio_centric',
        name: 'Customer.io',
        description: 'Developer-focused messaging.',
        brandColor: '#FFAC00',
        identityStrategy: 'User-based',
        emphasizedNodes: ['customerio', 'segment'],
        hiddenNodes: [],
        templates: ['customerio_dev_tool'],
        defaultCopy: { heroTitle: 'Automated Messaging', heroSubtitle: 'Data-driven messages' }
    },

    // =====================================
    // LEGACY / FALLBACK
    // =====================================

    preferred_stack: {
        id: 'preferred_stack',
        name: 'Preferred Stack (migrating...)',
        description: 'Please use Snowflake Composable profile.',
        brandColor: '#94a3b8',
        emphasizedNodes: [],
        hiddenNodes: [],
        templates: ['snowflake_composable_b2b'],
        defaultCopy: { heroTitle: 'Migrating...', heroSubtitle: 'Use Snowflake Composable' }
    },
    adobe_summit: {
        id: 'adobe_summit',
        name: 'Legacy Adobe (migrating...)',
        description: 'Please use Adobe Experience Platform profile.',
        brandColor: '#94a3b8',
        emphasizedNodes: [],
        hiddenNodes: [],
        templates: ['adobe_experience_cloud'],
        defaultCopy: { heroTitle: 'Migrating...', heroSubtitle: 'Use Adobe Experience Platform' }
    },
    google_cloud: {
        id: 'google_cloud',
        name: 'Legacy GCP (migrating...)',
        description: 'Please use Google Cloud BigQuery profile.',
        brandColor: '#94a3b8',
        emphasizedNodes: [],
        hiddenNodes: [],
        templates: ['gcp_analytics'],
        defaultCopy: { heroTitle: 'Migrating...', heroSubtitle: 'Use Google Cloud BigQuery' }
    },
    salesforce: {
        id: 'salesforce',
        name: 'Legacy Salesforce (migrating...)',
        description: 'Please use Salesforce Data Cloud profile.',
        brandColor: '#94a3b8',
        emphasizedNodes: [],
        hiddenNodes: [],
        templates: ['salesforce_data_cloud_b2b'],
        defaultCopy: { heroTitle: 'Migrating...', heroSubtitle: 'Use Salesforce Data Cloud' }
    },

    generic: {
        id: 'generic',
        name: 'Generic',
        description: 'All components available',
        brandColor: '#64748b',
        emphasizedNodes: [],
        hiddenNodes: [],
        templates: ['snowflake_composable_b2b'],
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
    if (!config) return false
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
