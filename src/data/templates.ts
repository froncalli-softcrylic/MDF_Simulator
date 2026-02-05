// Templates Configuration
// Pre-built diagram templates for quick starts

import { Template, DemoProfile } from '@/types'

export const templates: Template[] = [
    {
        id: 'retail_mdf',
        name: 'Retail MDF',
        description: 'Complete marketing data foundation for retail with online/offline unification.',
        industry: 'Retail',
        profiles: ['adobe_summit', 'preferred_stack', 'generic'],
        nodes: [
            { catalogId: 'web_app_events', position: { x: 0, y: 0 } },
            { catalogId: 'crm_data', position: { x: 0, y: 150 } },
            { catalogId: 'offline_store', position: { x: 0, y: 300 } },
            { catalogId: 's3_landing_zone', position: { x: 250, y: 150 } },
            { catalogId: 'aws_glue', position: { x: 450, y: 150 } },
            { catalogId: 'snowflake', position: { x: 650, y: 150 } },
            { catalogId: 'identity_graph', position: { x: 650, y: 0 } },
            { catalogId: 'consent_preferences', position: { x: 450, y: 350 } },
            { catalogId: 'dbt', position: { x: 850, y: 150 } },
            { catalogId: 'reverse_etl', position: { x: 1050, y: 100 } },
            { catalogId: 'meta_ads', position: { x: 1250, y: 50 } },
            { catalogId: 'email_sms', position: { x: 1250, y: 200 } }
        ],
        edges: [
            { source: 'web_app_events', target: 's3_landing_zone' },
            { source: 'crm_data', target: 's3_landing_zone' },
            { source: 'offline_store', target: 's3_landing_zone' },
            { source: 's3_landing_zone', target: 'aws_glue' },
            { source: 'aws_glue', target: 'snowflake' },
            { source: 'snowflake', target: 'identity_graph' },
            { source: 'snowflake', target: 'dbt' },
            { source: 'dbt', target: 'reverse_etl' },
            { source: 'consent_preferences', target: 'reverse_etl' },
            { source: 'reverse_etl', target: 'meta_ads' },
            { source: 'reverse_etl', target: 'email_sms' }
        ]
    },
    {
        id: 'b2b_saas_mdf',
        name: 'B2B SaaS MDF',
        description: 'Marketing data foundation optimized for B2B SaaS with product analytics and account-based data.',
        industry: 'B2B SaaS',
        profiles: ['preferred_stack', 'generic'],
        nodes: [
            { catalogId: 'web_app_events', position: { x: 0, y: 0 } },
            { catalogId: 'crm_data', position: { x: 0, y: 150 } },
            { catalogId: 'support_data', position: { x: 0, y: 300 } },
            { catalogId: 'aws_kinesis', position: { x: 250, y: 0 } },
            { catalogId: 's3_landing_zone', position: { x: 250, y: 200 } },
            { catalogId: 'aws_glue', position: { x: 450, y: 150 } },
            { catalogId: 'snowflake', position: { x: 650, y: 150 } },
            { catalogId: 'identity_graph', position: { x: 650, y: 0 } },
            { catalogId: 'consent_preferences', position: { x: 450, y: 350 } },
            { catalogId: 'dbt', position: { x: 850, y: 150 } },
            { catalogId: 'bi_reporting', position: { x: 1050, y: 250 } },
            { catalogId: 'reverse_etl', position: { x: 1050, y: 100 } },
            { catalogId: 'email_sms', position: { x: 1250, y: 100 } }
        ],
        edges: [
            { source: 'web_app_events', target: 'aws_kinesis' },
            { source: 'aws_kinesis', target: 's3_landing_zone' },
            { source: 'crm_data', target: 's3_landing_zone' },
            { source: 'support_data', target: 's3_landing_zone' },
            { source: 's3_landing_zone', target: 'aws_glue' },
            { source: 'aws_glue', target: 'snowflake' },
            { source: 'snowflake', target: 'identity_graph' },
            { source: 'snowflake', target: 'dbt' },
            { source: 'dbt', target: 'bi_reporting' },
            { source: 'dbt', target: 'reverse_etl' },
            { source: 'consent_preferences', target: 'reverse_etl' },
            { source: 'reverse_etl', target: 'email_sms' }
        ]
    },
    {
        id: 'adobe_mdf',
        name: 'Adobe-Centric MDF',
        description: 'Marketing data foundation leveraging Adobe Experience Platform as the activation hub.',
        industry: 'Enterprise',
        profiles: ['adobe_summit', 'generic'],
        nodes: [
            { catalogId: 'adobe_analytics', position: { x: 0, y: 0 } },
            { catalogId: 'crm_data', position: { x: 0, y: 150 } },
            { catalogId: 'web_app_events', position: { x: 0, y: 300 } },
            { catalogId: 's3_landing_zone', position: { x: 250, y: 150 } },
            { catalogId: 'snowflake', position: { x: 450, y: 150 } },
            { catalogId: 'identity_graph', position: { x: 450, y: 0 } },
            { catalogId: 'consent_preferences', position: { x: 250, y: 350 } },
            { catalogId: 'dbt', position: { x: 650, y: 150 } },
            { catalogId: 'aep_cdp', position: { x: 850, y: 100 } },
            { catalogId: 'meta_ads', position: { x: 1050, y: 50 } },
            { catalogId: 'email_sms', position: { x: 1050, y: 200 } }
        ],
        edges: [
            { source: 'adobe_analytics', target: 's3_landing_zone' },
            { source: 'adobe_analytics', target: 'aep_cdp' },
            { source: 'crm_data', target: 's3_landing_zone' },
            { source: 'web_app_events', target: 's3_landing_zone' },
            { source: 's3_landing_zone', target: 'snowflake' },
            { source: 'snowflake', target: 'identity_graph' },
            { source: 'snowflake', target: 'dbt' },
            { source: 'dbt', target: 'aep_cdp' },
            { source: 'consent_preferences', target: 'aep_cdp' },
            { source: 'aep_cdp', target: 'meta_ads' },
            { source: 'aep_cdp', target: 'email_sms' }
        ]
    },
    {
        id: 'preferred_mdf',
        name: 'Preferred Stack MDF',
        description: 'The recommended modern data stack with Snowflake, AWS, and identity graph.',
        industry: 'General',
        profiles: ['preferred_stack', 'generic'],
        nodes: [
            { catalogId: 'web_app_events', position: { x: 0, y: 0 } },
            { catalogId: 'crm_data', position: { x: 0, y: 150 } },
            { catalogId: 'ad_platforms', position: { x: 0, y: 300 } },
            { catalogId: 'aws_kinesis', position: { x: 250, y: 0 } },
            { catalogId: 's3_landing_zone', position: { x: 250, y: 200 } },
            { catalogId: 'data_quality_checks', position: { x: 450, y: 300 } },
            { catalogId: 'aws_glue', position: { x: 450, y: 150 } },
            { catalogId: 'snowflake', position: { x: 650, y: 150 } },
            { catalogId: 'identity_graph', position: { x: 650, y: 0 } },
            { catalogId: 'householding', position: { x: 850, y: 0 } },
            { catalogId: 'consent_preferences', position: { x: 450, y: 400 } },
            { catalogId: 'dbt', position: { x: 850, y: 150 } },
            { catalogId: 'mmm_readiness', position: { x: 1050, y: 250 } },
            { catalogId: 'reverse_etl', position: { x: 1050, y: 100 } },
            { catalogId: 'meta_ads', position: { x: 1250, y: 50 } },
            { catalogId: 'email_sms', position: { x: 1250, y: 200 } }
        ],
        edges: [
            { source: 'web_app_events', target: 'aws_kinesis' },
            { source: 'aws_kinesis', target: 's3_landing_zone' },
            { source: 'crm_data', target: 's3_landing_zone' },
            { source: 'ad_platforms', target: 's3_landing_zone' },
            { source: 's3_landing_zone', target: 'data_quality_checks' },
            { source: 's3_landing_zone', target: 'aws_glue' },
            { source: 'aws_glue', target: 'snowflake' },
            { source: 'snowflake', target: 'identity_graph' },
            { source: 'identity_graph', target: 'householding' },
            { source: 'snowflake', target: 'dbt' },
            { source: 'dbt', target: 'mmm_readiness' },
            { source: 'dbt', target: 'reverse_etl' },
            { source: 'consent_preferences', target: 'reverse_etl' },
            { source: 'reverse_etl', target: 'meta_ads' },
            { source: 'reverse_etl', target: 'email_sms' }
        ]
    },
    {
        id: 'blank',
        name: 'Blank Canvas',
        description: 'Start from scratch and build your own custom MDF architecture.',
        profiles: ['adobe_summit', 'preferred_stack', 'generic'],
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
