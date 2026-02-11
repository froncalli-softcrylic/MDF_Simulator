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
    sources: {
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
    mdf: {
        label: 'MDF Hub',
        icon: 'cpu',
        description: 'Unified Identity & Profile Engine',
        color: 'bg-indigo-600'
    },

    identity: {
        label: 'Identity & Entity Resolution',
        icon: 'users',
        description: 'Identity grouping and entity resolution',
        isRail: true,
        color: 'bg-green-500'
    },
    governance: {
        label: 'Governance & Privacy',
        icon: 'shield',
        description: 'Consent, PII masking, and data quality',
        isRail: true,
        color: 'bg-blue-500'
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
    clean_room: {
        label: 'Data Clean Room',
        icon: 'lock',
        description: 'Privacy-safe data collaboration'
    },
    realtime_serving: {
        label: 'Real-time Serving',
        icon: 'zap',
        description: 'Low-latency feature serving'
    }
}

// All profiles for convenience
const ALL_PROFILES: DemoProfile[] = [
    'adobe_summit',
    'generic'
];

// ============================================
// NODE CATALOG - B2B SaaS
// ============================================

export const nodeCatalog: CatalogNode[] = [
    // ==========================================================
    // SOURCES - B2B SaaS Data Origins
    // ==========================================================

    // Legacy / Anti-Patterns (For Consultant Mode Swaps)
    {
        id: 'manual_csv',
        name: 'Manual CSV Uploads',
        category: 'sources',
        nodeRole: 'source',
        stage: 'sources',
        icon: 'file-text',
        vendorProfileAvailability: [],
        description: 'Manual data exports and uploads (High effort, low reliability).',
        whenToUse: 'Never recommended for production pipelines.',
        whyItMatters: [
            'Prone to human error',
            'No real-time data',
            'Security risk'
        ],
        inputs: [],
        outputs: [{ id: 'records_out', name: 'Raw Records', type: 'raw_records' }],
        prerequisites: [],
        enables: [],
        recommendedNext: ['fivetran'],
        b2bSpecific: true,
        complexity: 1,
        costEstimate: 'low',
        supportedLatency: ['batch'],
        businessValue: {
            proposition: 'Manual process that bottlenecks data availability.',
            impact: 'efficiency',
            roi: 'low'
        }
    },
    {
        id: 'legacy_script',
        name: 'Legacy Tracking Script',
        category: 'collection',
        nodeRole: 'collector',
        stage: 'collection',
        icon: 'code',
        vendorProfileAvailability: [],
        description: 'Hardcoded, untyped tracking scripts scattered across codebase.',
        whenToUse: 'Legacy systems only.',
        whyItMatters: [
            'Hard to maintain',
            'Inconsistent data schemas',
            'Developer bottleneck'
        ],
        inputs: [],
        outputs: [{ id: 'events_out', name: 'Raw Events', type: 'raw_events' }],
        prerequisites: [],
        enables: [],
        recommendedNext: ['segment', 'rudderstack'],
        complexity: 3,
        costEstimate: 'medium',
        supportedLatency: ['realtime'],
        businessValue: {
            proposition: 'Tech debt that slows down marketing agility.',
            impact: 'risk',
            roi: 'low'
        }
    },

    // Product & Behavioral
    {
        id: 'product_events',
        name: 'Product Usage Events',
        category: 'sources',
        nodeRole: 'source',
        stage: 'sources',
        icon: 'activity',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'User actions within your product (clicks, features used, sessions).',
        whenToUse: 'When you need to track feature adoption, PQLs, or usage-based health scores.',
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
        preferredStackNode: true,
        availableIdentities: ['user_id', 'device_id', 'account_id'],
        dataClassProduced: 'behavioral'
    },
    {
        id: 'web_app_events',
        name: 'Web/App Events',
        category: 'sources',
        nodeRole: 'source',
        stage: 'sources',
        icon: 'globe',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Clickstream and behavioral events from marketing site and apps.',
        whenToUse: 'When you need web analytics, conversion tracking, or visitor-level behavioral data.',
        whyItMatters: [
            'Capture visitor intent signals',
            'Track conversion funnels',
            'Enable retargeting'
        ],
        inputs: [],
        outputs: [{ id: 'events_out', name: 'Event Stream', type: 'raw_events' }],
        prerequisites: [],
        enables: ['measurement', 'identity'],
        recommendedNext: ['segment', 'google_analytics'],
        availableIdentities: ['cookie', 'device_id'],
        dataClassProduced: 'behavioral',
        sampleData: [
            { event_id: 'evt_12345', name: 'Page Viewed', url: '/pricing', timestamp: '2024-02-14T10:30:00Z', anonymous_id: 'anon_001' },
            { event_id: 'evt_12346', name: 'Button Clicked', label: 'Sign Up', timestamp: '2024-02-14T10:31:15Z', anonymous_id: 'anon_001' },
            { event_id: 'evt_12347', name: 'Form Submitted', form_id: 'demo_req', timestamp: '2024-02-14T10:35:22Z', anonymous_id: 'anon_002' }
        ]
    },

    // CRM & Sales
    {
        id: 'salesforce_crm',
        name: 'Salesforce CRM',
        category: 'sources',
        nodeRole: 'source',
        stage: 'sources',
        uniquenessKey: 'source:salesforce',
        cardinality: 'single',
        icon: 'cloud',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Accounts, Contacts, Leads, Opportunities, Activities from Salesforce.',
        whenToUse: 'When Salesforce is your CRM system-of-record for pipeline and revenue data.',
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
        preferredStackNode: true,
        businessValue: {
            proposition: 'The system of record for B2B customer relationships.',
            impact: 'revenue',
            roi: 'high'
        },
        complexity: 8,
        costEstimate: 'high',
        supportedLatency: ['batch', 'realtime'],
        supportedIdentifiers: ['crm_id', 'email', 'account_id'],
        governanceFlags: ['pii_safe', 'needs_consent'],
        joinKeys: ['email', 'crm_id', 'account_id'],
        valueText: 'System of Record',
        // MDF v3 Metadata
        availableIdentities: ['crm_id', 'email', 'account_id', 'phone'],
        sampleFields: ['Lead Source', 'Annual Revenue', 'Stage', 'Close Date'],
        dataClassProduced: 'transactional',
        sampleData: [
            { id: 'LD-1001', first_name: 'John', last_name: 'Doe', email: 'john.doe@techcorp.com', company: 'TechCorp', status: 'MQL', annual_rev: '$50M' },
            { id: 'LD-1002', first_name: 'Sarah', last_name: 'Smith', email: 'sarah.s@acme.io', company: 'Acme Inc', status: 'SQL', annual_rev: '$120M' },
            { id: 'LD-1003', first_name: 'Mike', last_name: 'Jones', email: 'mike.j@startup.co', company: 'StartupCo', status: 'New', annual_rev: '$5M' }
        ]
    },
    {
        id: 'hubspot_crm',
        name: 'HubSpot CRM',
        category: 'sources',
        nodeRole: 'source',
        stage: 'sources',
        uniquenessKey: 'source:hubspot',
        cardinality: 'single',
        icon: 'cloud',
        vendorProfileAvailability: ['generic'],
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
        b2bSpecific: true,
        joinKeys: ['email', 'crm_id'],
        valueText: 'CRM Data'
    },

    // Billing & Revenue
    {
        id: 'billing_system',
        name: 'Billing & Subscription',
        category: 'sources',
        nodeRole: 'source',
        stage: 'sources',
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
        category: 'sources',
        nodeRole: 'source',
        stage: 'sources',
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
        category: 'sources',
        nodeRole: 'source',
        stage: 'sources',
        icon: 'mail',
        vendorProfileAvailability: ['adobe_summit', 'generic'],
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
        recommendedNext: ['fivetran', 'snowflake'],
        availableIdentities: ['email', 'marketo_id', 'lead_id'],
        sampleFields: ['Campaign Name', 'Program Status', 'Lead Score'],
        dataClassProduced: 'marketing',
        sampleData: [
            { lead_id: 'Mkto-5501', score: 85, program: 'Webinar-2024-Q1', behavior_score: 50, demographic_score: 35, email: 'alex.b@enterprise.net' },
            { lead_id: 'Mkto-5502', score: 42, program: 'Ebook-Download', behavior_score: 20, demographic_score: 22, email: 'chris.p@midmarket.com' }
        ]
    },
    {
        id: 'ad_platforms',
        name: 'Ad Platforms',
        category: 'sources',
        nodeRole: 'source',
        stage: 'sources',
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
        nodeRole: 'collector',
        stage: 'collection',
        uniquenessKey: 'collector:segment',
        icon: 'git-branch',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Customer data platform for event collection and routing.',
        whenToUse: 'When you need a single SDK for event collection with real-time routing to multiple destinations.',
        whyItMatters: [
            'Single tracking SDK',
            'Real-time event routing',
            'Identity resolution built-in'
        ],
        inputs: [{ id: 'events_in', name: 'Raw Events', type: 'raw_events' }],
        outputs: [
            { id: 'stream_out', name: 'Event Stream', type: 'raw_events' },
            { id: 'identity_out', name: 'Identity', type: 'identity_keys' }
        ],
        prerequisites: [],
        enables: ['identity', 'activation'],
        recommendedNext: ['kinesis', 's3_raw', 'snowflake'],
        preferredStackNode: true,
        businessValue: {
            proposition: 'Unified data collection and identity resolution infrastructure.',
            impact: 'efficiency',
            roi: 'medium'
        },
        complexity: 5,
        costEstimate: 'medium',
        supportedLatency: ['realtime'],
        supportedIdentifiers: ['cookie', 'device_id', 'email'],
        governanceFlags: ['needs_hashing', 'needs_consent'],
        availableIdentities: ['user_id', 'anonymous_id', 'email'],
        dataClassProduced: 'behavioral'
    },
    {
        id: 'rudderstack',
        name: 'RudderStack',
        category: 'collection',
        nodeRole: 'collector',
        stage: 'collection',
        uniquenessKey: 'collector:rudderstack',
        icon: 'git-branch',
        vendorProfileAvailability: ['generic'],
        description: 'Open-source customer data platform.',
        whyItMatters: [
            'Warehouse-native CDP',
            'Self-hosted option',
            'Cost-effective at scale'
        ],
        inputs: [{ id: 'events_in', name: 'Raw Events', type: 'raw_events' }],
        outputs: [{ id: 'stream_out', name: 'Event Stream', type: 'raw_events' }],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['kinesis', 's3_raw']
    },
    {
        id: 'amplitude',
        name: 'Amplitude',
        category: 'collection',
        nodeRole: 'collector',
        stage: 'collection',
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
        nodeRole: 'collector',
        stage: 'collection',
        icon: 'radio',
        vendorProfileAvailability: ['generic'],
        description: 'Open-source event pipeline with rich schemas.',
        whyItMatters: [
            'Full data ownership',
            'Rich event schemas',
            'Real-time streaming'
        ],
        inputs: [{ id: 'events_in', name: 'Raw Events', type: 'raw_events' }],
        outputs: [{ id: 'stream_out', name: 'Event Stream', type: 'raw_events' }],
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
        nodeRole: 'ingestor',
        stage: 'ingestion',
        uniquenessKey: 'ingestor:kinesis',
        icon: 'zap',
        vendorProfileAvailability: ['generic'],
        description: 'Real-time streaming data ingestion.',
        whyItMatters: [
            'Sub-second latency',
            'Scales automatically',
            'Native AWS integration'
        ],
        inputs: [{ id: 'stream_in', name: 'Event Stream', type: 'raw_events' }],
        outputs: [{ id: 'stream_out', name: 'Kinesis Stream', type: 'raw_events' }],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['kinesis_firehose', 's3_raw'],
        preferredStackNode: true
    },
    {
        id: 'kinesis_firehose',
        name: 'Kinesis Firehose',
        category: 'ingestion',
        nodeRole: 'ingestor',
        stage: 'ingestion',
        icon: 'arrow-right',
        vendorProfileAvailability: ['generic'],
        description: 'Batch delivery from Kinesis to S3/Redshift/Snowflake.',
        whyItMatters: [
            'Zero-admin batch loading',
            'Automatic scaling',
            'Built-in transformation'
        ],
        inputs: [{ id: 'stream_in', name: 'Kinesis Stream', type: 'raw_events' }],
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
        nodeRole: 'ingestor',
        stage: 'ingestion',
        uniquenessKey: 'ingestor:fivetran',
        icon: 'refresh-cw',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Managed ELT for SaaS connectors.',
        whenToUse: 'When you need reliable, zero-maintenance data pipelines from SaaS tools to your warehouse.',
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
        nodeRole: 'ingestor',
        stage: 'ingestion',
        uniquenessKey: 'ingestor:airbyte',
        icon: 'refresh-cw',
        vendorProfileAvailability: ['generic'],
        description: 'Open-source ELT platform.',
        whyItMatters: [
            'Self-hosted option',
            'Extensible connectors',
            'Cost-effective'
        ],
        businessValue: {
            proposition: 'Open-source standard for ELT data movement.',
            impact: 'efficiency',
            roi: 'high'
        },
        complexity: 6,
        costEstimate: 'low',
        supportedLatency: ['batch'],
        supportedIdentifiers: [],
        governanceFlags: [],
        inputs: [{ id: 'records_in', name: 'Source Records', type: 'raw_records' }],
        outputs: [{ id: 'records_out', name: 'Warehouse Tables', type: 'raw_records' }],
        prerequisites: [],
        enables: ['hygiene'],
        recommendedNext: ['snowflake', 'bigquery']
    },

    // GCP

    // ==========================================================
    // RAW STORAGE (LAKE)
    // ==========================================================

    {
        id: 's3_raw',
        name: 'S3 Raw Zone',
        category: 'storage_raw',
        nodeRole: 'storage_raw',
        stage: 'storage_raw',
        uniquenessKey: 'storage:raw:s3',
        cardinality: 'single',
        icon: 'hard-drive',
        vendorProfileAvailability: ['generic'],
        description: 'Immutable raw data landing zone in S3.',
        whyItMatters: [
            'Full data history',
            'Replay capability',
            'Cost-effective storage'
        ],
        inputs: [
            { id: 'stream_in', name: 'Stream Data', type: 'raw_events' },
            { id: 'records_in', name: 'Batch Records', type: 'raw_records' }
        ],
        outputs: [{ id: 'records_out', name: 'Raw Files', type: 'raw_records' }],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: ['glue', 'snowflake'],
        preferredStackNode: true
    },
    {
        id: 'iceberg',
        name: 'Apache Iceberg',
        category: 'storage_raw',
        nodeRole: 'storage_raw',
        stage: 'storage_raw',
        icon: 'database',
        vendorProfileAvailability: ['generic'],
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
        nodeRole: 'warehouse',
        stage: 'storage_warehouse',
        uniquenessKey: 'storage:warehouse',
        cardinality: 'single',
        icon: 'database',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Cloud data warehouse (preferred).',
        whenToUse: 'When you need a scalable warehouse for analytics, modeling, and data sharing.',
        whyItMatters: [
            'Near-zero maintenance',
            'Separation of storage and compute',
            'Data sharing capabilities'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Records', type: 'raw_records' }],
        outputs: [
            { id: 'records_out', name: 'Warehouse Tables', type: 'curated_entities' },
            { id: 'metrics_out', name: 'Metrics', type: 'metrics' }
        ],
        prerequisites: [],
        enables: ['measurement', 'identity', 'governance'],
        recommendedNext: ['dbt_core', 'looker'],
        preferredStackNode: true,
        businessValue: {
            proposition: 'The Data Cloud that powers the modern data stack.',
            impact: 'efficiency',
            roi: 'high'
        },
        complexity: 6,
        costEstimate: 'medium',
        supportedLatency: ['batch'],
        supportedIdentifiers: [],
        governanceFlags: ['pii_safe'],
        metrics: [
            { label: 'Rows', value: '1,728', trend: 'up' },
            { label: 'Audience', value: '10', trend: 'neutral' }
        ]
    },
    {
        id: 'bigquery',
        name: 'BigQuery',
        category: 'storage_warehouse',
        nodeRole: 'warehouse',
        stage: 'storage_warehouse',
        uniquenessKey: 'storage:warehouse',
        cardinality: 'single',
        icon: 'database',
        vendorProfileAvailability: ['generic'],
        description: 'Google Cloud serverless data warehouse.',
        whenToUse: 'When your infrastructure is on GCP and you want a serverless, ML-integrated warehouse.',
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
        nodeRole: 'warehouse',
        stage: 'storage_warehouse',
        uniquenessKey: 'storage:warehouse',
        cardinality: 'single',
        icon: 'database',
        vendorProfileAvailability: ['generic'],
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
    // MDF HUB (Central)
    // ==========================================================

    {
        id: 'mdf_hub',
        name: 'MDF Hub (Unified Profile)',
        category: 'mdf',
        nodeRole: 'mdf_hub',
        stage: 'mdf',
        isHub: true,
        uniquenessKey: 'mdf:hub',
        cardinality: 'single',
        icon: 'cpu',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'The central hub that ingests customer data from many systems and turns it into clean, unified, activation-ready customer profiles. Performs Data Hygiene, Identity Resolution, Deduplication, Unified Profile construction, and Measurement enablement.',
        whenToUse: 'Required. The "Brain" of every MDF architecture — without it, data stays siloed and inconsistent.',
        whyItMatters: [
            'Ingests data from CRM, marketing platforms, web/app behavior, paid media, and transactions via batch & real-time pipelines',
            'Cleans & standardizes data (normalize phone/email formats, fix casing, validate required fields, handle nulls, apply consistent schemas)',
            'Resolves identity by linking records that refer to the same person using join keys like email, phone, CRM ID, and device IDs',
            'Removes duplicates and merges records into a single "Golden Record" per customer — the Unified Profile',
            'Enables reliable measurement and attribution because identities and events are standardized across all channels',
            'Feeds downstream activation platforms (CDPs, journey orchestrators, ad platforms) with clean, identity-resolved audiences'
        ],
        inputs: [
            { id: 'records_in', name: 'Ingested Records', type: 'raw_records', position: 'left' },
            { id: 'events_in', name: 'Stream Events', type: 'raw_events', position: 'left' },
            { id: 'policies_in', name: 'Governance', type: 'governance_policies', position: 'top' }
        ],
        outputs: [
            { id: 'profiles_out', name: 'Unified Profiles', type: 'curated_entities', position: 'right' },
            { id: 'audiences_out', name: 'Audiences', type: 'audiences_people', position: 'right' },
            { id: 'metrics_out', name: 'Measurement', type: 'metrics', position: 'right' }
        ],
        prerequisites: ['ingestion'],
        enables: ['activation', 'measurement', 'identity', 'hygiene', 'account_intelligence'],
        recommendedNext: ['adobe_aep', 'hightouch', 'braze'],
        b2bSpecific: true,
        preferredStackNode: true,
        // Consultant Metadata
        complexity: 9,
        costEstimate: 'high',
        supportedLatency: ['batch', 'realtime'],
        businessValue: {
            proposition: 'The "Brain" of the architecture: Ingest → Clean → Resolve → Unify → Measure → Activate.',
            impact: 'efficiency',
            roi: 'high'
        },
        // MDF v3 Metadata — Deep Logic
        identityStrategyOptions: [
            'Deterministic (Email/Phone)',
            'Account-Based (Domain Matching)',
            'Household/Account Grouping',
            'Device Graph (Cross-Device)',
            'Probabilistic (ML-Assisted)'
        ],
        hygieneRules: [
            'E.164 Phone Format',
            'Email Lowercase & Validation',
            'Address Standardization (USPS/Loqate)',
            'Title Casing (Names)',
            'Null/Empty Field Handling',
            'Schema Enforcement & Type Validation',
            'Duplicate Detection & Merge'
        ],
        profileDataClasses: [
            'Identity Graph (Cross-Channel Keys)',
            'Behavioral Events (Web, App, Product)',
            'Transactional Data (Purchases, Subscriptions)',
            'Marketing Interactions (Campaigns, Emails, Ads)',
            'Consent & Preference Status'
        ],
        measurementOutputs: [
            'Multi-Touch Attribution',
            'Customer Journey Analytics',
            'Lead/Account Scoring',
            'Churn Propensity Models',
            'ROI by Channel Attribution',
            'Segment Performance Reporting'
        ],
        joinKeys: ['email', 'phone', 'crm_id', 'user_id', 'device_id', 'account_id', 'household_id'],
        metrics: [
            { label: 'Match Rate', value: '87%', trend: 'up' },
            { label: 'Golden Records', value: '1.2K', trend: 'up' },
            { label: 'Dedup Rate', value: '38%', trend: 'up' },
            { label: 'Hygiene Pass', value: '94%', trend: 'up' }
        ],
        sampleData: [
            { stage: 'Raw Input', name: 'john DOE', email: 'JOHN.DOE@GMAIL.com', phone: '1234567890', source: 'CRM', status: '❌ Messy' },
            { stage: 'Post-Hygiene', name: 'John Doe', email: 'john.doe@gmail.com', phone: '(123) 456-7890', source: 'CRM', status: '✅ Clean' },
            { stage: 'Post-Identity', name: 'John Doe', email: 'john.doe@gmail.com', phone: '(123) 456-7890', matched_keys: 'email+phone+crm_id', identity_cluster: 'IC-4401', status: '🔗 Resolved' },
            { stage: 'Golden Record', profile_id: 'UP-8812', name: 'John Doe', email: 'john.doe@gmail.com', phone: '(123) 456-7890', segments: ['High Value', 'Enterprise'], ltv: '$142K', status: '⭐ Unified' }
        ]
    },
    {
        id: 'data_hygiene',
        name: 'Data Hygiene (Legacy)',
        category: 'mdf',
        nodeRole: 'hygiene',
        stage: 'mdf',
        uniquenessKey: 'mdf:hygiene',
        cardinality: 'single',
        icon: 'sparkles',
        vendorProfileAvailability: [] as DemoProfile[], // Hide from new profiles
        description: 'Legacy node. Use MDF Hub for integrated hygiene.',
        whyItMatters: [
            'Ensures data quality before processing',
            'Standardizes formats (phone, address, email)',
            'Removes duplicates and invalid records'
        ],
        inputs: [{ id: 'records_in', name: 'Raw Records', type: 'raw_records' }],
        outputs: [{ id: 'clean_records_out', name: 'Clean Records', type: 'raw_records' }],
        prerequisites: ['ingestion'],
        enables: ['identity', 'mdf_hub'],
        recommendedNext: ['mdf_hub'],
        b2bSpecific: true,
        preferredStackNode: true
    },
    {
        id: 'measurement',
        name: 'Measurement (Legacy)',
        category: 'mdf',
        nodeRole: 'measurement',
        stage: 'mdf',
        uniquenessKey: 'mdf:measurement',
        cardinality: 'single',
        icon: 'bar-chart-2',
        vendorProfileAvailability: [] as DemoProfile[], // Hide from new profiles
        description: 'Legacy node. Use MDF Hub for integrated measurement.',
        whyItMatters: [
            'Tracks campaign ROI and performance',
            'Multi-touch attribution models',
            'Customer journey analytics'
        ],
        inputs: [{ id: 'profiles_in', name: 'Unified Profiles', type: 'curated_entities' }],
        outputs: [{ id: 'metrics_out', name: 'Metrics', type: 'metrics' }],
        prerequisites: ['mdf_hub'],
        enables: ['activation'],
        recommendedNext: ['looker', 'tableau'],
        b2bSpecific: true,
        preferredStackNode: true
    },

    // ==========================================================
    // TRANSFORM & MODELING
    // ==========================================================

    {
        id: 'dbt_core',
        name: 'dbt Core',
        category: 'transform',
        nodeRole: 'transform',
        stage: 'transform',
        uniquenessKey: 'transform:primary',
        cardinality: 'single',
        icon: 'code',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'SQL-based transformation layer.',
        whenToUse: 'When you need modular, version-controlled SQL transformations and business logic in the warehouse.',
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
        preferredStackNode: true,
        businessValue: {
            proposition: 'Standardize business logic and transformations in the warehouse.',
            impact: 'efficiency',
            roi: 'high'
        }
    },
    {
        id: 'dbt_cloud',
        name: 'dbt Cloud',
        category: 'transform',
        nodeRole: 'transform',
        stage: 'transform',
        uniquenessKey: 'transform:primary',
        cardinality: 'single',
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
        nodeRole: 'transform',
        stage: 'transform',
        icon: 'layers',
        vendorProfileAvailability: ['generic'],
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
        nodeRole: 'transform',
        stage: 'transform',
        icon: 'zap',
        vendorProfileAvailability: ['generic'],
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
    // HYGIENE & STANDARDIZATION
    // ==========================================================

    {
        id: 'data_standardization',
        name: 'Data Hygiene',
        category: 'transform',  // Or new 'hygiene' category if supported in UI
        nodeRole: 'hygiene',
        stage: 'transform',
        icon: 'check-square',
        vendorProfileAvailability: ['generic'],
        description: 'Cleanse, normalize, and format incoming data.',
        whyItMatters: [
            'Improves match rates',
            'Ensures data quality',
            'Standardizes formats (phone, email)'
        ],
        hygieneRules: ['Phone Normalization', 'Email Lowercasing', 'Address Standardization'],
        inputs: [{ id: 'raw_in', name: 'Raw Records', type: 'raw_records' }],
        outputs: [{ id: 'clean_out', name: 'Clean Records', type: 'raw_records' }],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['deduplication'],
        businessValue: {
            proposition: 'Improve match rates and data trust by standardizing formats.',
            impact: 'efficiency',
            roi: 'medium'
        }
    },
    {
        id: 'deduplication',
        name: 'Deduplication',
        category: 'identity', // Or transform/hygiene
        nodeRole: 'hygiene',
        stage: 'transform', // Pre-identity
        icon: 'copy',
        vendorProfileAvailability: ['generic'],
        description: 'Identify and merge duplicate records.',
        whyItMatters: [
            'Reduces storage costs',
            'Single customer view',
            'Marketing efficiency'
        ],
        hygieneRules: ['Fuzzy Matching', 'Exact Match', 'Survivor Logic'],
        inputs: [{ id: 'records_in', name: 'Records', type: 'raw_records' }],
        outputs: [{ id: 'unique_out', name: 'Unique Records', type: 'raw_records' }],
        prerequisites: ['data_standardization'],
        enables: ['identity'],
        recommendedNext: ['account_graph'],
        businessValue: {
            proposition: 'Stop marketing to the same person twice.',
            impact: 'efficiency',
            roi: 'high'
        }
    },

    // ==========================================================
    // IDENTITY HUB (B2B Account Graph)
    // ==========================================================

    {
        id: 'account_graph',
        name: 'Identity Hub',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:graph',
        cardinality: 'single',
        isHub: true,
        icon: 'git-merge',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Central B2B identity resolution engine.',
        whenToUse: 'When you need to unify person/account identities across multiple data sources for activation and analytics.',
        whyItMatters: [
            'Unified account view',
            'Cross-device stitching',
            'Golden record creation'
        ],
        inputs: [
            { id: 'keys_in', name: 'Identity Keys', type: 'identity_keys' },
            { id: 'entities_in', name: 'Curated Entities', type: 'curated_entities' }
        ],
        outputs: [
            { id: 'audiences_acc_out', name: 'Account Audiences', type: 'audiences_accounts' },
            { id: 'audiences_ppl_out', name: 'People Audiences', type: 'audiences_people' },
            { id: 'graph_out', name: 'Graph Edges', type: 'graph_edges' }
        ],
        prerequisites: [],
        enables: ['identity', 'account_intelligence'],
        recommendedNext: ['hightouch'],
        b2bSpecific: true,
        preferredStackNode: true,
        businessValue: {
            proposition: 'Resolve cross-device identity to a single customer view.',
            impact: 'experience',
            roi: 'high'
        },
        identityType: 'graph',
        joinKeys: ['email', 'phone', 'device_id', 'account_id']
    },
    {
        id: 'unified_customer_profile',
        name: 'Unified Profile',
        category: 'identity', // or unified_profile role
        nodeRole: 'unified_profile',
        stage: 'identity',
        icon: 'user-check', // or similar
        vendorProfileAvailability: ALL_PROFILES,
        description: 'The Golden Record containing all attributes and history.',
        whyItMatters: [
            'Single source of truth',
            'Full customer history',
            'Personalization engine'
        ],
        dataConcepts: ['behavioral', 'transactional', 'demographic', 'preferences'], // V2 Requirement
        inputs: [
            { id: 'graph_in', name: 'Identity Graph', type: 'graph_edges' },
            { id: 'attr_in', name: 'Attributes', type: 'curated_entities' }
        ],
        outputs: [
            { id: 'segment_out', name: 'Segments', type: 'audiences_people' },
            { id: 'activation_out', name: 'Activation Payload', type: 'audiences_accounts' }
        ],
        prerequisites: ['account_graph'],
        enables: ['activation', 'personalization'],
        recommendedNext: ['hightouch', 'braze'],
        businessValue: {
            proposition: 'The complete, accessible view of every customer.',
            impact: 'revenue',
            roi: 'high'
        },
        valueText: 'Golden Record'
    },
    {
        id: 'salesforce_data_cloud',
        name: 'Salesforce Data Cloud',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:hub', // Only one primary hub allowed
        cardinality: 'single',
        isHub: true,
        icon: 'cloud-lightning', // Or specific Salesforce icon
        vendorProfileAvailability: ['generic'],
        description: 'Real-time hyperscale data platform for Salesforce.',
        whenToUse: 'When your stack centers on Salesforce and you need native identity resolution across the Customer 360.',
        whyItMatters: [
            'Native Salesforce integration',
            'Real-time identity resolution',
            'Unified customer profile'
        ],
        businessValue: {
            proposition: 'Unlock real-time customer magic across the Salesforce Customer 360.',
            impact: 'revenue',
            roi: 'high'
        },
        inputs: [
            { id: 'records_in', name: 'CRM/Engagement Data', type: 'raw_records' },
            { id: 'stream_in', name: 'Web/Mobile Streams', type: 'raw_events' }
        ],
        outputs: [
            { id: 'audiences_out', name: 'Segments', type: 'audiences_people' },
            { id: 'graph_out', name: 'Unified Profile', type: 'graph_edges' }
        ],
        prerequisites: ['salesforce_crm'],
        enables: ['identity', 'activation', 'personalization'],
        recommendedNext: ['salesforce_crm_dest', 'marketing_cloud'],
        b2bSpecific: true,
        preferredStackNode: true,
        dataConcepts: ['behavioral', 'sales_activity', 'service_history'],
        valueText: 'Customer 360'
    },

    // ==========================================================
    // ENRICHMENT
    // ==========================================================

    {
        id: 'clearbit',
        name: 'Clearbit',
        category: 'transform',
        nodeRole: 'enrichment',
        stage: 'transform',
        icon: 'zap',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'B2B data enrichment.',
        whyItMatters: ['Firmographic data', 'Contact enrichment'],
        inputs: [{ id: 'records_in', name: 'Records', type: 'raw_records' }],
        outputs: [{ id: 'entities_out', name: 'Enriched Entities', type: 'curated_entities' }],
        prerequisites: [],
        enables: ['enrichment'],
        recommendedNext: []
    },
    {
        id: 'zoominfo',
        name: 'ZoomInfo',
        category: 'transform',
        nodeRole: 'enrichment',
        stage: 'transform',
        icon: 'search',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'B2B contact and company database.',
        whyItMatters: ['Contact accuracy', 'Prospecting data'],
        inputs: [{ id: 'records_in', name: 'Records', type: 'raw_records' }],
        outputs: [{ id: 'entities_out', name: 'Enriched Entities', type: 'curated_entities' }],
        prerequisites: [],
        enables: ['enrichment'],
        recommendedNext: []
    },
    {
        id: 'sixsense_intent',
        name: '6sense Intent',
        category: 'transform',
        nodeRole: 'enrichment',
        stage: 'transform',
        icon: 'target',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Intent data and account scoring.',
        whyItMatters: ['Predictive scoring', 'Buying stage detection'],
        inputs: [{ id: 'records_in', name: 'Records', type: 'raw_records' }],
        outputs: [{ id: 'entities_out', name: 'Enriched Entities', type: 'curated_entities' }],
        prerequisites: [],
        enables: ['intent_signals'],
        recommendedNext: []
    },

    // ==========================================================
    // METRICS / SEMANTIC LAYER
    // ==========================================================

    {
        id: 'metrics_layer',
        name: 'Semantic Layer',
        category: 'analytics',
        nodeRole: 'analytics', // Or transform, but user said 'analytics' stage for 'metrics/semantic layer'? user said "Metrics / Semantic Layer (analytics) – in: curated_entities, out: metrics"
        stage: 'analytics',
        icon: 'box',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Centralized metrics and business logic.',
        whenToUse: 'When teams need a single source of truth for KPI definitions and self-serve analytics.',
        whyItMatters: ['Consistent definitions', 'Self-serve access'],
        inputs: [{ id: 'entities_in', name: 'Curated Entities', type: 'curated_entities' }],
        outputs: [{ id: 'metrics_out', name: 'Metrics', type: 'metrics' }],
        prerequisites: [],
        enables: ['measurement'],
        recommendedNext: ['attribution_model']
    },

    // ==========================================================
    // ACTIVATION
    // ==========================================================


    // ==========================================================
    // DESTINATIONS
    // ==========================================================

    {
        id: 'linkedin_ads',
        name: 'LinkedIn Ads',
        category: 'destination',
        nodeRole: 'destination',
        stage: 'destination',
        icon: 'linkedin',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'B2B advertising platform.',
        whenToUse: 'When running account-based ad campaigns targeting decision-makers in your ICP.',
        whyItMatters: ['Targeted B2B ads', 'Account targeting'],
        inputs: [
            { id: 'acc_in', name: 'Account Audiences', type: 'audiences_accounts' },
            { id: 'ppl_in', name: 'People Audiences', type: 'audiences_people' }
        ],
        outputs: [],
        prerequisites: [],
        enables: ['advertising'],
        recommendedNext: []
    },
    {
        id: 'salesforce_crm_dest',
        name: 'Salesforce CRM (Dest)',
        category: 'destination',
        nodeRole: 'destination',
        stage: 'destination',
        icon: 'cloud',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Sync data back to CRM.',
        whyItMatters: ['Sales visibility', 'Lead routing'],
        inputs: [
            { id: 'entities_in', name: 'Entities', type: 'curated_entities' },
            { id: 'ppl_in', name: 'People Audiences', type: 'audiences_people' }
        ],
        outputs: [],
        prerequisites: [],
        enables: ['sales_enablement'],
        recommendedNext: []
    },
    {
        id: 'marketo_dest',
        name: 'Marketo (Dest)',
        category: 'destination',
        nodeRole: 'destination',
        stage: 'destination',
        icon: 'mail',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Sync audiences to Marketo.',
        whyItMatters: ['Email targeting', 'Nurture streams'],
        inputs: [{ id: 'ppl_in', name: 'People Audiences', type: 'audiences_people' }],
        outputs: [],
        prerequisites: [],
        enables: ['marketing'],
        recommendedNext: []
    },
    {
        id: 'meta_ads',
        name: 'Meta Ads',
        category: 'destination',
        nodeRole: 'destination',
        stage: 'destination',
        icon: 'facebook',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Facebook and Instagram ads.',
        whyItMatters: ['Retargeting', 'Lookalike audiences'],
        inputs: [{ id: 'ppl_in', name: 'People Audiences', type: 'audiences_people' }],
        outputs: [],
        prerequisites: [],
        enables: ['advertising'],
        recommendedNext: [],
        sampleData: [
            { audience_name: 'All Site Visitors 30d', match_rate: '85%', size: 12500, status: 'Ready' },
            { audience_name: 'Cart Abandoners', match_rate: '92%', size: 450, status: 'Ready' },
            { audience_name: 'Lookalike 1% - High LTV', match_rate: 'N/A', size: 2400000, status: 'Populating' }
        ]
    },

    // ==========================================================
    // GOVERNANCE RAIL
    // ==========================================================

    {
        id: 'consent_manager',
        name: 'Consent Manager',
        category: 'governance',
        nodeRole: 'governance',
        stage: 'governance',
        icon: 'shield',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Manage user consent and preferences.',
        whenToUse: 'When activating data across channels and you need GDPR/CCPA/consent enforcement.',
        whyItMatters: ['GDPR/CCPA compliance', 'Trust building'],
        inputs: [{ id: 'gov_in', name: 'Policies', type: 'governance_policies' }],
        outputs: [{ id: 'gov_out', name: 'Policies', type: 'governance_policies' }],
        prerequisites: [],
        enables: ['compliance'],
        recommendedNext: [],
        isRailNode: true
    },
    {
        id: 'data_quality',
        name: 'Data Quality',
        category: 'governance',
        nodeRole: 'governance',
        stage: 'governance',
        icon: 'check-circle',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Monitor data health and reliability.',
        whenToUse: 'When data pipelines grow complex and you need automated monitoring for freshness, volume, and schema drift.',
        whyItMatters: ['Trustworthy data', 'Anomaly detection'],
        inputs: [
            { id: 'records_in', name: 'Records', type: 'raw_records' },
            { id: 'entities_in', name: 'Entities', type: 'curated_entities' }
        ],
        outputs: [{ id: 'gov_out', name: 'Policies', type: 'governance_policies' }],
        prerequisites: [],
        enables: ['hygiene'],
        recommendedNext: [],
        isRailNode: true
    },
    {
        id: 'pii_masking',
        name: 'PII Masking',
        category: 'governance',
        nodeRole: 'governance',
        stage: 'governance',
        icon: 'lock',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Transform and mask sensitive data.',
        whyItMatters: ['Privacy protection', 'Security'],
        inputs: [{ id: 'gov_in', name: 'Policies', type: 'governance_policies' }],
        outputs: [{ id: 'gov_out', name: 'Policies', type: 'governance_policies' }],
        prerequisites: [],
        enables: ['compliance'],
        recommendedNext: [],
        isRailNode: true
    },
    {
        id: 'identity_resolution',
        name: 'Identity Resolution',
        category: 'identity',
        icon: 'users',
        vendorProfileAvailability: ['generic'],
        description: 'Email/user→Contact identity resolution.',
        whyItMatters: [
            'Deduplicate contacts',
            'Cross-system identity',
            'Person-level graph'
        ],
        inputs: [{ id: 'identity_in', name: 'Identity Keys', type: 'identity_keys' }],
        outputs: [
            { id: 'identity_out', name: 'Resolved Contacts', type: 'identity_resolution' },
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
        id: 'clearbit',
        name: 'Clearbit',
        category: 'transform',
        nodeRole: 'enrichment',
        stage: 'transform',
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
        b2bSpecific: true
    },

    // ==========================================================
    // GOVERNANCE RAIL (Top Lane - Cross-Cutting)
    // ==========================================================


    {
        id: 'access_control',
        name: 'Access Control',
        category: 'governance',
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
        category: 'governance',
        icon: 'key',
        vendorProfileAvailability: ['generic'],
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
        category: 'governance',
        icon: 'file-text',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Compliance audit trail.',
        whyItMatters: [
            'Who accessed what when',
            'Compliance audits',
            'Security forensics'
        ],
        inputs: [{ id: 'events_in', name: 'Audit Events', type: 'governance_policies' }],
        outputs: [],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: [],
        isRailNode: true
    },
    {
        id: 'pii_detection',
        name: 'PII Detection',
        category: 'governance',
        icon: 'alert-triangle',
        vendorProfileAvailability: ['generic'],
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
        vendorProfileAvailability: ['generic'],
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
        preferredStackNode: true,
        businessValue: {
            proposition: 'Activate warehouse data to 100+ tools without engineering tickets.',
            impact: 'revenue',
            roi: 'high'
        }
    },
    {
        id: 'adobe_aep',
        name: 'Adobe Experience Platform',
        category: 'activation',
        nodeRole: 'activation_connector',
        stage: 'activation',
        icon: 'layers',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Real-Time CDP for audience activation and profile storage.',
        whyItMatters: [
            'Real-time segmentation',
            'Cross-channel orchestration',
            'Unified profile activation'
        ],
        inputs: [{ id: 'profiles_in', name: 'Unified Profiles', type: 'curated_entities' }],
        outputs: [
            { id: 'audiences_ppl', name: 'People Audiences', type: 'audiences_people' },
            { id: 'audiences_acc', name: 'Account Audiences', type: 'audiences_accounts' }
        ],
        prerequisites: ['mdf_hub'],
        enables: ['activation', 'personalization'],
        recommendedNext: ['adobe_target', 'journey_optimizer', 'meta_ads'],
        preferredStackNode: true,
        businessValue: {
            proposition: 'Activate unified profiles to delivering real-time experiences.',
            impact: 'revenue',
            roi: 'high'
        }
    },
    {
        id: 'census',
        name: 'Census',
        category: 'activation',
        nodeRole: 'activation_connector',
        stage: 'activation',
        uniquenessKey: 'activation:primary',
        cardinality: 'single',
        icon: 'upload',
        vendorProfileAvailability: ['generic'],
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

    // ==========================================================
    // DESTINATIONS
    // ==========================================================

    {
        id: 'salesforce_crm_dest',
        name: 'Salesforce (Sync)',
        category: 'destination',
        nodeRole: 'destination',
        stage: 'destination',
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
        requiredIdentifiers: ['crm_id', 'email'],
        b2bSpecific: true,
        preferredStackNode: true
    },
    {
        id: 'linkedin_ads',
        name: 'LinkedIn Ads',
        category: 'destination',
        nodeRole: 'destination',
        stage: 'destination',
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
        requiredIdentifiers: ['company_domain', 'hashed_email'],
        b2bSpecific: true,
        preferredStackNode: true
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
    },
    // ==========================================================
    // NEW NODES (From Comprehensive Catalog)
    // ==========================================================

    // Databricks Lakehouse

    // Google Cloud

    // Microsoft Fabric

    // Salesforce Data Cloud



    // Segment & mParticle

    // Marketing Tools
    {
        id: 'gong_analytics',
        name: 'Gong',
        category: 'analytics',
        icon: 'mic',
        vendorProfileAvailability: ['generic'],
        description: 'Revenue intelligence and conversation analytics.',
        whyItMatters: ['Deal risks', 'Competitor mentions', 'Pipeline visibility'],
        inputs: [{ id: 'crm_in', name: 'CRM Data', type: 'raw_records' }],
        outputs: [{ id: 'insight_out', name: 'Insights', type: 'metrics' }],
        prerequisites: ['salesforce_crm'],
        enables: ['sales_optimization'],
        recommendedNext: [],
        b2bSpecific: true
    },
    {
        id: 'clari',
        name: 'Clari',
        category: 'analytics',
        icon: 'trending-up',
        vendorProfileAvailability: ['generic'],
        description: 'Forecasting and revenue operations.',
        whyItMatters: ['Pipeline inspection', 'Forecast accuracy', 'Deal health'],
        inputs: [{ id: 'crm_in', name: 'CRM Data', type: 'raw_records' }],
        outputs: [{ id: 'forecast_out', name: 'Forecast', type: 'metrics' }],
        prerequisites: ['salesforce_crm'],
        enables: ['sales_operations'],
        recommendedNext: [],
        b2bSpecific: true
    },
    {
        id: 'pendo',
        name: 'Pendo',
        category: 'analytics',
        icon: 'mouse-pointer',
        vendorProfileAvailability: ['generic'],
        description: 'Product usage analytics and guides.',
        whyItMatters: ['Feature adoption', 'In-app guides', 'NPS surveys'],
        inputs: [{ id: 'app_in', name: 'App Events', type: 'raw_events' }],
        outputs: [{ id: 'usage_out', name: 'Usage Data', type: 'metrics' }],
        prerequisites: [],
        enables: ['product_optimization'],
        recommendedNext: [],
        b2bSpecific: true
    },
    {
        id: 'drift',
        name: 'Drift',
        category: 'destination',
        icon: 'message-circle',
        vendorProfileAvailability: ['generic'],
        description: 'Conversational marketing and sales.',
        whyItMatters: ['Chatbots', 'Live chat', 'Meeting scheduling'],
        inputs: [{ id: 'seg_in', name: 'Segments', type: 'audiences_people' }],
        outputs: [],
        prerequisites: [],
        enables: ['engagement'],
        recommendedNext: [],
        b2bSpecific: true
    },
    {
        id: 'customerio',
        name: 'Customer.io',
        category: 'destination',
        icon: 'mail',
        vendorProfileAvailability: ['generic'],
        description: 'Automated messaging platform.',
        whyItMatters: ['Data-driven emails', 'Push notifications', 'SMS'],
        inputs: [{ id: 'prof_in', name: 'Profiles', type: 'audiences_people' }],
        outputs: [],
        prerequisites: [],
        enables: ['engagement'],
        recommendedNext: [],
        b2bSpecific: true
    },
    {
        id: 'braze',
        name: 'Braze',
        category: 'destination',
        icon: 'smartphone',
        vendorProfileAvailability: ['generic'],
        description: 'Cross-channel customer engagement.',
        whyItMatters: ['Mobile push', 'In-app messages', 'Canvas journeys'],
        inputs: [{ id: 'user_in', name: 'User Profiles', type: 'audiences_people' }],
        outputs: [],
        prerequisites: [],
        enables: ['engagement'],
        recommendedNext: []
    },

    // ==========================================================
    // ADOBE EXPERIENCE PLATFORM NODES
    // ==========================================================
    {
        id: 'adobe_web_sdk',
        name: 'Adobe Web SDK',
        category: 'collection',
        nodeRole: 'collector',
        stage: 'collection',
        icon: 'code',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Adobe Experience Platform Web SDK for unified data collection.',
        whyItMatters: ['Single SDK for Adobe ecosystem', 'Real-time data collection', 'XDM schema enforcement'],
        inputs: [{ id: 'events_in', name: 'Web Events', type: 'raw_events' }],
        outputs: [{ id: 'xdm_out', name: 'XDM Events', type: 'raw_events' }],
        prerequisites: [],
        enables: ['identity', 'personalization'],
        recommendedNext: ['aep_sources']
    },
    {
        id: 'aep_sources',
        name: 'AEP Sources',
        category: 'ingestion',
        nodeRole: 'ingestor',
        stage: 'ingestion',
        icon: 'download',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Adobe Experience Platform source connectors for batch and streaming data.',
        whyItMatters: ['150+ pre-built connectors', 'Schema mapping', 'Data quality validation'],
        inputs: [{ id: 'data_in', name: 'Source Data', type: 'raw_records' }],
        outputs: [{ id: 'xdm_out', name: 'XDM Data', type: 'raw_events' }],
        prerequisites: [],
        enables: ['identity', 'activation'],
        recommendedNext: ['aep_data_lake']
    },
    {
        id: 'aep_data_lake',
        name: 'AEP Data Lake',
        category: 'storage_raw',
        nodeRole: 'storage_raw',
        stage: 'storage_raw',
        icon: 'database',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Adobe Experience Platform Data Lake for unified profile and event storage.',
        whyItMatters: ['Petabyte-scale storage', 'XDM schema enforcement', 'Query Service access'],
        inputs: [{ id: 'xdm_in', name: 'XDM Data', type: 'raw_events' }],
        outputs: [{ id: 'profile_out', name: 'Profile Data', type: 'raw_records' }],
        prerequisites: ['aep_sources'],
        enables: ['identity', 'analytics'],
        recommendedNext: ['aep_identity_service']
    },
    {
        id: 'aep_identity_service',
        name: 'AEP Identity Service',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:hub',
        cardinality: 'single',
        isHub: true,
        icon: 'users',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Real-time identity graph for cross-device and cross-channel identity resolution.',
        whyItMatters: ['Deterministic + probabilistic matching', 'Real-time identity stitching', 'Privacy-compliant'],
        inputs: [{ id: 'profile_in', name: 'Profile Data', type: 'identity_keys' }],
        outputs: [{ id: 'identity_out', name: 'Unified Identity', type: 'identity_keys' }],
        prerequisites: ['aep_data_lake'],
        enables: ['activation', 'personalization'],
        recommendedNext: ['rtcdp_activation', 'journey_optimizer']
    },
    {
        id: 'rtcdp_activation',
        name: 'Real-Time CDP Activation',
        category: 'activation',
        nodeRole: 'activation_connector',
        stage: 'activation',
        icon: 'send',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Adobe Real-Time CDP for audience creation and activation.',
        whyItMatters: ['Real-time audience segmentation', 'Edge personalization', 'Consent-aware activation'],
        inputs: [{ id: 'identity_in', name: 'Unified Profiles', type: 'identity_keys' }],
        outputs: [{ id: 'audience_out', name: 'Audiences', type: 'audiences_people' }],
        prerequisites: ['aep_identity_service'],
        enables: ['personalization', 'activation'],
        recommendedNext: ['journey_optimizer', 'adobe_target']
    },
    {
        id: 'rtcdp_profile',
        name: 'RTCDP Profile Store',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:hub',
        cardinality: 'single',
        isHub: true,
        icon: 'user',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Real-time customer profile store for unified customer view.',
        whyItMatters: ['Sub-second profile access', 'Merge policies', 'Computed attributes'],
        inputs: [{ id: 'identity_in', name: 'Identity Data', type: 'identity_keys' }],
        outputs: [{ id: 'profile_out', name: 'Unified Profile', type: 'raw_records' }],
        prerequisites: ['aep_identity_service'],
        enables: ['personalization'],
        recommendedNext: ['rtcdp_activation']
    },
    {
        id: 'journey_optimizer',
        name: 'Adobe Journey Optimizer',
        category: 'destination',
        icon: 'navigation',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Orchestrate personalized journeys across email, push, SMS, and in-app.',
        whyItMatters: ['Cross-channel orchestration', 'AI-powered optimization', 'Real-time triggers'],
        inputs: [{ id: 'audience_in', name: 'Audiences', type: 'audiences_people' }],
        outputs: [],
        prerequisites: ['rtcdp_activation'],
        enables: ['engagement'],
        recommendedNext: []
    },
    {
        id: 'adobe_analytics',
        name: 'Adobe Analytics',
        category: 'analytics',
        icon: 'bar-chart-2',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Enterprise web and app analytics for deep behavioral insights.',
        whyItMatters: ['Pathing analysis', 'Custom dimensions', 'Attribution modeling'],
        inputs: [{ id: 'events_in', name: 'Event Data', type: 'raw_events' }],
        outputs: [{ id: 'insights_out', name: 'Insights', type: 'raw_records' }],
        prerequisites: [],
        enables: ['measurement'],
        recommendedNext: ['aep_sources', 'customer_journey_analytics']
    },
    {
        id: 'customer_journey_analytics',
        name: 'Customer Journey Analytics',
        category: 'analytics',
        icon: 'trending-up',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Cross-channel journey analysis built on AEP data.',
        whyItMatters: ['Unified data analysis', 'Cross-channel attribution', 'AI insights'],
        inputs: [{ id: 'profile_in', name: 'Profile Data', type: 'raw_records' }],
        outputs: [{ id: 'insights_out', name: 'Journey Insights', type: 'raw_records' }],
        prerequisites: ['aep_data_lake'],
        enables: ['measurement'],
        recommendedNext: []
    },
    {
        id: 'adobe_target',
        name: 'Adobe Target',
        category: 'destination',
        icon: 'target',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'A/B testing and AI-powered personalization.',
        whyItMatters: ['Automated personalization', 'Edge decisioning', 'Multivariate testing'],
        inputs: [{ id: 'audience_in', name: 'Audiences', type: 'audiences_people' }],
        outputs: [],
        prerequisites: ['rtcdp_activation'],
        enables: ['personalization'],
        recommendedNext: []
    },
    {
        id: 'aep_data_governance',
        name: 'AEP Data Governance',
        category: 'governance',
        icon: 'shield',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Data labeling, policies, and enforcement for regulatory compliance.',
        whyItMatters: ['GDPR/CCPA compliance', 'Data lineage', 'Policy enforcement'],
        inputs: [],
        outputs: [],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: ['privacy_service'],
        isRailNode: true
    },
    {
        id: 'privacy_service',
        name: 'Privacy Service',
        category: 'governance',
        icon: 'lock',
        vendorProfileAvailability: ['adobe_summit'],
        description: 'Centralized privacy request management for GDPR, CCPA, and LGPD.',
        whyItMatters: ['Automated DSR fulfillment', 'Audit trails', 'Cross-application privacy'],
        inputs: [],
        outputs: [],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: [],
        isRailNode: true
    },
    {
        id: 'aep_b2b_profiles',
        name: 'AEP B2B Edition',
        category: 'identity',
        icon: 'briefcase',
        vendorProfileAvailability: ['adobe_summit', 'generic'],
        description: 'B2B-specific identity and account profiles.',
        whyItMatters: ['Account hierarchies', 'Buying groups', 'Opportunity linking'],
        inputs: [{ id: 'crm_in', name: 'CRM Data', type: 'crm_data' }],
        outputs: [{ id: 'account_out', name: 'Account Profiles', type: 'identity_resolution' }],
        prerequisites: ['aep_identity_service'],
        enables: ['activation'],
        recommendedNext: ['marketo'],
        isRailNode: true,
        railPosition: 'center',
        b2bSpecific: true
    },

    // ==========================================================
    // SALESFORCE DATA CLOUD NODES
    // ==========================================================
    {
        id: 'salesforce_cdp_connector',
        name: 'Data Cloud Connector',
        category: 'ingestion',
        nodeRole: 'ingestor',
        stage: 'ingestion',
        icon: 'plug',
        vendorProfileAvailability: ['generic'],
        description: 'Connect Salesforce clouds and external systems to Data Cloud.',
        whyItMatters: ['Native Salesforce integration', 'Pre-built connectors', 'Real-time streaming'],
        inputs: [{ id: 'data_in', name: 'CRM/Cloud Data', type: 'raw_records' }],
        outputs: [{ id: 'dm_out', name: 'Data Model Objects', type: 'stream_events' }],
        prerequisites: [],
        enables: ['identity', 'activation'],
        recommendedNext: ['salesforce_data_cloud']
    },
    {
        id: 'salesforce_data_cloud',
        name: 'Salesforce Data Cloud',
        category: 'storage_warehouse',
        nodeRole: 'warehouse',
        stage: 'storage_warehouse',
        uniquenessKey: 'storage:warehouse',
        cardinality: 'single',
        icon: 'cloud',
        vendorProfileAvailability: ['generic'],
        description: 'Hyperscale data platform powering unified customer profiles.',
        whyItMatters: ['Petabyte scale', 'Native Tableau integration', 'Einstein AI readiness'],
        inputs: [{ id: 'dm_in', name: 'Data Model Objects', type: 'stream_events' }],
        outputs: [{ id: 'profile_out', name: 'Unified Profiles', type: 'raw_records' }],
        prerequisites: ['salesforce_cdp_connector'],
        enables: ['identity', 'analytics', 'activation'],
        recommendedNext: ['salesforce_data_cloud_identity']
    },
    {
        id: 'salesforce_data_cloud_identity',
        name: 'Data Cloud Identity Resolution',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:hub',
        cardinality: 'single',
        isHub: true,
        icon: 'users',
        vendorProfileAvailability: ['generic'],
        description: 'AI-powered identity resolution for customer 360.',
        whyItMatters: ['Match rules engine', 'Probabilistic matching', 'Unified person/account'],
        inputs: [{ id: 'profile_in', name: 'Profile Data', type: 'identity_keys' }],
        outputs: [{ id: 'unified_out', name: 'Unified Identity', type: 'identity_keys' }],
        prerequisites: ['salesforce_data_cloud'],
        enables: ['activation', 'personalization'],
        recommendedNext: ['tableau', 'journey_builder']
    },
    {
        id: 'marketing_cloud',
        name: 'Marketing Cloud',
        category: 'sources',
        icon: 'mail',
        vendorProfileAvailability: ['generic'],
        description: 'Email, mobile, advertising, and social marketing platform.',
        whyItMatters: ['Enterprise email at scale', 'Journey orchestration', 'Cross-channel messaging'],
        inputs: [],
        outputs: [{ id: 'engagement_out', name: 'Engagement Data', type: 'raw_records' }],
        prerequisites: [],
        enables: ['measurement', 'identity'],
        recommendedNext: ['salesforce_cdp_connector']
    },
    {
        id: 'journey_builder',
        name: 'Journey Builder',
        category: 'destination',
        icon: 'git-branch',
        vendorProfileAvailability: ['generic'],
        description: 'Visual journey orchestration across all Salesforce channels.',
        whyItMatters: ['Drag-and-drop journeys', 'AI-powered optimization', 'Cross-channel'],
        inputs: [{ id: 'audience_in', name: 'Segments', type: 'audiences_people' }],
        outputs: [],
        prerequisites: ['salesforce_data_cloud_identity'],
        enables: ['engagement'],
        recommendedNext: []
    },
    {
        id: 'commerce_cloud',
        name: 'Commerce Cloud',
        category: 'sources',
        icon: 'shopping-cart',
        vendorProfileAvailability: ['generic'],
        description: 'B2C and B2B commerce platform with headless capabilities.',
        whyItMatters: ['E-commerce data', 'Purchase history', 'Cart abandonment signals'],
        inputs: [],
        outputs: [{ id: 'commerce_out', name: 'Commerce Events', type: 'raw_events' }],
        prerequisites: [],
        enables: ['measurement', 'personalization'],
        recommendedNext: ['salesforce_cdp_connector']
    },
    {
        id: 'mulesoft',
        name: 'MuleSoft',
        category: 'ingestion',
        nodeRole: 'ingestor',
        stage: 'ingestion',
        icon: 'zap',
        vendorProfileAvailability: ['generic'],
        description: 'API-led connectivity and integration platform.',
        whyItMatters: ['Enterprise integration', 'API management', 'Event-driven architecture'],
        inputs: [{ id: 'api_in', name: 'API Data', type: 'dataset_raw' }],
        outputs: [{ id: 'api_out', name: 'Connected Data', type: 'stream_events' }],
        prerequisites: [],
        enables: ['integration'],
        recommendedNext: ['salesforce_cdp_connector']
    },
    {
        id: 'salesforce_shield',
        name: 'Salesforce Shield',
        category: 'governance',
        icon: 'shield',
        vendorProfileAvailability: ['generic'],
        description: 'Platform encryption, event monitoring, and field audit trail.',
        whyItMatters: ['Data encryption', 'Compliance monitoring', 'Audit trails'],
        inputs: [],
        outputs: [],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: [],
        isRailNode: true
    },
    {
        id: 'slack_alerts',
        name: 'Slack Alerts',
        category: 'destination',
        icon: 'message-circle',
        vendorProfileAvailability: ['generic'],
        description: 'Real-time Slack notifications for sales and marketing signals.',
        whyItMatters: ['Instant notifications', 'Workflow automation', 'Team collaboration'],
        inputs: [{ id: 'event_in', name: 'Alert Events', type: 'raw_events' }],
        outputs: [],
        prerequisites: [],
        enables: ['engagement'],
        recommendedNext: []
    },

    // ==========================================================
    // DATABRICKS NODES
    // ==========================================================
    {
        id: 'delta_lake_bronze',
        name: 'Delta Lake (Bronze)',
        category: 'storage_raw',
        nodeRole: 'storage_raw',
        stage: 'storage_raw',
        uniquenessKey: 'storage:raw',
        cardinality: 'single',
        icon: 'database',
        vendorProfileAvailability: ['generic'],
        description: 'Raw ingestion layer with schema enforcement and time travel.',
        whyItMatters: ['ACID transactions', 'Schema evolution', 'Time travel'],
        inputs: [{ id: 'stream_in', name: 'Raw Data', type: 'stream_events' }],
        outputs: [{ id: 'delta_out', name: 'Bronze Tables', type: 'raw_records' }],
        prerequisites: [],
        enables: ['transformation'],
        recommendedNext: ['delta_lake_silver', 'databricks_sql']
    },
    {
        id: 'delta_lake_silver',
        name: 'Delta Lake (Silver)',
        category: 'storage_warehouse',
        nodeRole: 'warehouse',
        stage: 'storage_warehouse',
        uniquenessKey: 'storage:warehouse',
        cardinality: 'single',
        icon: 'layers',
        vendorProfileAvailability: ['generic'],
        description: 'Cleansed and enriched data layer.',
        whyItMatters: ['Data quality', 'Business rules applied', 'Reusable datasets'],
        inputs: [{ id: 'bronze_in', name: 'Bronze Tables', type: 'raw_records' }],
        outputs: [{ id: 'silver_out', name: 'Silver Tables', type: 'raw_records' }],
        prerequisites: ['delta_lake_bronze'],
        enables: ['transformation', 'analytics'],
        recommendedNext: ['delta_lake_gold']
    },
    {
        id: 'delta_lake_gold',
        name: 'Delta Lake (Gold)',
        category: 'transform',
        nodeRole: 'transform',
        stage: 'transform',
        uniquenessKey: 'transform:primary',
        cardinality: 'single',
        icon: 'star',
        vendorProfileAvailability: ['generic'],
        description: 'Business-level aggregates and curated datasets.',
        whyItMatters: ['Business metrics', 'Performance optimized', 'Analytics ready'],
        inputs: [{ id: 'silver_in', name: 'Silver Tables', type: 'raw_records' }],
        outputs: [{ id: 'gold_out', name: 'Gold Tables', type: 'raw_records' }],
        prerequisites: ['delta_lake_silver'],
        enables: ['analytics', 'activation'],
        recommendedNext: ['databricks_sql']
    },
    {
        id: 'databricks_sql',
        name: 'Databricks SQL',
        category: 'analytics',
        icon: 'terminal',
        vendorProfileAvailability: ['generic'],
        description: 'Serverless SQL analytics with photon acceleration.',
        whyItMatters: ['Sub-second queries', 'Native BI integration', 'Cost-effective'],
        inputs: [{ id: 'delta_in', name: 'Delta Tables', type: 'raw_records' }],
        outputs: [{ id: 'sql_out', name: 'Query Results', type: 'raw_records' }],
        prerequisites: ['delta_lake_bronze'],
        enables: ['analytics', 'activation'],
        recommendedNext: ['tableau', 'hightouch']
    },
    {
        id: 'unity_catalog_identity',
        name: 'Unity Catalog Identity',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:hub',
        cardinality: 'single',
        isHub: true,
        icon: 'users',
        vendorProfileAvailability: ['generic'],
        description: 'Unified identity and access management for the lakehouse.',
        whyItMatters: ['Fine-grained access', 'Data lineage', 'Cross-workspace governance'],
        inputs: [{ id: 'data_in', name: 'Lakehouse Data', type: 'identity_keys' }],
        outputs: [{ id: 'identity_out', name: 'Unified Identity', type: 'identity_keys' }],
        prerequisites: ['databricks_sql'],
        enables: ['governance', 'identity'],
        recommendedNext: ['hightouch']
    },
    {
        id: 'unity_catalog_governance',
        name: 'Unity Catalog Governance',
        category: 'governance',
        icon: 'shield',
        vendorProfileAvailability: ['generic'],
        description: 'Centralized governance for data, AI, and analytics.',
        whyItMatters: ['Data lineage', 'Access control', 'Compliance'],
        inputs: [],
        outputs: [],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: [],
        isRailNode: true
    },
    {
        id: 'spark_streaming',
        name: 'Spark Streaming',
        category: 'ingestion',
        icon: 'radio',
        vendorProfileAvailability: ['generic'],
        description: 'Real-time stream processing with structured streaming.',
        whyItMatters: ['Exactly-once semantics', 'Low latency', 'Unified batch/stream'],
        inputs: [{ id: 'stream_in', name: 'Event Stream', type: 'stream_events' }],
        outputs: [{ id: 'delta_out', name: 'Delta Tables', type: 'stream_events' }],
        prerequisites: ['kafka'],
        enables: ['real-time'],
        recommendedNext: ['delta_lake_bronze']
    },
    {
        id: 'kafka',
        name: 'Apache Kafka',
        category: 'ingestion',
        icon: 'radio',
        vendorProfileAvailability: ['generic'],
        description: 'Distributed event streaming platform.',
        whyItMatters: ['High throughput', 'Durability', 'Real-time pipelines'],
        inputs: [{ id: 'events_in', name: 'Events', type: 'raw_events' }],
        outputs: [{ id: 'stream_out', name: 'Event Stream', type: 'stream_events' }],
        prerequisites: [],
        enables: ['real-time'],
        recommendedNext: ['spark_streaming']
    },

    // ==========================================================
    // ANALYTICS & BI
    // ==========================================================

    // Legacy Analytics
    {
        id: 'universal_analytics',
        name: 'Universal Analytics (UA)',
        category: 'analytics',
        nodeRole: 'analytics',
        stage: 'analytics',
        icon: 'bar-chart',
        vendorProfileAvailability: [],
        description: 'Legacy web analytics (Sunsetted).',
        whenToUse: 'Legacy systems only.',
        whyItMatters: [
            'No longer supported',
            'Data loss risk',
            'Privacy compliance gaps'
        ],
        inputs: [{ id: 'entities_in', name: 'Web Data', type: 'raw_events' }],
        outputs: [],
        prerequisites: [],
        enables: [],
        recommendedNext: ['google_analytics_4', 'amplitude'],
        complexity: 4,
        costEstimate: 'low',
        supportedLatency: ['batch'],
        businessValue: {
            proposition: 'Obsolete analytics platform with compliance risks.',
            impact: 'risk',
            roi: 'low'
        }
    },

    {
        id: 'google_analytics_4',
        name: 'Google Analytics 4',
        category: 'analytics',
        nodeRole: 'analytics',
        stage: 'analytics',
        icon: 'bar-chart-2',
        vendorProfileAvailability: ['generic'],
        description: 'Event-based analytics with BigQuery export.',
        whyItMatters: ['Free BigQuery export', 'Machine learning ready', 'Cross-platform'],
        inputs: [{ id: 'events_in', name: 'Web/App Events', type: 'raw_events' }],
        outputs: [{ id: 'ga_out', name: 'GA4 Events', type: 'stream_events' }],
        prerequisites: [],
        enables: ['measurement'],
        recommendedNext: ['pubsub', 'bigquery']
    },
    {
        id: 'pubsub',
        name: 'Google Pub/Sub',
        category: 'ingestion',
        nodeRole: 'ingestor',
        stage: 'ingestion',
        uniquenessKey: 'ingestor:pubsub',
        icon: 'radio',
        vendorProfileAvailability: ['generic'],
        description: 'Serverless messaging for event-driven architectures.',
        whyItMatters: ['Serverless', 'Global scale', 'At-least-once delivery'],
        inputs: [{ id: 'events_in', name: 'Events', type: 'raw_events' }],
        outputs: [{ id: 'stream_out', name: 'Event Stream', type: 'stream_events' }],
        prerequisites: [],
        enables: ['real-time'],
        recommendedNext: ['dataflow']
    },
    {
        id: 'dataflow',
        name: 'Google Dataflow',
        category: 'ingestion',
        nodeRole: 'ingestor',
        stage: 'ingestion',
        uniquenessKey: 'ingestor:dataflow',
        icon: 'git-merge',
        vendorProfileAvailability: ['generic'],
        description: 'Serverless stream and batch data processing.',
        whyItMatters: ['Unified batch/stream', 'Auto-scaling', 'Apache Beam'],
        inputs: [{ id: 'stream_in', name: 'Event Stream', type: 'stream_events' }],
        outputs: [{ id: 'table_out', name: 'Processed Data', type: 'raw_records' }],
        prerequisites: ['pubsub'],
        enables: ['transformation'],
        recommendedNext: ['bigquery', 'gcs_raw']
    },
    {
        id: 'gcs_raw',
        name: 'Cloud Storage',
        category: 'storage_raw',
        nodeRole: 'storage_raw',
        stage: 'storage_raw',
        uniquenessKey: 'storage:raw:gcs',
        cardinality: 'single',
        icon: 'hard-drive',
        vendorProfileAvailability: ['generic'],
        description: 'Object storage for data lake and raw files.',
        whyItMatters: ['Unlimited scale', 'Cost-effective', 'BigQuery external tables'],
        inputs: [{ id: 'data_in', name: 'Raw Data', type: 'dataset_raw' }],
        outputs: [{ id: 'data_out', name: 'Stored Data', type: 'raw_records' }],
        prerequisites: [],
        enables: ['storage'],
        recommendedNext: ['bigquery']
    },
    {
        id: 'dataform',
        name: 'Dataform',
        category: 'transform',
        nodeRole: 'transform',
        stage: 'transform',
        uniquenessKey: 'transform:primary',
        icon: 'layers',
        vendorProfileAvailability: ['generic'],
        description: 'SQL-based data transformation and orchestration.',
        whyItMatters: ['Native BigQuery', 'Version control', 'Data quality checks'],
        inputs: [{ id: 'bq_in', name: 'BigQuery Tables', type: 'raw_records' }],
        outputs: [{ id: 'model_out', name: 'Transformed Tables', type: 'raw_records' }],
        prerequisites: ['bigquery'],
        enables: ['transformation'],
        recommendedNext: ['looker', 'census']
    },
    {
        id: 'dataplex',
        name: 'Dataplex',
        category: 'governance',
        nodeRole: 'governance',
        uniquenessKey: 'gov:dataplex',
        icon: 'shield',
        vendorProfileAvailability: ['generic'],
        description: 'Unified data management and governance.',
        whyItMatters: ['Data discovery', 'Quality management', 'Policy enforcement'],
        inputs: [],
        outputs: [],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: ['data_catalog'],
        isRailNode: true
    },
    {
        id: 'data_catalog',
        name: 'Data Catalog',
        category: 'governance',
        nodeRole: 'governance',
        icon: 'book',
        vendorProfileAvailability: ['generic'],
        description: 'Metadata management and data discovery.',
        whyItMatters: ['Searchable metadata', 'Data lineage', 'Business glossary'],
        inputs: [],
        outputs: [],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: [],
        isRailNode: true
    },
    {
        id: 'gtm',
        name: 'Google Tag Manager',
        category: 'collection',
        nodeRole: 'collector',
        stage: 'collection',
        icon: 'tag',
        vendorProfileAvailability: ['generic'],
        description: 'Tag management for marketing and analytics.',
        whyItMatters: ['No-code tag deployment', 'Server-side tagging', 'Debug mode'],
        inputs: [],
        outputs: [{ id: 'events_out', name: 'Tag Events', type: 'raw_events' }],
        prerequisites: [],
        enables: ['measurement'],
        recommendedNext: ['google_analytics_4', 'pubsub']
    },
    {
        id: 'google_ads',
        name: 'Google Ads',
        category: 'destination',
        nodeRole: 'destination',
        stage: 'destination',
        icon: 'dollar-sign',
        vendorProfileAvailability: ['generic'],
        description: 'Paid search and display advertising.',
        whyItMatters: ['Customer match', 'Conversion import', 'Audience sync'],
        inputs: [{ id: 'audience_in', name: 'Customer Lists', type: 'audiences_people' }],
        outputs: [],
        prerequisites: [],
        enables: ['activation'],
        recommendedNext: []
    },

    // ==========================================================
    // MICROSOFT FABRIC NODES
    // ==========================================================
    {
        id: 'onelake',
        name: 'OneLake',
        category: 'storage_raw',
        nodeRole: 'storage_raw',
        stage: 'storage_raw',
        uniquenessKey: 'storage:raw',
        cardinality: 'single',
        icon: 'database',
        vendorProfileAvailability: ['generic'],
        description: 'Unified data lake storage for Microsoft Fabric.',
        whyItMatters: ['Single copy of data', 'Cross-workload access', 'Delta Lake format'],
        inputs: [{ id: 'data_in', name: 'Raw Data', type: 'dataset_raw' }],
        outputs: [{ id: 'lake_out', name: 'Lake Data', type: 'raw_records' }],
        prerequisites: [],
        enables: ['storage'],
        recommendedNext: ['fabric_warehouse']
    },
    {
        id: 'fabric_warehouse',
        name: 'Fabric Warehouse',
        category: 'storage_warehouse',
        nodeRole: 'warehouse',
        stage: 'storage_warehouse',
        uniquenessKey: 'storage:warehouse',
        cardinality: 'single',
        icon: 'server',
        vendorProfileAvailability: ['generic'],
        description: 'T-SQL data warehouse with automatic optimization.',
        whyItMatters: ['Familiar T-SQL', 'Auto-optimization', 'Direct Lake mode'],
        inputs: [{ id: 'lake_in', name: 'OneLake Data', type: 'raw_records' }],
        outputs: [{ id: 'wh_out', name: 'Warehouse Tables', type: 'raw_records' }],
        prerequisites: ['onelake'],
        enables: ['analytics'],
        recommendedNext: ['power_bi_datasets']
    },
    {
        id: 'power_bi_datasets',
        name: 'Power BI Semantic Models',
        category: 'analytics',
        nodeRole: 'transform',
        stage: 'transform',
        uniquenessKey: 'semantic:primary',
        icon: 'pie-chart',
        vendorProfileAvailability: ['generic'],
        description: 'Business semantic layer with measures and relationships.',
        whyItMatters: ['Define once, use everywhere', 'Row-level security', 'DAX measures'],
        inputs: [{ id: 'wh_in', name: 'Warehouse Tables', type: 'raw_records' }],
        outputs: [{ id: 'semantic_out', name: 'Semantic Model', type: 'raw_records' }],
        prerequisites: ['fabric_warehouse'],
        enables: ['analytics'],
        recommendedNext: ['power_bi']
    },
    {
        id: 'power_bi',
        name: 'Power BI',
        category: 'analytics',
        nodeRole: 'analytics',
        stage: 'analytics',
        icon: 'bar-chart-2',
        vendorProfileAvailability: ['generic'],
        description: 'Interactive dashboards and reports.',
        whyItMatters: ['Self-service BI', 'Natural language Q&A', 'Mobile native'],
        inputs: [{ id: 'semantic_in', name: 'Semantic Model', type: 'raw_records' }],
        outputs: [],
        prerequisites: ['power_bi_datasets'],
        enables: ['measurement'],
        recommendedNext: []
    },
    {
        id: 'dynamics_365',
        name: 'Dynamics 365',
        category: 'sources',
        icon: 'briefcase',
        vendorProfileAvailability: ['generic'],
        description: 'Microsoft CRM and ERP applications.',
        whyItMatters: ['Native integration', 'Customer data', 'Business processes'],
        inputs: [],
        outputs: [{ id: 'crm_out', name: 'CRM Data', type: 'raw_records' }],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['onelake', 'adls_gen2']
    },
    {
        id: 'adls_gen2',
        name: 'ADLS Gen2',
        category: 'storage_raw',
        icon: 'hard-drive',
        vendorProfileAvailability: ['generic'],
        description: 'Azure Data Lake Storage Gen2.',
        whyItMatters: ['Hierarchical namespace', 'Enterprise security', 'Hadoop compatible'],
        inputs: [{ id: 'data_in', name: 'Raw Data', type: 'dataset_raw' }],
        outputs: [{ id: 'lake_out', name: 'Lake Data', type: 'raw_records' }],
        prerequisites: [],
        enables: ['storage'],
        recommendedNext: ['fabric_warehouse']
    },
    {
        id: 'synapse_pipelines',
        name: 'Synapse Pipelines',
        category: 'ingestion',
        icon: 'git-branch',
        vendorProfileAvailability: ['generic'],
        description: 'Data integration and orchestration.',
        whyItMatters: ['90+ connectors', 'Mapping data flows', 'Scheduling'],
        inputs: [{ id: 'source_in', name: 'Source Data', type: 'dataset_raw' }],
        outputs: [{ id: 'lake_out', name: 'Lake Data', type: 'stream_events' }],
        prerequisites: [],
        enables: ['integration'],
        recommendedNext: ['onelake']
    },
    {
        id: 'azure_event_grid',
        name: 'Azure Event Grid',
        category: 'ingestion',
        icon: 'radio',
        vendorProfileAvailability: ['generic'],
        description: 'Event-driven messaging service.',
        whyItMatters: ['Serverless', 'Real-time events', 'Native Azure integration'],
        inputs: [{ id: 'events_in', name: 'Events', type: 'raw_events' }],
        outputs: [{ id: 'stream_out', name: 'Event Stream', type: 'stream_events' }],
        prerequisites: [],
        enables: ['real-time'],
        recommendedNext: ['onelake']
    },
    {
        id: 'azure_purview',
        name: 'Microsoft Purview',
        category: 'governance',
        icon: 'shield',
        vendorProfileAvailability: ['generic'],
        description: 'Unified data governance for Azure and multi-cloud.',
        whyItMatters: ['Data catalog', 'Sensitivity labels', 'Data lineage'],
        inputs: [],
        outputs: [],
        prerequisites: [],
        enables: ['governance'],
        recommendedNext: [],
        isRailNode: true
    },

    // ==========================================================
    // CLEAN ROOM NODES
    // ==========================================================
    {
        id: 'aws_clean_rooms',
        name: 'AWS Clean Rooms',
        category: 'analytics',
        nodeRole: 'analytics',
        stage: 'analytics',
        uniquenessKey: 'analytics:dcr',
        icon: 'lock',
        vendorProfileAvailability: ['generic'],
        description: 'Privacy-safe data collaboration on AWS.',
        whyItMatters: ['No data movement', 'Cryptographic controls', 'Pre-built templates'],
        inputs: [{ id: 'data_in', name: 'Partner Data', type: 'raw_records' }],
        outputs: [{ id: 'insights_out', name: 'Aggregated Insights', type: 'raw_records' }],
        prerequisites: ['snowflake'],
        enables: ['measurement', 'second_party'],
        recommendedNext: ['measurement_aggregates']
    },
    {
        id: 'snowflake_clean_rooms',
        name: 'Snowflake Clean Rooms',
        category: 'analytics',
        nodeRole: 'analytics',
        stage: 'analytics',
        uniquenessKey: 'analytics:dcr',
        icon: 'lock',
        vendorProfileAvailability: ['generic'],
        description: 'Data Clean Rooms powered by Snowflake.',
        whyItMatters: ['Native DCR', 'Python UDFs', 'Secure sharing'],
        inputs: [{ id: 'data_in', name: 'Shared Data', type: 'raw_records' }],
        outputs: [{ id: 'insights_out', name: 'DCR Results', type: 'raw_records' }],
        prerequisites: ['snowflake'],
        enables: ['measurement', 'second_party'],
        recommendedNext: ['measurement_aggregates']
    },
    {
        id: 'liveramp',
        name: 'LiveRamp',
        category: 'activation',
        nodeRole: 'activation_connector',
        stage: 'activation',
        icon: 'share-2',
        vendorProfileAvailability: ['generic'],
        description: 'Identity resolution and data connectivity.',
        whyItMatters: ['RampID graph', 'Authenticated traffic', 'Privacy-safe'],
        inputs: [{ id: 'identity_in', name: 'First-party Data', type: 'identity_keys' }],
        outputs: [{ id: 'audience_out', name: 'Encoded Audiences', type: 'audiences_people' }],
        prerequisites: [],
        enables: ['activation', 'measurement'],
        recommendedNext: ['facebook_ads', 'the_trade_desk']
    },
    {
        id: 'measurement_aggregates',
        name: 'Measurement Aggregates',
        category: 'analytics',
        icon: 'pie-chart',
        vendorProfileAvailability: ['generic'],
        description: 'Privacy-preserving measurement through aggregation.',
        whyItMatters: ['Differential privacy', 'K-anonymity', 'Regulatory compliant'],
        inputs: [{ id: 'clean_in', name: 'Clean Room Data', type: 'raw_records' }],
        outputs: [{ id: 'agg_out', name: 'Aggregate Reports', type: 'raw_records' }],
        prerequisites: ['aws_clean_rooms'],
        enables: ['measurement'],
        recommendedNext: []
    },
    {
        id: 'the_trade_desk',
        name: 'The Trade Desk',
        category: 'destination',
        nodeRole: 'destination',
        stage: 'destination',
        icon: 'monitor',
        vendorProfileAvailability: ['generic'],
        description: 'Programmatic advertising DSP.',
        whyItMatters: ['UID2 native', 'Retail media', 'CTV advertising'],
        inputs: [{ id: 'audience_in', name: 'Audiences', type: 'audiences_people' }],
        outputs: [],
        prerequisites: [],
        enables: ['activation'],
        recommendedNext: []
    },

    // ==========================================================
    // ABM & INTENT NODES
    // ==========================================================
    {
        id: 'sixsense',
        name: '6sense',
        category: 'activation',
        nodeRole: 'activation_connector',
        stage: 'activation',
        uniquenessKey: 'activation:sixsense',
        icon: 'target',
        vendorProfileAvailability: ['generic'],
        description: 'B2B intent data and account-based orchestration.',
        whyItMatters: ['Intent signals', 'Buying stage prediction', 'Account identification'],
        inputs: [{ id: 'account_in', name: 'Account Data', type: 'identity_keys' }],
        outputs: [{ id: 'intent_out', name: 'Intent Signals', type: 'raw_records' }],
        prerequisites: [],
        enables: ['account_intelligence', 'activation'],
        recommendedNext: ['salesforce_crm', 'sixsense_orchestration'],
        b2bSpecific: true
    },
    {
        id: 'sixsense_orchestration',
        name: '6sense Orchestration',
        category: 'activation',
        nodeRole: 'activation_connector',
        stage: 'activation',
        icon: 'git-branch',
        vendorProfileAvailability: ['generic'],
        description: 'Multi-channel ABM campaign orchestration.',
        whyItMatters: ['Personalized ads', 'Email sync', 'Sales alerts'],
        inputs: [{ id: 'intent_in', name: 'Intent Data', type: 'raw_records' }],
        outputs: [{ id: 'campaign_out', name: 'Campaigns', type: 'audiences_people' }],
        prerequisites: ['sixsense'],
        enables: ['activation'],
        recommendedNext: ['linkedin_ads'],
        b2bSpecific: true
    },
    {
        id: 'bombora',
        name: 'Bombora',
        category: 'sources',
        icon: 'trending-up',
        vendorProfileAvailability: ['generic'],
        description: 'B2B intent data from content consumption.',
        whyItMatters: ['Topic-level intent', 'Company surge scores', 'Data cooperative'],
        inputs: [],
        outputs: [{ id: 'intent_out', name: 'Intent Signals', type: 'raw_records' }],
        prerequisites: [],
        enables: ['account_intelligence'],
        recommendedNext: ['snowflake', 'sixsense'],
        b2bSpecific: true
    },
    {
        id: 'zoominfo',
        name: 'ZoomInfo',
        category: 'sources',
        icon: 'search',
        vendorProfileAvailability: ['generic'],
        description: 'B2B contact and company intelligence.',
        whyItMatters: ['Contact data', 'Org charts', 'Buyer intent'],
        inputs: [],
        outputs: [{ id: 'contact_out', name: 'Contact Data', type: 'identity_keys' }],
        prerequisites: [],
        enables: ['identity', 'prospecting'],
        recommendedNext: ['salesforce_crm', 'outreach'],
        b2bSpecific: true
    },

    // ==========================================================
    // SALES ACTIVATION NODES
    // ==========================================================
    {
        id: 'outreach',
        name: 'Outreach',
        category: 'destination',
        icon: 'phone',
        vendorProfileAvailability: ['generic'],
        description: 'Sales engagement platform for sequences.',
        whyItMatters: ['Cadence automation', 'Email tracking', 'Call coaching'],
        inputs: [{ id: 'lead_in', name: 'Leads', type: 'audiences_people' }],
        outputs: [],
        prerequisites: [],
        enables: ['engagement'],
        recommendedNext: [],
        b2bSpecific: true
    },
    {
        id: 'salesloft',
        name: 'Salesloft',
        category: 'destination',
        icon: 'phone-call',
        vendorProfileAvailability: ['generic'],
        description: 'Revenue workflow platform.',
        whyItMatters: ['Cadence builder', 'Conversation intelligence', 'Forecasting'],
        inputs: [{ id: 'lead_in', name: 'Leads', type: 'audiences_people' }],
        outputs: [],
        prerequisites: [],
        enables: ['engagement'],
        recommendedNext: [],
        b2bSpecific: true
    },

    // ==========================================================
    // HUBSPOT SPECIFIC NODES
    // ==========================================================
    {
        id: 'hubspot_tracking',
        name: 'HubSpot Tracking',
        category: 'collection',
        nodeRole: 'collector',
        stage: 'collection',
        icon: 'eye',
        vendorProfileAvailability: ['generic'],
        description: 'Website visitor tracking and form capture.',
        whyItMatters: ['No-code setup', 'Form enrichment', 'Chat integration'],
        inputs: [{ id: 'events_in', name: 'Web Events', type: 'raw_events' }],
        outputs: [{ id: 'contact_out', name: 'Contacts', type: 'identity_keys' }],
        prerequisites: [],
        enables: ['identity'],
        recommendedNext: ['hubspot_crm']
    },
    {
        id: 'hubspot_companies',
        name: 'HubSpot Companies',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:hub',
        cardinality: 'single',
        isHub: true,
        icon: 'building',
        vendorProfileAvailability: ['generic'],
        description: 'Company records with automatic enrichment.',
        whyItMatters: ['Auto-enrichment', 'Contact-company linking', 'Deal association'],
        inputs: [{ id: 'contact_in', name: 'Contacts', type: 'identity_keys' }],
        outputs: [{ id: 'company_out', name: 'Companies', type: 'identity_keys' }],
        prerequisites: ['hubspot_crm'],
        enables: ['identity', 'activation'],
        recommendedNext: ['linkedin_ads'],
        b2bSpecific: true
    },

    // ==========================================================
    // SEGMENT SPECIFIC NODES
    // ==========================================================
    {
        id: 'segment_profiles',
        name: 'Segment Profiles',
        category: 'identity',
        icon: 'user',
        vendorProfileAvailability: ['generic'],
        description: 'Unified customer profiles in Segment.',
        whyItMatters: ['Real-time unification', 'Trait computation', 'Predictive traits'],
        inputs: [{ id: 'events_in', name: 'Events', type: 'stream_events' }],
        outputs: [{ id: 'profile_out', name: 'Unified Profiles', type: 'identity_keys' }],
        prerequisites: ['segment'],
        enables: ['identity', 'activation'],
        recommendedNext: ['segment_engage'],
        isHub: true
    },
    {
        id: 'segment_profiles',
        name: 'Segment Profiles',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:hub',
        cardinality: 'single',
        isHub: true,
        icon: 'user',
        vendorProfileAvailability: ['generic'],
        description: 'Unified customer profiles in Segment.',
        whyItMatters: ['Real-time unification', 'Trait computation', 'Predictive traits'],
        inputs: [{ id: 'events_in', name: 'Events', type: 'stream_events' }],
        outputs: [{ id: 'profile_out', name: 'Unified Profiles', type: 'identity_keys' }],
        prerequisites: ['segment'],
        enables: ['identity', 'activation'],
        recommendedNext: ['segment_engage']
    },
    {
        id: 'segment_engage',
        name: 'Segment Engage',
        category: 'activation',
        nodeRole: 'activation_connector',
        stage: 'activation',
        icon: 'users',
        vendorProfileAvailability: ['generic'],
        description: 'Audience builder and destination activation.',
        whyItMatters: ['SQL audiences', 'Real-time sync', '400+ destinations'],
        inputs: [{ id: 'profile_in', name: 'Profiles', type: 'identity_keys' }],
        outputs: [{ id: 'audience_out', name: 'Audiences', type: 'audiences_people' }],
        prerequisites: ['segment_profiles'],
        enables: ['activation'],
        recommendedNext: ['braze', 'facebook_ads']
    },
    {
        id: 'mparticle',
        name: 'mParticle',
        category: 'collection',
        nodeRole: 'collector',
        stage: 'collection',
        uniquenessKey: 'collector:mparticle',
        icon: 'radio',
        vendorProfileAvailability: ['generic'],
        description: 'Customer data infrastructure platform.',
        whyItMatters: ['Mobile-first SDK', 'Quality guardrails', 'Identity resolution'],
        inputs: [{ id: 'events_in', name: 'Events', type: 'raw_events' }],
        outputs: [{ id: 'stream_out', name: 'Event Stream', type: 'stream_events' }],
        prerequisites: [],
        enables: ['identity', 'activation'],
        recommendedNext: ['mparticle_identity', 'snowflake']
    },
    {
        id: 'mparticle_identity',
        name: 'mParticle IDSync',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:hub',
        cardinality: 'single',
        isHub: true,
        icon: 'users',
        vendorProfileAvailability: ['generic'],
        description: 'Cross-device identity resolution.',
        whyItMatters: ['Deterministic matching', 'Custom identity priority', 'Real-time'],
        inputs: [{ id: 'events_in', name: 'Events', type: 'stream_events' }],
        outputs: [{ id: 'identity_out', name: 'Resolved Identity', type: 'identity_keys' }],
        prerequisites: ['mparticle'],
        enables: ['identity'],
        recommendedNext: ['mparticle_audiences']
    },
    {
        id: 'mparticle_audiences',
        name: 'mParticle Audiences',
        category: 'activation',
        nodeRole: 'activation_connector',
        stage: 'activation',
        icon: 'users',
        vendorProfileAvailability: ['generic'],
        description: 'Real-time audience builder and activation.',
        whyItMatters: ['Real-time segments', 'Cross-platform sync', 'Lookalike modeling'],
        inputs: [{ id: 'identity_in', name: 'Identity', type: 'identity_keys' }],
        outputs: [{ id: 'audience_out', name: 'Audiences', type: 'audiences_people' }],
        prerequisites: ['mparticle_identity'],
        enables: ['activation'],
        recommendedNext: ['facebook_ads', 'braze']
    },

    // ==========================================================
    // NEW ARCHITECTURAL VARIANT NODES
    // ==========================================================

    {
        id: 'cube_js',
        name: 'Cube',
        category: 'analytics',
        nodeRole: 'transform',
        stage: 'transform',
        uniquenessKey: 'semantic:primary',
        icon: 'box',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Headless BI platform and semantic layer.',
        whyItMatters: ['Consistent metric definitions', 'Access control', 'High-performance caching'],
        inputs: [{ id: 'db_in', name: 'DW Table', type: 'raw_records' }],
        outputs: [{ id: 'metrics_out', name: 'Metrics API', type: 'metrics' }],
        prerequisites: ['snowflake'],
        enables: ['measurement'],
        recommendedNext: ['looker', 'metabase']
    },
    {
        id: 'dbt_semantic_layer',
        name: 'dbt Semantic Layer',
        category: 'analytics',
        nodeRole: 'transform',
        stage: 'transform',
        uniquenessKey: 'semantic:primary',
        icon: 'layers',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Business metrics defined directly in dbt.',
        whyItMatters: ['Metrics as code', 'Consistent logic', 'Native dbt integration'],
        inputs: [{ id: 'models_in', name: 'dbt Models', type: 'curated_entities' }],
        outputs: [{ id: 'metrics_out', name: 'Semantic Metrics', type: 'metrics' }],
        prerequisites: ['dbt_core'],
        enables: ['measurement'],
        recommendedNext: ['looker']
    },
    {
        id: 'feast',
        name: 'Feast',
        category: 'transform',
        nodeRole: 'transform',
        stage: 'transform',
        icon: 'zap',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Open source feature store for machine learning.',
        whyItMatters: ['Point-in-time correctness', 'Low-latency serving', 'Feature reuse'],
        inputs: [{ id: 'tables_in', name: 'Curated Data', type: 'curated_entities' }],
        outputs: [{ id: 'features_out', name: 'ML Features', type: 'curated_entities' }],
        prerequisites: ['snowflake'],
        enables: ['activation'],
        recommendedNext: ['churn_model']
    },
    {
        id: 'aws_entity_resolution',
        name: 'AWS Entity Resolution',
        category: 'identity',
        nodeRole: 'identity_hub',
        stage: 'identity',
        uniquenessKey: 'identity:hub',
        icon: 'link',
        vendorProfileAvailability: ['generic'],
        description: 'Match and link related records across datasets.',
        whyItMatters: ['Automated entity matching', 'Probabilistic resolution', 'Privacy-compliant'],
        inputs: [{ id: 'records_in', name: 'Source Records', type: 'identity_keys' }],
        outputs: [{ id: 'resolved_out', name: 'Resolved Entities', type: 'identity_keys' }],
        prerequisites: ['s3_raw'],
        enables: ['identity'],
        recommendedNext: ['neptune_graph'],
        isHub: true
    },
    {
        id: 'snowflake_horizon',
        name: 'Snowflake Horizon',
        category: 'governance',
        nodeRole: 'governance',
        uniquenessKey: 'gov:horizon',
        icon: 'shield',
        vendorProfileAvailability: ALL_PROFILES,
        description: 'Built-in governance and discovery for Snowflake.',
        whyItMatters: ['Data classification', 'Lineage', 'Quality monitoring'],
        inputs: [],
        outputs: [],
        prerequisites: ['snowflake'],
        enables: ['governance'],
        recommendedNext: [],
        isRailNode: true
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


