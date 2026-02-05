// Wizard Options Configuration - B2B SaaS Optimized
// Updated mappings to new B2B SaaS node catalog

// Tool categories that map to MDF component categories
export type ToolCategory =
    | 'Analytics'
    | 'CDP'
    | 'Data Warehouse'
    | 'Data Platform'
    | 'CRM'
    | 'Marketing Automation'
    | 'Identity & Enrichment'
    | 'Data Ingestion'
    | 'Data Quality'
    | 'Consent Management'
    | 'Advertising'
    | 'Sales Engagement'

export const cloudProviders = [
    { id: 'aws', name: 'Amazon Web Services (AWS)', icon: 'cloud' },
    { id: 'azure', name: 'Microsoft Azure', icon: 'cloud' },
    { id: 'gcp', name: 'Google Cloud Platform', icon: 'cloud' }
] as const

// Expanded tools list with mappings to B2B SaaS MDF catalog nodes
export const tools = [
    // Analytics / Product
    { id: 'adobe_analytics', name: 'Adobe Analytics', category: 'Analytics', mapsTo: 'web_app_events' },
    { id: 'google_analytics', name: 'Google Analytics', category: 'Analytics', mapsTo: 'web_app_events' },
    { id: 'amplitude', name: 'Amplitude', category: 'Analytics', mapsTo: 'amplitude' },
    { id: 'mixpanel', name: 'Mixpanel', category: 'Analytics', mapsTo: 'product_events' },
    { id: 'heap', name: 'Heap', category: 'Analytics', mapsTo: 'product_events' },

    // CDP / Collection
    { id: 'segment', name: 'Segment', category: 'CDP', mapsTo: 'segment' },
    { id: 'rudderstack', name: 'RudderStack', category: 'CDP', mapsTo: 'rudderstack' },
    { id: 'mparticle', name: 'mParticle', category: 'CDP', mapsTo: 'segment' },

    // Data Warehouse
    { id: 'snowflake', name: 'Snowflake', category: 'Data Warehouse', mapsTo: 'snowflake' },
    { id: 'databricks', name: 'Databricks', category: 'Data Platform', mapsTo: 'snowflake' },
    { id: 'bigquery', name: 'BigQuery', category: 'Data Warehouse', mapsTo: 'bigquery' },
    { id: 'redshift', name: 'Amazon Redshift', category: 'Data Warehouse', mapsTo: 'redshift' },

    // CRM
    { id: 'salesforce', name: 'Salesforce', category: 'CRM', mapsTo: 'salesforce_crm' },
    { id: 'hubspot', name: 'HubSpot', category: 'CRM', mapsTo: 'hubspot_crm' },
    { id: 'dynamics', name: 'Microsoft Dynamics', category: 'CRM', mapsTo: 'salesforce_crm' },

    // Marketing Automation
    { id: 'marketo', name: 'Marketo', category: 'Marketing Automation', mapsTo: 'marketo' },
    { id: 'braze', name: 'Braze', category: 'Marketing Automation', mapsTo: 'braze' },
    { id: 'iterable', name: 'Iterable', category: 'Marketing Automation', mapsTo: 'braze' },

    // Identity & Enrichment
    { id: 'sixsense', name: '6sense', category: 'Identity & Enrichment', mapsTo: 'sixsense' },
    { id: 'bombora', name: 'Bombora', category: 'Identity & Enrichment', mapsTo: 'bombora' },
    { id: 'clearbit', name: 'Clearbit', category: 'Identity & Enrichment', mapsTo: 'clearbit' },
    { id: 'zoominfo', name: 'ZoomInfo', category: 'Identity & Enrichment', mapsTo: 'zoominfo' },

    // Data Ingestion
    { id: 'fivetran', name: 'Fivetran', category: 'Data Ingestion', mapsTo: 'fivetran' },
    { id: 'airbyte', name: 'Airbyte', category: 'Data Ingestion', mapsTo: 'airbyte' },
    { id: 'stitch', name: 'Stitch', category: 'Data Ingestion', mapsTo: 'fivetran' },

    // Transformation
    { id: 'dbt', name: 'dbt', category: 'Data Platform', mapsTo: 'dbt_core' },
    { id: 'dbt_cloud', name: 'dbt Cloud', category: 'Data Platform', mapsTo: 'dbt_cloud' },

    // Data Quality
    { id: 'great_expectations', name: 'Great Expectations', category: 'Data Quality', mapsTo: 'data_quality' },
    { id: 'monte_carlo', name: 'Monte Carlo', category: 'Data Quality', mapsTo: 'data_quality' },

    // Consent
    { id: 'onetrust', name: 'OneTrust', category: 'Consent Management', mapsTo: 'consent_manager' },
    { id: 'cookiebot', name: 'Cookiebot', category: 'Consent Management', mapsTo: 'consent_manager' },

    // Advertising
    { id: 'linkedin_ads', name: 'LinkedIn Ads', category: 'Advertising', mapsTo: 'linkedin_ads' },
    { id: 'google_ads', name: 'Google Ads', category: 'Advertising', mapsTo: 'google_ads' },
    { id: 'meta_ads', name: 'Meta Ads', category: 'Advertising', mapsTo: 'meta_ads' },

    // BI
    { id: 'tableau', name: 'Tableau', category: 'Analytics', mapsTo: 'tableau' },
    { id: 'looker', name: 'Looker', category: 'Analytics', mapsTo: 'looker' },
    { id: 'powerbi', name: 'Power BI', category: 'Analytics', mapsTo: 'looker' },

    // Reverse ETL
    { id: 'hightouch', name: 'Hightouch', category: 'Data Platform', mapsTo: 'hightouch' },
    { id: 'census', name: 'Census', category: 'Data Platform', mapsTo: 'census' },

    // Sales Engagement
    { id: 'outreach', name: 'Outreach', category: 'Sales Engagement', mapsTo: 'outreach' },
    { id: 'salesloft', name: 'Salesloft', category: 'Sales Engagement', mapsTo: 'salesloft' }
] as const

