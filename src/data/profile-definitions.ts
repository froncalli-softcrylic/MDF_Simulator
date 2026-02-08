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

    // 1. Adobe Experience Platform
    adobe_aep: {
        profileId: 'adobe_aep',
        displayName: 'Adobe Experience Platform',
        description: 'Complete Adobe Experience Cloud stack with AEP, RTCDP, CJA, Journey Optimizer, Target, and Marketo',
        brandColor: '#FF0000',
        category: 'vendor_suite',

        requiredNodes: [
            // Collection Layer
            'adobe_web_sdk', 'adobe_analytics',
            // Ingestion Layer
            'aep_sources',
            // Storage Layer
            'aep_data_lake',
            // Identity Hub
            'aep_identity_service', 'rtcdp_profile',
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
            // Ingestion to Storage
            { source: 'aep_sources', target: 'aep_data_lake' },
            // Storage to Identity
            { source: 'aep_data_lake', target: 'aep_identity_service' },
            { source: 'aep_identity_service', target: 'rtcdp_profile' },
            // Identity to Analytics
            { source: 'rtcdp_profile', target: 'customer_journey_analytics' },
            // Identity to Activation
            { source: 'rtcdp_profile', target: 'rtcdp_activation' },
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
        identityHubNodes: ['aep_identity_service', 'rtcdp_profile'],
        identityStrategy: 'platform_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'adobe_experience_cloud',
        alternativeTemplateIds: []
    },

    // 2. Salesforce Data Cloud
    salesforce_data_cloud: {
        profileId: 'salesforce_data_cloud',
        displayName: 'Salesforce Data Cloud',
        description: 'Complete Salesforce ecosystem with CRM, Data Cloud, Marketing Cloud, and Einstein AI',
        brandColor: '#00A1E0',
        category: 'vendor_suite',

        requiredNodes: [
            // Sources
            'salesforce_crm', 'marketing_cloud', 'commerce_cloud',
            // Ingestion
            'salesforce_cdp_connector', 'mulesoft',
            // Storage
            'salesforce_data_cloud',
            // Identity Hub
            'salesforce_data_cloud_identity',
            // Analytics
            'tableau',
            // Destinations
            'journey_builder', 'slack_alerts'
        ],
        recommendedNodes: [
            'product_events', 'web_app_events', 'billing_system'
        ],
        optionalNodes: ['snowflake', 'facebook_ads', 'linkedin_ads'],
        hiddenNodes: ['hubspot_crm', 'marketo', 'segment'],

        requiredEdges: [
            // Sources to Ingestion
            { source: 'salesforce_crm', target: 'salesforce_cdp_connector' },
            { source: 'marketing_cloud', target: 'salesforce_cdp_connector' },
            { source: 'commerce_cloud', target: 'salesforce_cdp_connector' },
            { source: 'mulesoft', target: 'salesforce_cdp_connector' },
            // Ingestion to Storage
            { source: 'salesforce_cdp_connector', target: 'salesforce_data_cloud' },
            // Storage to Identity
            { source: 'salesforce_data_cloud', target: 'salesforce_data_cloud_identity' },
            // Identity to Analytics
            { source: 'salesforce_data_cloud_identity', target: 'tableau' },
            // Identity to Destinations
            { source: 'salesforce_data_cloud_identity', target: 'journey_builder' },
            { source: 'salesforce_data_cloud_identity', target: 'slack_alerts' }
        ],
        recommendedEdges: [
            { source: 'product_events', target: 'mulesoft' },
            { source: 'web_app_events', target: 'mulesoft' },
            { source: 'billing_system', target: 'mulesoft' },
            { source: 'journey_builder', target: 'facebook_ads' },
            { source: 'journey_builder', target: 'linkedin_ads' }
        ],

        governanceRailNodes: ['salesforce_shield', 'consent_manager'],
        identityHubNodes: ['salesforce_data_cloud_identity'],
        identityStrategy: 'platform_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'salesforce_data_cloud_b2b',
        alternativeTemplateIds: []
    },

    // 3. Snowflake Composable
    snowflake_composable: {
        profileId: 'snowflake_composable',
        displayName: 'Snowflake Composable',
        description: 'Warehouse-first B2B foundation with Snowflake, dbt, and Hightouch',
        brandColor: '#29B5E8',
        category: 'vendor_suite',

        requiredNodes: [
            'product_events', 'salesforce_crm', 'segment', 'fivetran',
            's3_raw', 'snowflake', 'dbt_core',
            'account_resolution', 'hightouch'
        ],
        recommendedNodes: [
            'looker', 'salesforce_crm_dest', 'linkedin_ads', 'neptune_graph'
        ],
        optionalNodes: ['azure_event_grid', 'kafka'],
        hiddenNodes: ['bigquery', 'databricks_lakehouse'],

        requiredEdges: [
            { source: 'product_events', target: 'segment' },
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'segment', target: 's3_raw' },
            { source: 's3_raw', target: 'snowflake' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'account_resolution' },
            { source: 'account_resolution', target: 'hightouch' }
        ],
        recommendedEdges: [
            { source: 'dbt_core', target: 'looker' },
            { source: 'hightouch', target: 'salesforce_crm_dest' },
            { source: 'hightouch', target: 'linkedin_ads' },
            { source: 'dbt_core', target: 'neptune_graph' },
            { source: 'neptune_graph', target: 'account_resolution' }
        ],

        governanceRailNodes: ['consent_manager', 'data_quality'],
        identityHubNodes: ['account_resolution', 'neptune_graph'],
        identityStrategy: 'warehouse_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'snowflake_composable_b2b',
        alternativeTemplateIds: ['preferred_stack']
    },

    // 4. Databricks Lakehouse
    databricks_lakehouse: {
        profileId: 'databricks_lakehouse',
        displayName: 'Databricks Lakehouse',
        description: 'Lakehouse architecture with Bronze/Silver/Gold layers',
        brandColor: '#FF3621',
        category: 'vendor_suite',

        requiredNodes: [
            'product_events', 'kafka', 'spark_streaming',
            'delta_lake_bronze', 'databricks_sql',
            'unity_catalog_identity'
        ],
        recommendedNodes: [
            'dbt_core', 'tableau', 'hightouch', 'delta_lake_silver', 'delta_lake_gold'
        ],
        optionalNodes: ['aws_glue', 'fivetran'],
        hiddenNodes: ['snowflake', 'bigquery'],

        requiredEdges: [
            { source: 'product_events', target: 'kafka' },
            { source: 'kafka', target: 'spark_streaming' },
            { source: 'spark_streaming', target: 'delta_lake_bronze' },
            { source: 'delta_lake_bronze', target: 'databricks_sql' },
            { source: 'databricks_sql', target: 'unity_catalog_identity' }
        ],
        recommendedEdges: [
            { source: 'delta_lake_bronze', target: 'delta_lake_silver' },
            { source: 'delta_lake_silver', target: 'delta_lake_gold' },
            { source: 'delta_lake_gold', target: 'databricks_sql' },
            { source: 'databricks_sql', target: 'dbt_core' },
            { source: 'unity_catalog_identity', target: 'hightouch' },
            { source: 'databricks_sql', target: 'tableau' }
        ],

        governanceRailNodes: ['unity_catalog_governance'],
        identityHubNodes: ['unity_catalog_identity'],
        identityStrategy: 'warehouse_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'databricks_medallion',
        alternativeTemplateIds: []
    },

    // 5. GCP BigQuery
    gcp_bigquery: {
        profileId: 'gcp_bigquery',
        displayName: 'Google Cloud Platform',
        description: 'BigQuery + Looker + Google ecosystem',
        brandColor: '#4285F4',
        category: 'vendor_suite',

        requiredNodes: [
            'google_analytics_4', 'pubsub', 'dataflow',
            'bigquery', 'dataform', 'looker'
        ],
        recommendedNodes: [
            'gtm', 'gcs_raw', 'census', 'google_ads'
        ],
        optionalNodes: ['segment', 'fivetran'],
        hiddenNodes: ['snowflake', 'redshift'],

        requiredEdges: [
            { source: 'google_analytics_4', target: 'pubsub' },
            { source: 'pubsub', target: 'dataflow' },
            { source: 'dataflow', target: 'bigquery' },
            { source: 'bigquery', target: 'dataform' },
            { source: 'dataform', target: 'looker' }
        ],
        recommendedEdges: [
            { source: 'gtm', target: 'pubsub' },
            { source: 'dataflow', target: 'gcs_raw' },
            { source: 'gcs_raw', target: 'bigquery' },
            { source: 'dataform', target: 'census' },
            { source: 'census', target: 'google_ads' }
        ],

        governanceRailNodes: ['dataplex', 'data_catalog'],
        identityHubNodes: ['bigquery'], // Often simplified in GCP
        identityStrategy: 'warehouse_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'gcp_analytics',
        alternativeTemplateIds: ['google_cloud']
    },

    // 6. Microsoft Fabric
    microsoft_fabric: {
        profileId: 'microsoft_fabric',
        displayName: 'Microsoft Fabric',
        description: 'Unified analytics with OneLake and Power BI',
        brandColor: '#0078D4',
        category: 'vendor_suite',

        requiredNodes: [
            'dynamics_365', 'onelake', 'fabric_warehouse',
            'power_bi_datasets', 'power_bi'
        ],
        recommendedNodes: [
            'adls_gen2', 'synapse_pipelines', 'azure_event_grid'
        ],
        optionalNodes: ['databricks_lakehouse'],
        hiddenNodes: ['aws_glue', 'gcs_raw'],

        requiredEdges: [
            { source: 'onelake', target: 'fabric_warehouse' },
            { source: 'fabric_warehouse', target: 'power_bi_datasets' },
            { source: 'power_bi_datasets', target: 'power_bi' }
        ],
        recommendedEdges: [
            { source: 'dynamics_365', target: 'adls_gen2' },
            { source: 'adls_gen2', target: 'fabric_warehouse' }
        ],

        governanceRailNodes: ['azure_purview'],
        identityHubNodes: ['fabric_warehouse'],
        identityStrategy: 'warehouse_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'microsoft_fabric_analytics',
        alternativeTemplateIds: []
    },

    // 7. Segment Composable (CDP-First)
    segment_composable: {
        profileId: 'segment_composable',
        displayName: 'Segment Composable',
        description: 'Segment for collection & identity, warehouse for storage',
        brandColor: '#52BD94',
        category: 'vendor_suite',

        requiredNodes: [
            'product_events', 'segment', 's3_raw', 'snowflake',
            'segment_profiles', 'segment_engage'
        ],
        recommendedNodes: [
            'braze', 'hightouch'
        ],
        optionalNodes: ['mixpanel', 'amplitude'],
        hiddenNodes: ['mparticle_identity'],

        requiredEdges: [
            { source: 'product_events', target: 'segment' },
            { source: 'segment', target: 's3_raw' },
            { source: 'segment', target: 'segment_profiles' },
            { source: 'segment_profiles', target: 'segment_engage' },
            { source: 's3_raw', target: 'snowflake' }
        ],
        recommendedEdges: [
            { source: 'segment_engage', target: 'braze' },
            { source: 'snowflake', target: 'hightouch' }
        ],

        governanceRailNodes: ['consent_manager'],
        identityHubNodes: ['segment_profiles'],
        identityStrategy: 'cdp_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'segment_composable_b2b',
        alternativeTemplateIds: []
    },

    // 8. mParticle Composable
    mparticle_composable: {
        profileId: 'mparticle_composable',
        displayName: 'mParticle Composable',
        description: 'Mobile-first identity resolution and syncing',
        brandColor: '#0052CC',
        category: 'vendor_suite',

        requiredNodes: [
            'product_events', 'mparticle', 'mparticle_identity',
            'mparticle_audiences', 'snowflake'
        ],
        recommendedNodes: [
            'facebook_ads', 'braze'
        ],
        optionalNodes: ['appsflyer'],
        hiddenNodes: ['segment'],

        requiredEdges: [
            { source: 'product_events', target: 'mparticle' },
            { source: 'mparticle', target: 'mparticle_identity' },
            { source: 'mparticle_identity', target: 'mparticle_audiences' },
            { source: 'mparticle', target: 'snowflake' }
        ],
        recommendedEdges: [
            { source: 'mparticle_audiences', target: 'facebook_ads' },
            { source: 'mparticle_audiences', target: 'braze' }
        ],

        governanceRailNodes: ['consent_manager'],
        identityHubNodes: ['mparticle_identity'],
        identityStrategy: 'cdp_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'mparticle_composable_b2b',
        alternativeTemplateIds: []
    },

    // 9. Clean Room Layer
    clean_room_layer: {
        profileId: 'clean_room_layer',
        displayName: 'Clean Room Augmented',
        description: 'Privacy-safe collaboration layer',
        brandColor: '#6366F1',
        category: 'vendor_suite',

        requiredNodes: [
            'snowflake', 'aws_clean_rooms', 'liveramp', 'measurement_aggregates'
        ],
        recommendedNodes: [
            'facebook_ads', 'the_trade_desk'
        ],
        optionalNodes: ['snowflake_clean_rooms'],
        hiddenNodes: [],

        requiredEdges: [
            { source: 'snowflake', target: 'aws_clean_rooms' },
            { source: 'aws_clean_rooms', target: 'measurement_aggregates' }
        ],
        recommendedEdges: [
            { source: 'snowflake', target: 'liveramp' },
            { source: 'liveramp', target: 'facebook_ads' },
            { source: 'aws_clean_rooms', target: 'the_trade_desk' }
        ],

        governanceRailNodes: ['data_quality'],
        identityHubNodes: ['liveramp'],
        identityStrategy: 'warehouse_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'clean_room_collaboration',
        alternativeTemplateIds: []
    },

    // -------------------------------------------------------------
    // MARKETING ECOSYSTEM PROFILES
    // -------------------------------------------------------------

    // 10. Marketo B2B
    marketo_centric: {
        profileId: 'marketo_centric',
        displayName: 'Marketo B2B',
        description: 'Marketo for demand gen with warehouse enrichment',
        brandColor: '#5C4E8B',
        category: 'marketing_ecosystem',

        requiredNodes: [
            'marketo', 'salesforce_crm', 'fivetran', 'snowflake',
            'hightouch', 'marketo_sync'
        ],
        recommendedNodes: [
            'neptune_graph', 'linkedin_ads'
        ],
        optionalNodes: ['bizible'],
        hiddenNodes: ['hubspot_crm'],

        requiredEdges: [
            { source: 'marketo', target: 'salesforce_crm' },
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 'snowflake', target: 'hightouch' },
            { source: 'hightouch', target: 'marketo_sync' }
        ],
        recommendedEdges: [],

        governanceRailNodes: ['consent_manager'],
        identityHubNodes: ['snowflake'],
        identityStrategy: 'warehouse_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'marketo_demand_gen',
        alternativeTemplateIds: []
    },

    // 11. HubSpot Growth
    hubspot_centric: {
        profileId: 'hubspot_centric',
        displayName: 'HubSpot All-in-One',
        description: 'Unified stack for SMB to mid-market',
        brandColor: '#FF7A59',
        category: 'marketing_ecosystem',

        requiredNodes: [
            'hubspot_tracking', 'hubspot_crm', 'hubspot_companies'
        ],
        recommendedNodes: [
            'linkedin_ads', 'salesforce_crm' // Integrations often used
        ],
        optionalNodes: ['snowflake', 'hightouch'], // Upmarket motion
        hiddenNodes: ['marketo'],

        requiredEdges: [
            { source: 'hubspot_tracking', target: 'hubspot_crm' },
            { source: 'hubspot_crm', target: 'hubspot_companies' }
        ],
        recommendedEdges: [
            { source: 'hubspot_companies', target: 'linkedin_ads' }
        ],

        governanceRailNodes: ['consent_manager'],
        identityHubNodes: ['hubspot_companies'],
        identityStrategy: 'platform_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'hubspot_growth_stack',
        alternativeTemplateIds: []
    },

    // 12. Braze Lifecycle
    braze_centric: {
        profileId: 'braze_centric',
        displayName: 'Braze PLG',
        description: 'Product-led growth with Braze and Amplitude',
        brandColor: '#FF6B35',
        category: 'marketing_ecosystem',

        requiredNodes: [
            'product_events', 'segment', 'braze', 'amplitude'
        ],
        recommendedNodes: [
            'snowflake', 'hightouch'
        ],
        optionalNodes: ['mixpanel'],
        hiddenNodes: ['marketo'],

        requiredEdges: [
            { source: 'product_events', target: 'segment' },
            { source: 'segment', target: 'braze' },
            { source: 'segment', target: 'amplitude' }
        ],
        recommendedEdges: [
            { source: 'segment', target: 'snowflake' },
            { source: 'snowflake', target: 'hightouch' },
            { source: 'hightouch', target: 'braze' }
        ],

        governanceRailNodes: ['consent_manager'],
        identityHubNodes: ['segment_profiles', 'braze'],
        identityStrategy: 'cdp_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'braze_product_led',
        alternativeTemplateIds: []
    },

    // 13. ABM / 6sense (Intent)
    abm_intent_centric: {
        profileId: 'abm_intent_centric',
        displayName: 'ABM & Intent',
        description: '6sense and LinkedIn for high-value targeting',
        brandColor: '#00D4AA',
        category: 'marketing_ecosystem',

        requiredNodes: [
            'sixsense', 'salesforce_crm', 'sixsense_orchestration', 'linkedin_ads'
        ],
        recommendedNodes: [
            'neptune_graph', 'hightouch'
        ],
        optionalNodes: ['zoominfo', 'bombora'],
        hiddenNodes: [],

        requiredEdges: [
            { source: 'sixsense', target: 'salesforce_crm' },
            { source: 'sixsense', target: 'sixsense_orchestration' },
            { source: 'sixsense_orchestration', target: 'linkedin_ads' }
        ],
        recommendedEdges: [
            { source: 'salesforce_crm', target: 'neptune_graph' }
        ],

        governanceRailNodes: ['consent_manager'],
        identityHubNodes: ['neptune_graph', 'sixsense'],
        identityStrategy: 'intent_enriched',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'abm_full_funnel',
        alternativeTemplateIds: []
    },

    // -------------------
    // Placeholders for remaining profiles (structure enforced)
    // -------------------
    sfmc_centric: {
        profileId: 'sfmc_centric',
        displayName: 'Salesforce Marketing Cloud',
        description: 'Enterprise lifecycle marketing',
        brandColor: '#00A1E0',
        category: 'marketing_ecosystem',
        requiredNodes: ['marketing_cloud', 'salesforce_crm', 'salesforce_data_cloud_identity'],
        recommendedNodes: [],
        optionalNodes: [],
        hiddenNodes: [],
        requiredEdges: [{ source: 'salesforce_crm', target: 'marketing_cloud' }],
        recommendedEdges: [],
        governanceRailNodes: [],
        identityHubNodes: [],
        identityStrategy: 'platform_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'salesforce_data_cloud_b2b',
        alternativeTemplateIds: []
    },

    sales_activation_centric: {
        profileId: 'sales_activation_centric',
        displayName: 'Sales Activation',
        description: 'Sales engagement focus',
        brandColor: '#5951FF',
        category: 'marketing_ecosystem',
        requiredNodes: ['salesforce_crm', 'outreach', 'salesloft'],
        recommendedNodes: [],
        optionalNodes: [],
        hiddenNodes: [],
        requiredEdges: [],
        recommendedEdges: [],
        governanceRailNodes: [],
        identityHubNodes: [],
        identityStrategy: 'warehouse_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'preferred_mdf',
        alternativeTemplateIds: []
    },

    plg_activation_centric: {
        profileId: 'plg_activation_centric',
        displayName: 'PLG Activation',
        description: 'Product-led growth focus',
        brandColor: '#FF6B35',
        category: 'marketing_ecosystem',
        requiredNodes: ['product_events', 'amplitude', 'braze'],
        recommendedNodes: [],
        optionalNodes: [],
        hiddenNodes: [],
        requiredEdges: [],
        recommendedEdges: [],
        governanceRailNodes: [],
        identityHubNodes: [],
        identityStrategy: 'cdp_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'braze_product_led',
        alternativeTemplateIds: []
    },

    customerio_centric: {
        profileId: 'customerio_centric',
        displayName: 'Customer.io Activation',
        description: 'Messaging automation focus',
        brandColor: '#6366F1',
        category: 'marketing_ecosystem',
        requiredNodes: ['customerio', 'segment'],
        recommendedNodes: [],
        optionalNodes: [],
        hiddenNodes: [],
        requiredEdges: [],
        recommendedEdges: [],
        governanceRailNodes: [],
        identityHubNodes: [],
        identityStrategy: 'cdp_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'segment_composable_b2b',
        alternativeTemplateIds: []
    },

    // Legacy / General
    preferred_stack: {
        profileId: 'preferred_stack',
        displayName: 'Preferred Stack',
        description: 'B2B SaaS Recommended',
        brandColor: '#06b6d4',
        category: 'general',
        requiredNodes: ['snowflake', 'dbt_core', 'hightouch'],
        recommendedNodes: [],
        optionalNodes: [],
        hiddenNodes: [],
        requiredEdges: [],
        recommendedEdges: [],
        governanceRailNodes: ['consent_manager'],
        identityHubNodes: ['account_resolution'],
        identityStrategy: 'warehouse_native',
        governanceStrategy: 'distributed',
        defaultTemplateId: 'b2b_saas_mdf',
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
    },

    // Mapping legacy IDs to new profiles or themselves
    adobe_summit: {
        profileId: 'adobe_summit',
        displayName: 'Adobe Legacy',
        description: 'Legacy profile',
        brandColor: '#FF0000',
        category: 'general',
        requiredNodes: [],
        recommendedNodes: [],
        optionalNodes: [],
        hiddenNodes: [],
        requiredEdges: [],
        recommendedEdges: [],
        governanceRailNodes: [],
        identityHubNodes: [],
        identityStrategy: 'platform_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'adobe_mdf', // Legacy template
        alternativeTemplateIds: []
    },

    google_cloud: {
        profileId: 'google_cloud',
        displayName: 'Google Cloud Legacy',
        description: 'Legacy profile',
        brandColor: '#4285F4',
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
        defaultTemplateId: 'gcp_analytics',
        alternativeTemplateIds: []
    },

    salesforce: {
        profileId: 'salesforce',
        displayName: 'Salesforce Legacy',
        description: 'Legacy profile',
        brandColor: '#00A1E0',
        category: 'general',
        requiredNodes: [],
        recommendedNodes: [],
        optionalNodes: [],
        hiddenNodes: [],
        requiredEdges: [],
        recommendedEdges: [],
        governanceRailNodes: [],
        identityHubNodes: [],
        identityStrategy: 'platform_native',
        governanceStrategy: 'centralized',
        defaultTemplateId: 'salesforce_data_cloud_b2b',
        alternativeTemplateIds: []
    }
}
