// MDF Node Catalog - B2B SaaS Optimized
// Comprehensive catalog with proper categories, typed ports, and B2B-specific nodes

import { CatalogNode, NodeCategory, DemoProfile, PortType } from '@/types'

// ============================================
// Category Metadata for UI Display
// ============================================

export const categoryMeta: Record<NodeCategory, {
    label: string;
    icon: string;
    description: string;
    isRail?: boolean;
    color?: string;
}> = {
    // Pipeline categories
    source: {
        label: 'Data Sources',
        icon: 'database',
        description: 'Origins of business data (CRM, product, billing)'
    },
    collection: {
        label: 'Collection & Instrumentation',
        icon: 'radio',
        description: 'SDKs, event tracking, and data capture'
    },
    ingestion: {
        label: 'Ingestion & Transport',
        icon: 'download',
        description: 'Streaming and batch data pipelines'
    },
    storage_raw: {
        label: 'Raw Storage (Lake)',
        icon: 'hard-drive',
        description: 'Immutable raw data lake'
    },
    storage_warehouse: {
        label: 'Data Warehouse',
        icon: 'server',
        description: 'Structured analytical data store'
    },
    transform: {
        label: 'Transform & Modeling',
        icon: 'layers',
        description: 'dbt transformations and data modeling'
    },
    analytics: {
        label: 'Analytics & Measurement',
        icon: 'bar-chart-2',
        description: 'BI, attribution, and measurement'
    },
    activation: {
        label: 'Activation & Orchestration',
        icon: 'send',
        description: 'Reverse ETL and audience activation'
    },
    destination: {
        label: 'Destinations',
        icon: 'external-link',
        description: 'Ad platforms, CRM, and engagement tools'
    },

    // Rail categories
    governance_rail: {
        label: 'Governance, Security & Privacy',
        icon: 'shield',
        description: 'Cross-cutting: consent, access, encryption, audit',
        isRail: true,
        color: '#f59e0b' // Amber
    },
    account_graph: {
        label: 'Account & Enterprise Graph',
        icon: 'git-merge',
        description: 'B2B identity: Account ↔ Contact ↔ Opportunity',
        isRail: true,
        color: '#10b981' // Emerald
    }
}

// All profiles for convenience
const ALL_PROFILES: DemoProfile[] = ['preferred_stack', 'adobe_summit', 'google_cloud', 'salesforce', 'generic']

// ============================================
// NODE CATALOG - B2B SaaS
// ============================================