export const painPoints = [
    {
        id: 'identity_issues',
        name: 'Identity Issues',
        description: 'Fragmented account/contact identities across systems',
        recommendsNodes: ['neptune_graph', 'account_resolution', 'contact_stitching']
    },
    {
        id: 'too_many_sources',
        name: 'Too Many Data Sources',
        description: 'Data sprawl and integration complexity',
        recommendsNodes: ['s3_raw', 'fivetran', 'data_quality']
    },
    {
        id: 'small_team',
        name: 'Small Data Team',
        description: 'Limited resources to manage data infrastructure',
        recommendsNodes: ['dbt_core', 'hightouch', 'fivetran']
    },
    {
        id: 'measurement_gaps',
        name: 'Measurement Gaps',
        description: 'Inability to measure true marketing impact (B2B)',
        recommendsNodes: ['looker', 'opportunity_influence', 'attribution_model']
    },
    {
        id: 'activation_gaps',
        name: 'Activation Gaps',
        description: "Data exists but can't reach marketing tools",
        recommendsNodes: ['hightouch', 'linkedin_ads', 'salesforce_crm_dest']
    },
    {
        id: 'governance_compliance',
        name: 'Governance/Compliance Concerns',
        description: 'Privacy regulations and data governance challenges',
        recommendsNodes: ['consent_manager', 'access_control', 'pii_detection']
    },
    {
        id: 'data_quality',
        name: 'Poor Data Quality',
        description: 'Inconsistent, incomplete, or inaccurate data',
        recommendsNodes: ['data_quality', 'dbt_core']
    },
    {
        id: 'siloed_data',
        name: 'Siloed Data',
        description: 'Data trapped in different systems that don\'t talk to each other',
        recommendsNodes: ['s3_raw', 'snowflake', 'dbt_core', 'fivetran']
    },
    {
        id: 'long_sales_cycles',
        name: 'Long Sales Cycles',
        description: 'Difficulty tracking multi-month B2B pipeline',
        recommendsNodes: ['opportunity_influence', 'attribution_model', 'neptune_graph']
    },
    {
        id: 'account_hierarchy',
        name: 'Account Hierarchy Complexity',
        description: 'Parent-child account relationships are hard to track',
        recommendsNodes: ['neptune_graph', 'hierarchy_modeling', 'clearbit']
    }
] as const

