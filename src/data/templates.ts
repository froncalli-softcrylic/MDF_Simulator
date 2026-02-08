// Templates Configuration
// Pre-built diagram templates for quick starts

import { Template, DemoProfile } from '@/types'

export const templates: Template[] = [
    // ========================================================================
    // VENDOR SUITE TEMPLATES
    // ========================================================================
    {
        id: 'snowflake_composable_b2b',
        name: 'Snowflake Composable',
        description: 'Warehouse-first B2B foundation with Snowflake, dbt, and Hightouch.',
        industry: 'B2B SaaS',
        profiles: ['snowflake_composable', 'preferred_stack', 'generic'],
        nodes: [
            { catalogId: 'product_events', position: { x: 0, y: 100 } },
            { catalogId: 'salesforce_crm', position: { x: 0, y: 220 } },
            { catalogId: 'billing_system', position: { x: 0, y: 340 } },
            { catalogId: 'segment', position: { x: 260, y: 160 } },
            { catalogId: 'fivetran', position: { x: 380, y: 280 } },
            { catalogId: 's3_raw', position: { x: 520, y: 160 } },
            { catalogId: 'snowflake', position: { x: 700, y: 220 } },
            { catalogId: 'dbt_core', position: { x: 900, y: 220 } },
            { catalogId: 'account_resolution', position: { x: 1100, y: 300 } },
            { catalogId: 'looker', position: { x: 1100, y: 100 } },
            { catalogId: 'hightouch', position: { x: 1300, y: 250 } },
            { catalogId: 'salesforce_crm_dest', position: { x: 1500, y: 150 } },
            { catalogId: 'linkedin_ads', position: { x: 1500, y: 300 } },
            { catalogId: 'slack_alerts', position: { x: 1500, y: 450 } },
            { catalogId: 'consent_manager', position: { x: 260, y: 40 } },
            { catalogId: 'data_quality', position: { x: 700, y: 40 } }
        ],
        edges: [
            { source: 'product_events', target: 'segment' },
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'billing_system', target: 'fivetran' },
            { source: 'segment', target: 's3_raw' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 's3_raw', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'account_resolution' },
            { source: 'dbt_core', target: 'looker' },
            { source: 'account_resolution', target: 'hightouch' },
            { source: 'hightouch', target: 'salesforce_crm_dest' },
            { source: 'hightouch', target: 'linkedin_ads' },
            { source: 'hightouch', target: 'slack_alerts' },
            { source: 'consent_manager', target: 'segment' },
            { source: 'consent_manager', target: 'hightouch' }
        ]
    },
    {
        id: 'databricks_medallion',
        name: 'Databricks Medallion',
        description: 'Lakehouse architecture with Bronze/Silver/Gold layers.',
        industry: 'General',
        profiles: ['databricks_lakehouse', 'generic'],
        nodes: [
            { catalogId: 'product_events', position: { x: 0, y: 100 } },
            { catalogId: 'kafka', position: { x: 200, y: 100 } },
            { catalogId: 'spark_streaming', position: { x: 400, y: 100 } },
            { catalogId: 'delta_lake_bronze', position: { x: 600, y: 100 } },
            { catalogId: 'databricks_sql', position: { x: 800, y: 100 } },
            { catalogId: 'unity_catalog_identity', position: { x: 800, y: 300 } },
            { catalogId: 'unity_catalog_governance', position: { x: 600, y: 0 } },
            { catalogId: 'dbt_core', position: { x: 1000, y: 200 } },
            { catalogId: 'tableau', position: { x: 1200, y: 100 } },
            { catalogId: 'hightouch', position: { x: 1200, y: 300 } }
        ],
        edges: [
            { source: 'product_events', target: 'kafka' },
            { source: 'kafka', target: 'spark_streaming' },
            { source: 'spark_streaming', target: 'delta_lake_bronze' },
            { source: 'delta_lake_bronze', target: 'databricks_sql' },
            { source: 'databricks_sql', target: 'dbt_core' },
            { source: 'dbt_core', target: 'unity_catalog_identity' },
            { source: 'databricks_sql', target: 'tableau' },
            { source: 'unity_catalog_identity', target: 'hightouch' },
            { source: 'unity_catalog_governance', target: 'delta_lake_bronze' }
        ]
    },
    {
        id: 'gcp_analytics',
        name: 'GCP Modern Data Stack',
        description: 'BigQuery + Looker + Google ecosystem integration.',
        industry: 'General',
        profiles: ['gcp_bigquery', 'google_cloud', 'generic'],
        nodes: [
            { catalogId: 'google_analytics_4', position: { x: 0, y: 100 } },
            { catalogId: 'pubsub', position: { x: 200, y: 100 } },
            { catalogId: 'dataflow', position: { x: 400, y: 100 } },
            { catalogId: 'bigquery', position: { x: 600, y: 200 } },
            { catalogId: 'dataform', position: { x: 800, y: 200 } },
            { catalogId: 'dataplex', position: { x: 600, y: 50 } },
            { catalogId: 'looker', position: { x: 1000, y: 100 } },
            { catalogId: 'google_ads', position: { x: 1000, y: 300 } }
        ],
        edges: [
            { source: 'google_analytics_4', target: 'pubsub' },
            { source: 'pubsub', target: 'dataflow' },
            { source: 'dataflow', target: 'bigquery' },
            { source: 'bigquery', target: 'dataform' },
            { source: 'dataform', target: 'looker' },
            { source: 'dataplex', target: 'bigquery' }
        ]
    },
    {
        id: 'microsoft_fabric_analytics',
        name: 'Fabric Analytics',
        description: 'Unified analytics with Map/OneLake/PowerBI.',
        industry: 'Enterprise',
        profiles: ['microsoft_fabric', 'generic'],
        nodes: [
            { catalogId: 'dynamics_365', position: { x: 0, y: 150 } },
            { catalogId: 'adls_gen2', position: { x: 300, y: 150 } },
            { catalogId: 'fabric_warehouse', position: { x: 500, y: 150 } },
            { catalogId: 'power_bi_datasets', position: { x: 700, y: 150 } },
            { catalogId: 'power_bi', position: { x: 900, y: 150 } },
            { catalogId: 'azure_purview', position: { x: 500, y: 0 } }
        ],
        edges: [
            { source: 'dynamics_365', target: 'adls_gen2' },
            { source: 'adls_gen2', target: 'fabric_warehouse' },
            { source: 'fabric_warehouse', target: 'power_bi_datasets' },
            { source: 'power_bi_datasets', target: 'power_bi' },
            { source: 'azure_purview', target: 'fabric_warehouse' }
        ]
    },
    {
        id: 'salesforce_data_cloud_b2b',
        name: 'Salesforce Data Cloud',
        description: 'Complete Salesforce Customer 360 foundation.',
        industry: 'B2B',
        profiles: ['salesforce_data_cloud', 'salesforce', 'generic'],
        nodes: [
            { catalogId: 'salesforce_crm', position: { x: 0, y: 100 } },
            { catalogId: 'marketing_cloud', position: { x: 0, y: 250 } },
            { catalogId: 'salesforce_cdp_connector', position: { x: 300, y: 175 } },
            { catalogId: 'salesforce_data_cloud_identity', position: { x: 600, y: 175 } },
            { catalogId: 'tableau', position: { x: 900, y: 100 } },
            { catalogId: 'marketing_cloud', position: { x: 900, y: 250 } } // Often feeds back
        ],
        edges: [
            { source: 'salesforce_crm', target: 'salesforce_cdp_connector' },
            { source: 'marketing_cloud', target: 'salesforce_cdp_connector' },
            { source: 'salesforce_cdp_connector', target: 'salesforce_data_cloud_identity' },
            { source: 'salesforce_data_cloud_identity', target: 'tableau' }
        ]
    },
    {
        id: 'adobe_experience_cloud',
        name: 'Adobe Experience Platform',
        description: 'End-to-end Adobe stack for enterprise.',
        industry: 'Enterprise',
        profiles: ['adobe_aep', 'adobe_summit', 'generic'],
        nodes: [
            { catalogId: 'adobe_web_sdk', position: { x: 0, y: 100 } },
            { catalogId: 'marketo', position: { x: 0, y: 250 } },
            { catalogId: 'aep_sources', position: { x: 300, y: 175 } },
            { catalogId: 'aep_data_lake', position: { x: 500, y: 175 } },
            { catalogId: 'aep_identity_service', position: { x: 700, y: 175 } },
            { catalogId: 'journey_optimizer', position: { x: 900, y: 250 } },
            { catalogId: 'rtcdp_activation', position: { x: 900, y: 100 } },
            { catalogId: 'email_sms', position: { x: 1100, y: 250 } }
        ],
        edges: [
            { source: 'adobe_web_sdk', target: 'aep_sources' },
            { source: 'marketo', target: 'aep_sources' },
            { source: 'aep_sources', target: 'aep_data_lake' },
            { source: 'aep_data_lake', target: 'aep_identity_service' },
            { source: 'aep_identity_service', target: 'journey_optimizer' },
            { source: 'aep_identity_service', target: 'rtcdp_activation' },
            { source: 'journey_optimizer', target: 'email_sms' }
        ]
    },
    {
        id: 'segment_composable_b2b',
        name: 'Segment Composable',
        description: 'Hybrid approach using Segment + Warehouse.',
        industry: 'B2B/B2C',
        profiles: ['segment_composable', 'generic'],
        nodes: [
            { catalogId: 'product_events', position: { x: 0, y: 100 } },
            { catalogId: 'segment', position: { x: 300, y: 100 } },
            { catalogId: 's3_raw', position: { x: 500, y: 100 } },
            { catalogId: 'snowflake', position: { x: 700, y: 100 } },
            { catalogId: 'segment_profiles', position: { x: 700, y: 300 } },
            { catalogId: 'segment_engage', position: { x: 900, y: 300 } },
            { catalogId: 'braze', position: { x: 1100, y: 300 } },
            { catalogId: 'hightouch', position: { x: 900, y: 100 } } // Warehouse activation
        ],
        edges: [
            { source: 'product_events', target: 'segment' },
            { source: 'segment', target: 's3_raw' },
            { source: 'segment', target: 'segment_profiles' },
            { source: 's3_raw', target: 'snowflake' },
            { source: 'segment_profiles', target: 'segment_engage' },
            { source: 'segment_engage', target: 'braze' },
            { source: 'snowflake', target: 'hightouch' }
        ]
    },
    {
        id: 'mparticle_composable_b2b',
        name: 'mParticle Composable',
        description: 'Mobile-heavy stack with mParticle and Warehouse.',
        industry: 'Mobile',
        profiles: ['mparticle_composable', 'generic'],
        nodes: [
            { catalogId: 'product_events', position: { x: 0, y: 100 } },
            { catalogId: 'mparticle', position: { x: 300, y: 100 } },
            { catalogId: 'mparticle_identity', position: { x: 500, y: 100 } },
            { catalogId: 'snowflake', position: { x: 500, y: 250 } },
            { catalogId: 'mparticle_audiences', position: { x: 700, y: 100 } },
            { catalogId: 'facebook_ads', position: { x: 900, y: 100 } }
        ],
        edges: [
            { source: 'product_events', target: 'mparticle' },
            { source: 'mparticle', target: 'mparticle_identity' },
            { source: 'mparticle', target: 'snowflake' },
            { source: 'mparticle_identity', target: 'mparticle_audiences' },
            { source: 'mparticle_audiences', target: 'facebook_ads' }
        ]
    },

    // ========================================================================
    // MARKETING ECOSYSTEM TEMPLATES
    // ========================================================================
    {
        id: 'marketo_demand_gen',
        name: 'Marketo Demand Engine',
        description: 'Classic B2B stack centered on Marketo and Salesforce.',
        industry: 'B2B',
        profiles: ['marketo_centric', 'generic'],
        nodes: [
            { catalogId: 'marketo', position: { x: 0, y: 100 } },
            { catalogId: 'salesforce_crm', position: { x: 200, y: 250 } },
            { catalogId: 'fivetran', position: { x: 400, y: 250 } },
            { catalogId: 'snowflake', position: { x: 600, y: 250 } },
            { catalogId: 'hightouch', position: { x: 800, y: 250 } },
            { catalogId: 'marketo_sync', position: { x: 1000, y: 100 } }
        ],
        edges: [
            { source: 'marketo', target: 'salesforce_crm' },
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 'snowflake', target: 'hightouch' },
            { source: 'hightouch', target: 'marketo_sync' }
        ]
    },
    {
        id: 'hubspot_growth_stack',
        name: 'HubSpot All-in-One',
        description: 'HubSpot-centric stack for growth stage cos.',
        industry: 'Growth B2B',
        profiles: ['hubspot_centric', 'generic'],
        nodes: [
            { catalogId: 'hubspot_tracking', position: { x: 0, y: 100 } },
            { catalogId: 'hubspot_crm', position: { x: 300, y: 100 } },
            { catalogId: 'hubspot_companies', position: { x: 500, y: 100 } },
            { catalogId: 'linkedin_ads', position: { x: 700, y: 100 } }
        ],
        edges: [
            { source: 'hubspot_tracking', target: 'hubspot_crm' },
            { source: 'hubspot_crm', target: 'hubspot_companies' },
            { source: 'hubspot_companies', target: 'linkedin_ads' }
        ]
    },
    {
        id: 'braze_product_led',
        name: 'Braze PLG Stack',
        description: 'Mobile/Web engagement with Braze and Amplitude.',
        industry: 'B2C / PLG',
        profiles: ['braze_centric', 'generic'],
        nodes: [
            { catalogId: 'product_events', position: { x: 0, y: 100 } },
            { catalogId: 'segment', position: { x: 250, y: 100 } },
            { catalogId: 'braze', position: { x: 500, y: 100 } },
            { catalogId: 'amplitude', position: { x: 500, y: 250 } }
        ],
        edges: [
            { source: 'product_events', target: 'segment' },
            { source: 'segment', target: 'braze' },
            { source: 'segment', target: 'amplitude' }
        ]
    },
    {
        id: 'abm_full_funnel',
        name: 'ABM Intent Stack',
        description: '6sense and LinkedIn for high-value account targeting.',
        industry: 'B2B Enterprise',
        profiles: ['abm_intent_centric', 'generic'],
        nodes: [
            { catalogId: 'sixsense', position: { x: 0, y: 100 } },
            { catalogId: 'salesforce_crm', position: { x: 200, y: 250 } },
            { catalogId: 'sixsense_orchestration', position: { x: 500, y: 100 } },
            { catalogId: 'linkedin_ads', position: { x: 800, y: 100 } }
        ],
        edges: [
            { source: 'sixsense', target: 'salesforce_crm' },
            { source: 'sixsense', target: 'sixsense_orchestration' },
            { source: 'sixsense_orchestration', target: 'linkedin_ads' }
        ]
    },
    {
        id: 'clean_room_collaboration',
        name: 'Clean Room Collab',
        description: 'Secure data sharing pattern.',
        industry: 'Retail media / Partners',
        profiles: ['clean_room_layer', 'generic'],
        nodes: [
            { catalogId: 'snowflake', position: { x: 0, y: 100 } },
            { catalogId: 'aws_clean_rooms', position: { x: 300, y: 100 } },
            { catalogId: 'liveramp', position: { x: 300, y: 250 } },
            { catalogId: 'facebook_ads', position: { x: 600, y: 250 } }
        ],
        edges: [
            { source: 'snowflake', target: 'aws_clean_rooms' },
            { source: 'snowflake', target: 'liveramp' },
            { source: 'liveramp', target: 'facebook_ads' }
        ]
    },
    // ========================================================================
    // SCENARIO TEMPLATES (B2C, PLG, Enterprise)
    // ========================================================================
    {
        id: 'b2c_ecommerce_personalization',
        name: 'B2C E-Commerce Personalization',
        description: 'Customer data platform with real-time personalization and multi-channel activation.',
        industry: 'Retail / E-Commerce',
        profiles: ['segment_composable', 'generic'],
        nodes: [
            { catalogId: 'web_app_events', position: { x: 0, y: 100 } },
            { catalogId: 'product_events', position: { x: 0, y: 250 } },
            { catalogId: 'segment', position: { x: 260, y: 175 } },
            { catalogId: 's3_raw', position: { x: 500, y: 100 } },
            { catalogId: 'snowflake', position: { x: 700, y: 175 } },
            { catalogId: 'dbt_core', position: { x: 900, y: 175 } },
            { catalogId: 'segment_profiles', position: { x: 900, y: 350 } },
            { catalogId: 'hightouch', position: { x: 1100, y: 175 } },
            { catalogId: 'braze', position: { x: 1300, y: 100 } },
            { catalogId: 'facebook_ads', position: { x: 1300, y: 250 } },
            { catalogId: 'google_ads', position: { x: 1300, y: 400 } },
            { catalogId: 'consent_manager', position: { x: 260, y: 0 } }
        ],
        edges: [
            { source: 'web_app_events', target: 'segment' },
            { source: 'product_events', target: 'segment' },
            { source: 'segment', target: 's3_raw' },
            { source: 'segment', target: 'segment_profiles' },
            { source: 's3_raw', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'hightouch' },
            { source: 'hightouch', target: 'braze' },
            { source: 'hightouch', target: 'facebook_ads' },
            { source: 'hightouch', target: 'google_ads' },
            { source: 'consent_manager', target: 'segment' },
            { source: 'consent_manager', target: 'hightouch' }
        ]
    },
    {
        id: 'plg_warehouse_activation',
        name: 'PLG Warehouse Activation',
        description: 'Product-led growth with warehouse-backed activation for trials, PQLs, and expansion.',
        industry: 'SaaS / PLG',
        profiles: ['snowflake_composable', 'generic'],
        nodes: [
            { catalogId: 'product_events', position: { x: 0, y: 100 } },
            { catalogId: 'billing_system', position: { x: 0, y: 250 } },
            { catalogId: 'segment', position: { x: 260, y: 100 } },
            { catalogId: 'fivetran', position: { x: 260, y: 250 } },
            { catalogId: 's3_raw', position: { x: 500, y: 175 } },
            { catalogId: 'snowflake', position: { x: 700, y: 175 } },
            { catalogId: 'dbt_core', position: { x: 900, y: 175 } },
            { catalogId: 'looker', position: { x: 1100, y: 50 } },
            { catalogId: 'hightouch', position: { x: 1100, y: 175 } },
            { catalogId: 'salesforce_crm_dest', position: { x: 1300, y: 100 } },
            { catalogId: 'slack_alerts', position: { x: 1300, y: 250 } },
            { catalogId: 'data_quality', position: { x: 700, y: 0 } }
        ],
        edges: [
            { source: 'product_events', target: 'segment' },
            { source: 'billing_system', target: 'fivetran' },
            { source: 'segment', target: 's3_raw' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 's3_raw', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'looker' },
            { source: 'dbt_core', target: 'hightouch' },
            { source: 'hightouch', target: 'salesforce_crm_dest' },
            { source: 'hightouch', target: 'slack_alerts' }
        ]
    },
    // Keep 'blank' for utility
    {
        id: 'blank',
        name: 'Blank Canvas',
        description: 'Start from scratch and build your own custom MDF architecture.',
        profiles: ['generic', 'snowflake_composable', 'databricks_lakehouse'], // Available everywhere
        nodes: [],
        edges: []
    }
]

export function getTemplateById(id: string): Template | undefined {
    return templates.find(t => t.id === id)
}

export function getTemplatesForProfile(profileId: string): Template[] {
    return templates.filter(t => t.profiles.includes(profileId as DemoProfile))
}