export const nodeCatalog: CatalogNode[] = [
    // ==========================================================
    // SOURCES - B2B SaaS Data Origins
    // ==========================================================

    // Product & Behavioral
    {
        id: 'product_events',
        name: 'Product Usage Events',
        category: 'source',
        icon: 'activity',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'User actions within your product (clicks, features used, sessions).',
        whyItMatters: [
            'Understand product engagement and adoption',
            'Identify power users and at-risk accounts',
            'Foundation for product-led growth signals'
        ],
        inputs: [],
        outputs: [{ id: 'events_out', name: 'Event Stream', type: 'raw_events' }],
        prerequisites: [],
        enables: ['measurement', 'identity', 'account_intelligence'],
        recommendedNext: ['segment', 'rudderstack', 'amplitude'],
        b2bSpecific: true,
        preferredStackNode: true
    },
    {
        id: 'web_app_events',
        name: 'Web/App Events',
        category: 'source',
        icon: 'globe',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Clickstream and behavioral events from marketing site and apps.',
        whyItMatters: [
            'Capture visitor intent signals',
            'Track conversion funnels',
            'Enable retargeting'
        ],
        inputs: [],
        outputs: [{ id: 'events_out', name: 'Event Stream', type: 'raw_events' }],
        prerequisites: [],
        enables: ['measurement', 'identity'],
        recommendedNext: ['segment', 'google_analytics']
    },

    // CRM & Sales
    {
        id: 'salesforce_crm',
        name: 'Salesforce CRM',
        category: 'source',
        icon: 'cloud',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Accounts, Contacts, Leads, Opportunities, Activities from Salesforce.',
        whyItMatters: [
            'Core B2B identity: accounts and contacts',
            'Pipeline and revenue data',
            'Sales activity for attribution'
        ],
        inputs: [],
        outputs: [
            { id: 'records_out', name: 'CRM Records', type: 'raw_records' },
            { id: 'identity_out', name: 'Identity Keys', type: 'identity_keys' }
        ],
        prerequisites: [],
        enables: ['identity', 'activation', 'account_intelligence'],
        recommendedNext: ['fivetran', 'hightouch'],
        b2bSpecific: true,
        preferredStackNode: true
    },
    {
        id: 'hubspot_crm',
        name: 'HubSpot CRM',
        category: 'source',
        icon: 'cloud',
        vendorProfileAvailability: ['generic', 'google_cloud'],
        description: 'Companies, Contacts, Deals from HubSpot.',
        whyItMatters: [
            'SMB-friendly CRM',
            'Integrated marketing + sales data',
            'Easy API access'
        ],
        inputs: [],
        outputs: [
            { id: 'records_out', name: 'CRM Records', type: 'raw_records' },
            { id: 'identity_out', name: 'Identity Keys', type: 'identity_keys' }
        ],
        prerequisites: [],
        enables: ['identity', 'activation'],
        recommendedNext: ['fivetran', 'airbyte'],
        b2bSpecific: true
    },

    // Billing & Revenue
    {
        id: 'billing_system',
        name: 'Billing & Subscription',
        category: 'source',
        icon: 'credit-card',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Subscription, invoice, and payment data (Stripe, Chargebee, etc.).',
        whyItMatters: [
            'Revenue and MRR/ARR metrics',
            'Churn and expansion signals',
            'Account billing hierarchy'
        ],
        inputs: [],
        outputs: [{ id: 'records_out', name: 'Billing Records', type: 'raw_records' }],
        prerequisites: [],
        enables: ['measurement', 'account_intelligence'],
        recommendedNext: ['fivetran', 'snowflake'],
        b2bSpecific: true,
        preferredStackNode: true
    },

    // Support
    {
        id: 'support_tickets',
        name: 'Support Tickets',
        category: 'source',
        icon: 'help-circle',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Customer support tickets (Zendesk, Intercom, Freshdesk).',
        whyItMatters: [
            'Customer health signals',
            'Churn risk indicators',
            'Product feedback loop'
        ],
        inputs: [],
        outputs: [{ id: 'records_out', name: 'Ticket Records', type: 'raw_records' }],
        prerequisites: [],
        enables: ['account_intelligence'],
        recommendedNext: ['fivetran', 'snowflake'],
        b2bSpecific: true
    },

    // Marketing
    {
        id: 'marketo',
        name: 'Marketo',
        category: 'source',
        icon: 'mail',
        vendorProfileAvailability: ['adobe_summit', 'preferred_stack', 'generic'],
        description: 'Marketing automation leads, campaigns, and engagement.',
        whyItMatters: [
            'Marketing qualified leads',
            'Campaign performance',
            'Email engagement signals'
        ],
        inputs: [],
        outputs: [{ id: 'records_out', name: 'Marketing Records', type: 'raw_records' }],
        prerequisites: [],
        enables: ['measurement', 'identity'],
        recommendedNext: ['fivetran', 'snowflake']
    },
    {
        id: 'ad_platforms',
        name: 'Ad Platforms',
        category: 'source',
        icon: 'megaphone',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Google Ads, LinkedIn Ads, Meta Ads performance data.',
        whyItMatters: [
            'Campaign spend and ROI',
            'Conversion tracking',
            'Attribution inputs'
        ],
        inputs: [],
        outputs: [{ id: 'records_out', name: 'Ad Records', type: 'raw_records' }],
        prerequisites: [],
        enables: ['measurement'],
        recommendedNext: ['fivetran', 'supermetrics']
    },

    // ==========================================================
    // COLLECTION & INSTRUMENTATION
    // ==========================================================

    {
        id: 'segment',
        name: 'Segment',
        category: 'collection',
        icon: 'git-branch',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Customer data platform for event collection and routing.',
        whyItMatters: [
            'Single tracking SDK',
            'Real-time event routing',
            'Identity resolution built-in'
        ],
        inputs: [{ id: 'events_in', name: 'Raw Events', type: 'raw_events' }],
        outputs: [
            { id: 'stream_out', name: 'Event Stream', type: 'stream' },
            { id: 'identity_out', name: 'Identity', type: 'identity_keys' }
        ],
        prerequisites: [],
        enables: ['identity', 'activation'],
        recommendedNext: ['kinesis', 's3_raw', 'snowflake'],
        preferredStackNode: true
    },
    {
        id: 'rudderstack',
        name: 'RudderStack',
        category: 'collection',
        icon: 'git-branch',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Open-source customer data platform.',
        whyItMatters: [
            'Warehouse-native CDP',
            'Self-hosted option',
            'Cost-effective at scale'
        ],
        inputs: [{ id: 'events_in', name: 'Raw Events', type: 'raw_events' }],
        outputs: [{ id: 'stream_out', name: 'Event Stream', type: 'stream' }],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['kinesis', 's3_raw']
    },
    {
        id: 'amplitude',
        name: 'Amplitude',
        category: 'collection',
        icon: 'trending-up',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Product analytics with behavioral tracking.',
        whyItMatters: [
            'Product analytics built-in',
            'Cohort analysis',
            'Self-serve insights'
        ],
        inputs: [{ id: 'events_in', name: 'Raw Events', type: 'raw_events' }],
        outputs: [{ id: 'records_out', name: 'Event Records', type: 'raw_records' }],
        prerequisites: [],
        enables: ['measurement'],
        recommendedNext: ['snowflake', 'bigquery']
    },
    {
        id: 'snowplow',
        name: 'Snowplow',
        category: 'collection',
        icon: 'radio',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Open-source event pipeline with rich schemas.',
        whyItMatters: [
            'Full data ownership',
            'Rich event schemas',
            'Real-time streaming'
        ],
        inputs: [{ id: 'events_in', name: 'Raw Events', type: 'raw_events' }],
        outputs: [{ id: 'stream_out', name: 'Event Stream', type: 'stream' }],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['kinesis', 's3_raw']
    },

    // ==========================================================
    // INGESTION & TRANSPORT
    // ==========================================================

    // AWS (Preferred)
    {
        id: 'kinesis',
        name: 'AWS Kinesis',
        category: 'ingestion',
        icon: 'zap',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Real-time streaming data ingestion.',
        whyItMatters: [
            'Sub-second latency',
            'Scales automatically',
            'Native AWS integration'
        ],
        inputs: [{ id: 'stream_in', name: 'Event Stream', type: 'stream' }],
        outputs: [{ id: 'stream_out', name: 'Kinesis Stream', type: 'stream' }],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['kinesis_firehose', 's3_raw'],
        preferredStackNode: true
    },
    {
        id: 'kinesis_firehose',
        name: 'Kinesis Firehose',
        category: 'ingestion',
        icon: 'arrow-right',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Batch delivery from Kinesis to S3/Redshift/Snowflake.',
        whyItMatters: [
            'Zero-admin batch loading',
            'Automatic scaling',
            'Built-in transformation'
        ],
        inputs: [{ id: 'stream_in', name: 'Kinesis Stream', type: 'stream' }],
        outputs: [{ id: 'records_out', name: 'Batch Files', type: 'raw_records' }],
        prerequisites: ['kinesis'],
        enables: ['hygiene'],
        recommendedNext: ['s3_raw', 'snowflake'],
        preferredStackNode: true
    },

    // ELT Tools
    {
        id: 'fivetran',
        name: 'Fivetran',
        category: 'ingestion',
        icon: 'refresh-cw',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Managed ELT for SaaS connectors.',
        whyItMatters: [
            '300+ pre-built connectors',
            'Automatic schema handling',
            'Incremental sync'
        ],
        inputs: [{ id: 'records_in', name: 'Source Records', type: 'raw_records' }],
        outputs: [{ id: 'records_out', name: 'Warehouse Tables', type: 'raw_records' }],
        prerequisites: [],
        enables: ['hygiene'],
        recommendedNext: ['snowflake', 'bigquery'],
        preferredStackNode: true
    },
    {
        id: 'airbyte',
        name: 'Airbyte',
        category: 'ingestion',
        icon: 'refresh-cw',
        vendorProfileAvailability: ['generic', 'google_cloud'],
        description: 'Open-source ELT platform.',
        whyItMatters: [
            'Self-hosted option',
            'Extensible connectors',
            'Cost-effective'
        ],
        inputs: [{ id: 'records_in', name: 'Source Records', type: 'raw_records' }],
        outputs: [{ id: 'records_out', name: 'Warehouse Tables', type: 'raw_records' }],
        prerequisites: [],
        enables: ['hygiene'],
        recommendedNext: ['snowflake', 'bigquery']
    },

    // GCP
    {
        id: 'pubsub',
        name: 'Pub/Sub',
        category: 'ingestion',
        icon: 'zap',
        vendorProfileAvailability: ['google_cloud', 'generic'],
        description: 'Google Cloud real-time messaging.',
        whyItMatters: [
            'Global scale',
            'Serverless',
            'Native GCP integration'
        ],
        inputs: [{ id: 'stream_in', name: 'Event Stream', type: 'stream' }],
        outputs: [{ id: 'stream_out', name: 'Pub/Sub Messages', type: 'stream' }],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['dataflow', 'bigquery']
    },

    // ==========================================================
    // RAW STORAGE (LAKE)
    // ==========================================================

    {
        id: 's3_raw',
        name: 'S3 Raw Zone',
        category: 'storage_raw',
        icon: 'hard-drive',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Immutable raw data landing zone in S3.',
        whyItMatters: [
            'Full data history',
            'Replay capability',
            'Cost-effective storage'
        ],
        inputs: [
            { id: 'stream_in', name: 'Stream Data', type: 'stream' },
            { id: 'records_in', name: 'Batch Records', type: 'raw_records' }
        ],
        outputs: [{ id: 'records_out', name: 'Raw Files', type: 'raw_records' }],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: ['glue', 'snowflake'],
        preferredStackNode: true
    },
    {
        id: 'gcs_raw',
        name: 'GCS Raw Zone',
        category: 'storage_raw',
        icon: 'hard-drive',
        vendorProfileAvailability: ['google_cloud', 'generic'],
        description: 'Google Cloud Storage for raw data.',
        whyItMatters: [
            'Native BigQuery integration',
            'Cost-effective',
            'Global availability'
        ],
        inputs: [
            { id: 'stream_in', name: 'Stream Data', type: 'stream' },
            { id: 'records_in', name: 'Batch Records', type: 'raw_records' }
        ],
        outputs: [{ id: 'records_out', name: 'Raw Files', type: 'raw_records' }],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: ['dataflow', 'bigquery']
    },
    {
        id: 'iceberg',
        name: 'Apache Iceberg',
        category: 'storage_raw',
        icon: 'database',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Open table format for large analytic datasets.',
        whyItMatters: [
            'Time travel queries',
            'Schema evolution',
            'Partition evolution'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Records', type: 'raw_records' }],
        outputs: [{ id: 'records_out', name: 'Iceberg Tables', type: 'raw_records' }],
        prerequisites: ['s3_raw'],
        enables: ['governance'],
        recommendedNext: ['snowflake', 'spark']
    },

    // ==========================================================
    // DATA WAREHOUSE
    // ==========================================================

    {
        id: 'snowflake',
        name: 'Snowflake',
        category: 'storage_warehouse',
        icon: 'database',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Cloud data warehouse (preferred).',
        whyItMatters: [
            'Near-zero maintenance',
            'Separation of storage and compute',
            'Data sharing capabilities'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Records', type: 'raw_records' }],
        outputs: [{ id: 'records_out', name: 'Warehouse Tables', type: 'raw_records' }],
        prerequisites: [],
        enables: ['measurement', 'identity', 'governance'],
        recommendedNext: ['dbt_core', 'looker'],
        preferredStackNode: true
    },
    {
        id: 'bigquery',
        name: 'BigQuery',
        category: 'storage_warehouse',
        icon: 'database',
        vendorProfileAvailability: ['google_cloud', 'generic'],
        description: 'Google Cloud serverless data warehouse.',
        whyItMatters: [
            'Serverless',
            'Built-in ML (BQML)',
            'Native GCP integration'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Records', type: 'raw_records' }],
        outputs: [{ id: 'records_out', name: 'Warehouse Tables', type: 'raw_records' }],
        prerequisites: [],
        enables: ['measurement', 'identity'],
        recommendedNext: ['dbt_core', 'looker']
    },
    {
        id: 'redshift',
        name: 'Redshift',
        category: 'storage_warehouse',
        icon: 'database',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'AWS data warehouse.',
        whyItMatters: [
            'AWS native',
            'Mature ecosystem',
            'Serverless option'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Records', type: 'raw_records' }],
        outputs: [{ id: 'records_out', name: 'Warehouse Tables', type: 'raw_records' }],
        prerequisites: [],
        enables: ['measurement'],
        recommendedNext: ['dbt_core']
    },

    // ==========================================================
    // TRANSFORM & MODELING
    // ==========================================================

    {
        id: 'dbt_core',
        name: 'dbt Core',
        category: 'transform',
        icon: 'code',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'SQL-based transformation layer.',
        whyItMatters: [
            'Version-controlled transformations',
            'Modular data models',
            'Built-in testing'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Tables', type: 'raw_records' }],
        outputs: [
            { id: 'entities_out', name: 'Curated Entities', type: 'curated_entities' },
            { id: 'identity_out', name: 'Identity Keys', type: 'identity_keys' }
        ],
        prerequisites: ['snowflake'],
        enables: ['measurement', 'identity', 'activation'],
        recommendedNext: ['neptune_graph', 'hightouch', 'looker'],
        preferredStackNode: true
    },
    {
        id: 'dbt_cloud',
        name: 'dbt Cloud',
        category: 'transform',
        icon: 'cloud',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Managed dbt with scheduling and observability.',
        whyItMatters: [
            'Managed orchestration',
            'Data freshness SLAs',
            'Collaboration features'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Tables', type: 'raw_records' }],
        outputs: [
            { id: 'entities_out', name: 'Curated Entities', type: 'curated_entities' },
            { id: 'identity_out', name: 'Identity Keys', type: 'identity_keys' }
        ],
        prerequisites: ['snowflake'],
        enables: ['measurement', 'identity'],
        recommendedNext: ['neptune_graph', 'hightouch']
    },
    {
        id: 'glue',
        name: 'AWS Glue',
        category: 'transform',
        icon: 'layers',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Serverless ETL and data catalog.',
        whyItMatters: [
            'Serverless Spark',
            'Data catalog',
            'Schema inference'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Files', type: 'raw_records' }],
        outputs: [{ id: 'records_out', name: 'Processed Tables', type: 'raw_records' }],
        prerequisites: ['s3_raw'],
        enables: ['hygiene'],
        recommendedNext: ['snowflake', 'dbt_core']
    },
    {
        id: 'spark',
        name: 'Apache Spark',
        category: 'transform',
        icon: 'zap',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Distributed data processing.',
        whyItMatters: [
            'Large-scale processing',
            'ML pipelines',
            'Streaming transforms'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Data', type: 'raw_records' }],
        outputs: [{ id: 'records_out', name: 'Processed Data', type: 'raw_records' }],
        prerequisites: [],
        enables: ['hygiene'],
        recommendedNext: ['snowflake', 'iceberg']
    },

    // ==========================================================
    // ACCOUNT GRAPH HUB (B2B Identity - Center Rail)
    // ==========================================================

    {
        id: 'neptune_graph',
        name: 'AWS Neptune',
        category: 'account_graph',
        icon: 'git-merge',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Graph database for B2B account relationships.',
        whyItMatters: [
            'Complex relationship queries',
            'Account hierarchy traversal',
            'Multi-hop influence analysis'
        ],
        inputs: [
            { id: 'identity_in', name: 'Identity Keys', type: 'identity_keys' },
            { id: 'entities_in', name: 'Curated Entities', type: 'curated_entities' }
        ],
        outputs: [
            { id: 'graph_out', name: 'Graph Edges', type: 'graph_edges' },
            { id: 'audiences_out', name: 'Account Audiences', type: 'audiences_accounts' }
        ],
        prerequisites: ['dbt_core'],
        enables: ['identity', 'account_intelligence'],
        recommendedNext: ['account_resolution', 'hightouch'],
        isRailNode: true,
        b2bSpecific: true,
        preferredStackNode: true
    },
    {
        id: 'account_resolution',
        name: 'Account Resolution',
        category: 'account_graph',
        icon: 'link',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Domain→Account matching and deduplication.',
        whyItMatters: [
            'Unified account view',
            'Domain-to-account mapping',
            'Merge duplicates'
        ],
        inputs: [
            { id: 'identity_in', name: 'Identity Keys', type: 'identity_keys' },
            { id: 'graph_in', name: 'Graph Data', type: 'graph_edges' }
        ],
        outputs: [
            { id: 'identity_out', name: 'Resolved Accounts', type: 'identity_keys' },
            { id: 'audiences_out', name: 'Account List', type: 'audiences_accounts' }
        ],
        prerequisites: ['neptune_graph'],
        enables: ['identity', 'account_intelligence'],
        recommendedNext: ['hierarchy_modeling', 'hightouch'],
        isRailNode: true,
        b2bSpecific: true
    },
    {
        id: 'hierarchy_modeling',
        name: 'Hierarchy Modeling',
        category: 'account_graph',
        icon: 'git-fork',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Parent-child account hierarchies.',
        whyItMatters: [
            'Enterprise account rollups',
            'Ultimate parent attribution',
            'Family tree targeting'
        ],
        inputs: [{ id: 'graph_in', name: 'Graph Edges', type: 'graph_edges' }],
        outputs: [
            { id: 'graph_out', name: 'Hierarchy Edges', type: 'graph_edges' },
            { id: 'audiences_out', name: 'Hierarchy Accounts', type: 'audiences_accounts' }
        ],
        prerequisites: ['neptune_graph'],
        enables: ['account_intelligence'],
        recommendedNext: ['hightouch', 'looker'],
        isRailNode: true,
        b2bSpecific: true
    },
    {
        id: 'contact_stitching',
        name: 'Contact Stitching',
        category: 'account_graph',
        icon: 'users',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Email/user→Contact identity resolution.',
        whyItMatters: [
            'Deduplicate contacts',
            'Cross-system identity',
            'Person-level graph'
        ],
        inputs: [{ id: 'identity_in', name: 'Identity Keys', type: 'identity_keys' }],
        outputs: [
            { id: 'identity_out', name: 'Resolved Contacts', type: 'identity_keys' },
            { id: 'audiences_out', name: 'Contact List', type: 'audiences_people' }
        ],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['neptune_graph', 'hightouch'],
        isRailNode: true,
        b2bSpecific: true
    },

    // ==========================================================
    // INTENT & ENRICHMENT
    // ==========================================================

    {
        id: 'sixsense',
        name: '6sense',
        category: 'account_graph',
        icon: 'eye',
        vendorProfileAvailability: ['preferred_stack', 'salesforce', 'generic'],
        description: 'Account-level intent data and predictions.',
        whyItMatters: [
            'Identify in-market accounts',
            'Buying stage predictions',
            'ICP scoring'
        ],
        inputs: [{ id: 'accounts_in', name: 'Account IDs', type: 'identity_keys' }],
        outputs: [
            { id: 'audiences_out', name: 'Intent Accounts', type: 'audiences_accounts' },
            { id: 'entities_out', name: 'Intent Signals', type: 'curated_entities' }
        ],
        prerequisites: [],
        enables: ['intent_signals', 'activation'],
        recommendedNext: ['hightouch', 'linkedin_ads'],
        isRailNode: true,
        b2bSpecific: true
    },
    {
        id: 'bombora',
        name: 'Bombora',
        category: 'account_graph',
        icon: 'eye',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Company surge data and topic intent.',
        whyItMatters: [
            'Topic-level intent',
            'Surge scoring',
            'Publisher network data'
        ],
        inputs: [{ id: 'accounts_in', name: 'Account IDs', type: 'identity_keys' }],
        outputs: [{ id: 'audiences_out', name: 'Surge Accounts', type: 'audiences_accounts' }],
        prerequisites: [],
        enables: ['intent_signals'],
        recommendedNext: ['hightouch', 'salesforce_crm_dest'],
        isRailNode: true,
        b2bSpecific: true
    },
    {
        id: 'clearbit',
        name: 'Clearbit',
        category: 'account_graph',
        icon: 'info',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Firmographic and technographic enrichment.',
        whyItMatters: [
            'Company data enrichment',
            'Employee count, industry',
            'Tech stack detection'
        ],
        inputs: [{ id: 'identity_in', name: 'Domain/Email', type: 'identity_keys' }],
        outputs: [{ id: 'entities_out', name: 'Enriched Data', type: 'curated_entities' }],
        prerequisites: [],
        enables: ['enrichment', 'account_intelligence'],
        recommendedNext: ['neptune_graph', 'dbt_core'],
        isRailNode: true,
        b2bSpecific: true
    },
    {
        id: 'zoominfo',
        name: 'ZoomInfo',
        category: 'account_graph',
        icon: 'user-plus',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Contact and company intelligence.',
        whyItMatters: [
            'Contact data enrichment',
            'Direct dials',
            'Org charts'
        ],
        inputs: [{ id: 'identity_in', name: 'Domain/Email', type: 'identity_keys' }],
        outputs: [
            { id: 'entities_out', name: 'Contact Data', type: 'curated_entities' },
            { id: 'audiences_out', name: 'Contact List', type: 'audiences_people' }
        ],
        prerequisites: [],
        enables: ['enrichment'],
        recommendedNext: ['outreach', 'salesforce_crm_dest'],
        isRailNode: true,
        b2bSpecific: true
    },

    // ==========================================================
    // GOVERNANCE RAIL (Top Lane - Cross-Cutting)
    // ==========================================================

    {
        id: 'consent_manager',
        name: 'Consent Manager',
        category: 'governance_rail',
        icon: 'check-square',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'GDPR/CCPA consent collection and storage.',
        whyItMatters: [
            'Legal compliance',
            'Real-time consent checks',
            'Audit trail'
        ],
        inputs: [],
        outputs: [{ id: 'policies_out', name: 'Consent Policies', type: 'governance_policies' }],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: ['segment', 'hightouch'],
        isRailNode: true,
        preferredStackNode: true
    },
    {
        id: 'access_control',
        name: 'Access Control',
        category: 'governance_rail',
        icon: 'lock',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Row/column-level security policies.',
        whyItMatters: [
            'Data security',
            'Role-based access',
            'PII protection'
        ],
        inputs: [],
        outputs: [{ id: 'policies_out', name: 'Access Policies', type: 'governance_policies' }],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: ['snowflake'],
        isRailNode: true,
        preferredStackNode: true
    },
    {
        id: 'encryption_kms',
        name: 'Encryption (KMS)',
        category: 'governance_rail',
        icon: 'key',
        vendorProfileAvailability: ['preferred_stack', 'google_cloud', 'generic'],
        description: 'Data encryption key management.',
        whyItMatters: [
            'Encryption at rest',
            'Key rotation',
            'Compliance requirement'
        ],
        inputs: [],
        outputs: [{ id: 'policies_out', name: 'Encryption Keys', type: 'governance_policies' }],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: ['s3_raw', 'snowflake'],
        isRailNode: true
    },
    {
        id: 'audit_log',
        name: 'Audit Log',
        category: 'governance_rail',
        icon: 'file-text',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Compliance audit trail.',
        whyItMatters: [
            'Who accessed what when',
            'Compliance audits',
            'Security forensics'
        ],
        inputs: [{ id: 'events_in', name: 'Audit Events', type: 'audit_events' }],
        outputs: [],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: [],
        isRailNode: true
    },
    {
        id: 'pii_detection',
        name: 'PII Detection',
        category: 'governance_rail',
        icon: 'alert-triangle',
        vendorProfileAvailability: ['preferred_stack', 'generic'],
        description: 'Sensitive data identification and masking.',
        whyItMatters: [
            'Auto-detect PII',
            'Data masking',
            'GDPR compliance'
        ],
        inputs: [{ id: 'records_in', name: 'Any Records', type: 'raw_records' }],
        outputs: [{ id: 'policies_out', name: 'PII Tags', type: 'governance_policies' }],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: ['access_control'],
        isRailNode: true
    },
    {
        id: 'data_quality',
        name: 'Data Quality',
        category: 'governance_rail',
        icon: 'check-circle',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Automated data validation and anomaly detection.',
        whyItMatters: [
            'Catch issues early',
            'Build trust in data',
            'SLA monitoring'
        ],
        inputs: [{ id: 'records_in', name: 'Data to Validate', type: 'raw_records' }],
        outputs: [{ id: 'metrics_out', name: 'Quality Metrics', type: 'metrics' }],
        prerequisites: [],
        enables: ['governance', 'hygiene'],
        recommendedNext: ['dbt_core', 'looker'],
        isRailNode: true
    },

    // ==========================================================
    // ANALYTICS & MEASUREMENT
    // ==========================================================

    {
        id: 'looker',
        name: 'Looker',
        category: 'analytics',
        icon: 'bar-chart-2',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'BI platform with semantic layer.',
        whyItMatters: [
            'Consistent metrics',
            'Self-serve analytics',
            'Embedded dashboards'
        ],
        inputs: [{ id: 'entities_in', name: 'Curated Data', type: 'curated_entities' }],
        outputs: [{ id: 'metrics_out', name: 'Reports', type: 'metrics' }],
        prerequisites: ['dbt_core'],
        enables: ['measurement'],
        recommendedNext: [],
        preferredStackNode: true
    },
    {
        id: 'tableau',
        name: 'Tableau',
        category: 'analytics',
        icon: 'bar-chart-2',
        vendorProfileAvailability: ['salesforce', 'generic'],
        description: 'Visual analytics platform.',
        whyItMatters: [
            'Best-in-class visualization',
            'Salesforce native',
            'Wide adoption'
        ],
        inputs: [{ id: 'entities_in', name: 'Curated Data', type: 'curated_entities' }],
        outputs: [{ id: 'metrics_out', name: 'Dashboards', type: 'metrics' }],
        prerequisites: [],
        enables: ['measurement'],
        recommendedNext: []
    },
    {
        id: 'metabase',
        name: 'Metabase',
        category: 'analytics',
        icon: 'bar-chart-2',
        vendorProfileAvailability: ['generic'],
        description: 'Open-source BI tool.',
        whyItMatters: [
            'Open-source',
            'Easy setup',
            'Self-hosted option'
        ],
        inputs: [{ id: 'entities_in', name: 'Curated Data', type: 'curated_entities' }],
        outputs: [{ id: 'metrics_out', name: 'Dashboards', type: 'metrics' }],
        prerequisites: [],
        enables: ['measurement'],
        recommendedNext: []
    },
    {
        id: 'attribution_model',
        name: 'Attribution Model',
        category: 'analytics',
        icon: 'trending-up',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Multi-touch attribution for B2B.',
        whyItMatters: [
            'Credit marketing touches',
            'Long sales cycle attribution',
            'Channel optimization'
        ],
        inputs: [{ id: 'entities_in', name: 'Touchpoints', type: 'curated_entities' }],
        outputs: [{ id: 'metrics_out', name: 'Attribution Weights', type: 'metrics' }],
        prerequisites: ['dbt_core'],
        enables: ['measurement'],
        recommendedNext: ['looker'],
        b2bSpecific: true
    },
    {
        id: 'opportunity_influence',
        name: 'Opportunity Influence',
        category: 'analytics',
        icon: 'target',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Campaign→Pipeline influence analysis.',
        whyItMatters: [
            'Long sales cycle measurement',
            'Campaign ROI',
            'Pipeline sourced vs influenced'
        ],
        inputs: [
            { id: 'entities_in', name: 'Opportunities', type: 'curated_entities' },
            { id: 'graph_in', name: 'Touch Graph', type: 'graph_edges' }
        ],
        outputs: [{ id: 'metrics_out', name: 'Influence Metrics', type: 'metrics' }],
        prerequisites: ['dbt_core'],
        enables: ['measurement'],
        recommendedNext: ['looker'],
        b2bSpecific: true,
        preferredStackNode: true
    },
    {
        id: 'mmm_model',
        name: 'MMM Model',
        category: 'analytics',
        icon: 'pie-chart',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Marketing Mix Modeling.',
        whyItMatters: [
            'Channel budget optimization',
            'Incrementality measurement',
            'Privacy-safe'
        ],
        inputs: [{ id: 'entities_in', name: 'Aggregated Spend', type: 'curated_entities' }],
        outputs: [{ id: 'metrics_out', name: 'MMM Outputs', type: 'metrics' }],
        prerequisites: ['dbt_core'],
        enables: ['measurement'],
        recommendedNext: ['looker']
    },
    {
        id: 'churn_model',
        name: 'Churn Prediction',
        category: 'analytics',
        icon: 'alert-circle',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'ML model for churn risk scoring.',
        whyItMatters: [
            'Proactive retention',
            'At-risk account alerts',
            'CSM prioritization'
        ],
        inputs: [{ id: 'entities_in', name: 'Account Features', type: 'curated_entities' }],
        outputs: [
            { id: 'metrics_out', name: 'Churn Scores', type: 'metrics' },
            { id: 'audiences_out', name: 'At-Risk Accounts', type: 'audiences_accounts' }
        ],
        prerequisites: ['dbt_core'],
        enables: ['measurement', 'activation'],
        recommendedNext: ['hightouch', 'slack_alerts'],
        b2bSpecific: true
    },

    // ==========================================================
    // ACTIVATION & ORCHESTRATION
    // ==========================================================

    {
        id: 'hightouch',
        name: 'Hightouch',
        category: 'activation',
        icon: 'upload',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Reverse ETL for warehouse activation (preferred).',
        whyItMatters: [
            'Warehouse as source of truth',
            '100+ destinations',
            'Real-time sync'
        ],
        inputs: [
            { id: 'entities_in', name: 'Curated Data', type: 'curated_entities' },
            { id: 'audiences_in', name: 'Audiences', type: 'audiences_accounts' },
            { id: 'policies_in', name: 'Consent', type: 'governance_policies' }
        ],
        outputs: [
            { id: 'accounts_out', name: 'Account Syncs', type: 'audiences_accounts' },
            { id: 'people_out', name: 'Contact Syncs', type: 'audiences_people' }
        ],
        prerequisites: ['dbt_core'],
        enables: ['activation'],
        recommendedNext: ['salesforce_crm_dest', 'linkedin_ads', 'slack_alerts'],
        preferredStackNode: true
    },
    {
        id: 'census',
        name: 'Census',
        category: 'activation',
        icon: 'upload',
        vendorProfileAvailability: ['generic', 'google_cloud'],
        description: 'Reverse ETL alternative.',
        whyItMatters: [
            'Warehouse-native',
            'Easy setup',
            'Good Salesforce sync'
        ],
        inputs: [
            { id: 'entities_in', name: 'Curated Data', type: 'curated_entities' },
            { id: 'audiences_in', name: 'Audiences', type: 'audiences_accounts' }
        ],
        outputs: [{ id: 'accounts_out', name: 'Synced Records', type: 'audiences_accounts' }],
        prerequisites: ['dbt_core'],
        enables: ['activation'],
        recommendedNext: ['salesforce_crm_dest']
    },
    {
        id: 'braze',
        name: 'Braze',
        category: 'activation',
        icon: 'bell',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Customer engagement platform.',
        whyItMatters: [
            'Multi-channel messaging',
            'Real-time triggers',
            'Personalization'
        ],
        inputs: [
            { id: 'audiences_in', name: 'Audiences', type: 'audiences_people' },
            { id: 'policies_in', name: 'Consent', type: 'governance_policies' }
        ],
        outputs: [{ id: 'people_out', name: 'Engaged Contacts', type: 'audiences_people' }],
        prerequisites: [],
        enables: ['activation'],
        recommendedNext: []
    },

    // ==========================================================
    // DESTINATIONS
    // ==========================================================

    {
        id: 'salesforce_crm_dest',
        name: 'Salesforce (Sync)',
        category: 'destination',
        icon: 'cloud-lightning',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Sync enriched data back to Salesforce.',
        whyItMatters: [
            'Update CRM with insights',
            'Real-time lead scores',
            'Account enrichment'
        ],
        inputs: [
            { id: 'accounts_in', name: 'Account Syncs', type: 'audiences_accounts' },
            { id: 'people_in', name: 'Contact Syncs', type: 'audiences_people' }
        ],
        outputs: [],
        prerequisites: ['hightouch'],
        enables: ['activation'],
        recommendedNext: [],
        b2bSpecific: true,
        preferredStackNode: true
    },
    {
        id: 'linkedin_ads',
        name: 'LinkedIn Ads',
        category: 'destination',
        icon: 'linkedin',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'B2B advertising on LinkedIn.',
        whyItMatters: [
            'B2B audience reach',
            'Account-based targeting',
            'Company targeting'
        ],
        inputs: [{ id: 'accounts_in', name: 'Account Audiences', type: 'audiences_accounts' }],
        outputs: [],
        prerequisites: ['hightouch'],
        enables: ['activation'],
        recommendedNext: [],
        b2bSpecific: true,
        preferredStackNode: true
    },
    {
        id: 'google_ads',
        name: 'Google Ads',
        category: 'destination',
        icon: 'search',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Paid search advertising.',
        whyItMatters: [
            'Intent capture',
            'Customer Match audiences',
            'Retargeting'
        ],
        inputs: [{ id: 'people_in', name: 'Contact Audiences', type: 'audiences_people' }],
        outputs: [],
        prerequisites: ['hightouch'],
        enables: ['activation'],
        recommendedNext: []
    },
    {
        id: 'meta_ads',
        name: 'Meta Ads',
        category: 'destination',
        icon: 'facebook',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Facebook/Instagram advertising.',
        whyItMatters: [
            'Wide reach',
            'Custom audiences',
            'Lookalike targeting'
        ],
        inputs: [{ id: 'people_in', name: 'Contact Audiences', type: 'audiences_people' }],
        outputs: [],
        prerequisites: ['hightouch'],
        enables: ['activation'],
        recommendedNext: []
    },
    {
        id: 'outreach',
        name: 'Outreach',
        category: 'destination',
        icon: 'mail',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Sales engagement sequences.',
        whyItMatters: [
            'Automated outreach',
            'Sales sequence triggers',
            'Multi-channel sales'
        ],
        inputs: [{ id: 'people_in', name: 'Contact List', type: 'audiences_people' }],
        outputs: [],
        prerequisites: ['hightouch'],
        enables: ['activation'],
        recommendedNext: [],
        b2bSpecific: true
    },
    {
        id: 'salesloft',
        name: 'Salesloft',
        category: 'destination',
        icon: 'mail',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Sales engagement platform.',
        whyItMatters: [
            'Sales cadences',
            'Dialer integration',
            'Analytics'
        ],
        inputs: [{ id: 'people_in', name: 'Contact List', type: 'audiences_people' }],
        outputs: [],
        prerequisites: ['hightouch'],
        enables: ['activation'],
        recommendedNext: [],
        b2bSpecific: true
    },
    {
        id: 'slack_alerts',
        name: 'Slack Alerts',
        category: 'destination',
        icon: 'message-square',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Real-time notifications to Slack.',
        whyItMatters: [
            'Instant sales signals',
            'Product event alerts',
            'Team notifications'
        ],
        inputs: [{ id: 'any_in', name: 'Trigger Events', type: 'curated_entities' }],
        outputs: [],
        prerequisites: ['hightouch'],
        enables: ['activation'],
        recommendedNext: [],
        b2bSpecific: true,
        preferredStackNode: true
    },
    {
        id: 'email_sms',
        name: 'Email/SMS',
        category: 'destination',
        icon: 'mail',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Direct messaging channels.',
        whyItMatters: [
            'Direct customer reach',
            'Transactional messages',
            'Marketing campaigns'
        ],
        inputs: [
            { id: 'people_in', name: 'Contact Audiences', type: 'audiences_people' }
        ],
        outputs: [],
        prerequisites: ['hightouch'],
        enables: ['activation'],
        recommendedNext: []
    }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getNodeById(id: string): CatalogNode | undefined {
    return nodeCatalog.find(node => node.id === id)
}

export function getNodesByCategory(category: NodeCategory): CatalogNode[] {
    return nodeCatalog.filter(node => node.category === category)
}

export function getPreferredStackNodes(): CatalogNode[] {
    return nodeCatalog.filter(node => node.preferredStackNode)
}

export function getB2BSpecificNodes(): CatalogNode[] {
    return nodeCatalog.filter(node => node.b2bSpecific)
}

export function getRailNodes(): CatalogNode[] {
    return nodeCatalog.filter(node => node.isRailNode)
}

/**
 * Get recommended next nodes for a given catalog node
 * Returns full CatalogNode objects for the recommendedNext IDs
 */
export function getRecommendedNodes(nodeId: string): CatalogNode[] {
    const node = getNodeById(nodeId)
    if (!node || !node.recommendedNext) return []

    return node.recommendedNext
        .map(id => getNodeById(id))
        .filter((n): n is CatalogNode => n !== undefined)
}