export const goals = [
    {
        id: 'unify_identities',
        name: 'Unify Account/Contact Identities',
        description: 'Create a single view of accounts and their contacts',
        requiresNodes: ['neptune_graph', 'account_resolution']
    },
    {
        id: 'enable_activation',
        name: 'Enable Data Activation',
        description: 'Get data to marketing platforms faster',
        requiresNodes: ['hightouch', 'consent_manager']
    },
    {
        id: 'improve_measurement',
        name: 'Improve Measurement',
        description: 'Better attribution and analytics for B2B',
        requiresNodes: ['looker', 'opportunity_influence']
    },
    {
        id: 'abm_targeting',
        name: 'Account-Based Marketing',
        description: 'Target accounts with intent data',
        requiresNodes: ['sixsense', 'neptune_graph', 'linkedin_ads']
    },
    {
        id: 'reduce_churn',
        name: 'Reduce Churn',
        description: 'Identify and prevent customer churn',
        requiresNodes: ['churn_model', 'product_events', 'slack_alerts']
    },
    {
        id: 'privacy_compliance',
        name: 'Privacy Compliance',
        description: 'Meet GDPR, CCPA, and other regulations',
        requiresNodes: ['consent_manager', 'access_control']
    },
    {
        id: 'real_time_personalization',
        name: 'Real-time Personalization',
        description: 'Deliver personalized experiences in real-time',
        requiresNodes: ['kinesis', 'segment', 'hightouch']
    },
    {
        id: 'reduce_data_debt',
        name: 'Reduce Data Debt',
        description: 'Clean up and modernize data infrastructure',
        requiresNodes: ['dbt_core', 'data_quality', 's3_raw']
    },
    {
        id: 'enrichment',
        name: 'Enrich Account Data',
        description: 'Add firmographic and technographic data',
        requiresNodes: ['clearbit', 'zoominfo', 'neptune_graph']
    }
] as const

// Helper to get tool by ID
export function getToolById(id: string) {
    return tools.find(t => t.id === id)
}

// Helper to get all nodes that user's tools map to
export function getExistingNodesFromTools(toolIds: string[]): string[] {
    const nodeIds = new Set<string>()
    for (const toolId of toolIds) {
        const tool = getToolById(toolId)
        if (tool?.mapsTo) {
            nodeIds.add(tool.mapsTo)
        }
    }
    return Array.from(nodeIds)
}

// Helper to get recommended nodes based on pain points
export function getRecommendedNodesFromPainPoints(painPointIds: string[]): string[] {
    const nodeIds = new Set<string>()
    for (const ppId of painPointIds) {
        const pp = painPoints.find(p => p.id === ppId)
        if (pp?.recommendsNodes) {
            pp.recommendsNodes.forEach(n => nodeIds.add(n))
        }
    }
    return Array.from(nodeIds)
}

// Helper to get required nodes based on goals
export function getRequiredNodesFromGoals(goalIds: string[]): string[] {
    const nodeIds = new Set<string>()
    for (const goalId of goalIds) {
        const goal = goals.find(g => g.id === goalId)
        if (goal?.requiresNodes) {
            goal.requiresNodes.forEach(n => nodeIds.add(n))
        }
    }
    return Array.from(nodeIds)
}
