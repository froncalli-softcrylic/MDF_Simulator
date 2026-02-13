// Brand and category icon SVG data URIs
// These are embedded SVGs that never require external network requests

// Helper to create a simple SVG data URI with a letter/text in a colored circle
function brandCircle(letter: string, bgColor: string, textColor: string = '#fff'): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="${bgColor}"/><text x="20" y="26" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="18" fill="${textColor}">${letter}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Helper for category icons using simple SVG paths
function categoryIcon(pathD: string, color: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${pathD}</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ==========================================
// BRAND LOGOS (letter-mark style)
// ==========================================

export const BRAND_LOGOS = {
    // Salesforce
    salesforce: brandCircle('SF', '#00A1E0'),
    // HubSpot
    hubspot: brandCircle('HS', '#FF7A59'),
    // Marketo
    marketo: brandCircle('Mk', '#5C4C9F'),
    // Segment
    segment: brandCircle('S', '#52BD94'),
    // RudderStack
    rudderstack: brandCircle('RS', '#3D5AFE'),
    // Amplitude
    amplitude: brandCircle('A', '#1D2B3E'),
    // Snowplow
    snowplow: brandCircle('SP', '#6638B6'),
    // Fivetran
    fivetran: brandCircle('FT', '#0073FF'),
    // Airbyte
    airbyte: brandCircle('Ab', '#615EFF'),
    // Snowflake
    snowflake: brandCircle('❄', '#29B5E8'),
    // BigQuery / Google
    google: brandCircle('G', '#4285F4'),
    // Redshift / AWS
    aws: brandCircle('▲', '#FF9900', '#232F3E'),
    // Looker
    looker: brandCircle('L', '#4285F4'),
    // Hightouch
    hightouch: brandCircle('HT', '#6C5CE7'),
    // Adobe
    adobe: brandCircle('Ad', '#FF0000'),
    // Census
    census: brandCircle('Ce', '#4F46E5'),
    // LinkedIn
    linkedin: brandCircle('in', '#0A66C2'),
    // Meta / Facebook
    meta: brandCircle('M', '#0081FB'),
    // dbt
    dbt: brandCircle('dbt', '#FF694B'),
    // Tableau
    tableau: brandCircle('T', '#E97627'),
    // Metabase
    metabase: brandCircle('MB', '#509EE3'),
    // Gong
    gong: brandCircle('G', '#7B2D8E'),
    // Clari
    clari: brandCircle('C', '#00B4D8'),
    // Pendo
    pendo: brandCircle('P', '#E5548C'),
    // Drift
    drift: brandCircle('D', '#0176FF'),
    // Customer.io
    customerio: brandCircle('Ci', '#FFB400'),
    // Braze
    braze: brandCircle('B', '#E30B13'),
    // Slack
    slack: brandCircle('S', '#4A154B'),
    // Stripe (billing)
    stripe: brandCircle('S', '#635BFF'),
    // Zendesk (support)
    zendesk: brandCircle('Z', '#03363D'),
    // Databricks
    databricks: brandCircle('D', '#FF3621'),
    // Microsoft
    microsoft: brandCircle('M', '#00A4EF'),
    // MuleSoft
    mulesoft: brandCircle('MS', '#00A2DF'),
    // Clearbit
    clearbit: brandCircle('Cb', '#3F77F6'),
    // ZoomInfo
    zoominfo: brandCircle('Zi', '#5538CE'),
    // 6sense
    sixsense: brandCircle('6s', '#0DBF6B'),
    // LiveRamp
    liveramp: brandCircle('LR', '#00B36B'),
    // mParticle
    mparticle: brandCircle('mP', '#39B54A'),
    // Outreach
    outreach: brandCircle('O', '#5951FF'),
    // Salesloft
    salesloft: brandCircle('SL', '#006ADC'),
    // Bombora
    bombora: brandCircle('Bo', '#FF5733'),
    // The Trade Desk
    thetradedesk: brandCircle('TD', '#00B140'),
    // Cube
    cube: brandCircle('□', '#7A77FF'),
    // Feast
    feast: brandCircle('F', '#00ADD8'),
    // Kafka
    kafka: brandCircle('K', '#231F20'),
} as const;

// ==========================================
// GENERIC/CATEGORY ICONS (SVG paths)
// ==========================================

export const CATEGORY_ICONS = {
    // Data file / CSV
    dataFile: categoryIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>', '#6B7280'),
    // Web/Globe events
    webEvents: categoryIcon('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', '#3B82F6'),
    // Product / Activity events
    productEvents: categoryIcon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>', '#10B981'),
    // Legacy / Code
    legacyCode: categoryIcon('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', '#EF4444'),
    // Ad Platforms / Megaphone
    adPlatforms: categoryIcon('<path d="M21 3L14.5 21l-4-8-8-4z"/>', '#F59E0B'),
    // MDF Hub / CPU central
    mdfHub: categoryIcon('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>', '#6366F1'),
    // Hygiene / Sparkles
    hygiene: categoryIcon('<path d="M12 3L14.5 8.5L20 9L16 13L17 19L12 16L7 19L8 13L4 9L9.5 8.5L12 3Z"/>', '#8B5CF6'),
    // Measurement / Chart
    measurement: categoryIcon('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', '#06B6D4'),
    // Identity / Users
    identityHub: categoryIcon('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', '#059669'),
    // Profile / User check
    userProfile: categoryIcon('<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>', '#059669'),
    // Deduplication / Copy
    dedup: categoryIcon('<rect x="8" y="2" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>', '#8B5CF6'),
    // Governance / Shield
    governance: categoryIcon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', '#0EA5E9'),
    // Data Quality / Check circle
    dataQuality: categoryIcon('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>', '#10B981'),
    // Lock / Security
    security: categoryIcon('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', '#0EA5E9'),
    // Key / Encryption
    encryption: categoryIcon('<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>', '#6366F1'),
    // Audit / File text
    auditLog: categoryIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', '#6B7280'),
    // Alert / PII detection
    alertTriangle: categoryIcon('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', '#F59E0B'),
    // Attribution / Trending up
    attribution: categoryIcon('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>', '#06B6D4'),
    // Churn / Alert circle
    churnAlert: categoryIcon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', '#EF4444'),
    // Email / Mail
    email: categoryIcon('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>', '#6366F1'),
    // Semantic / Box
    semanticLayer: categoryIcon('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>', '#7C3AED'),
    // Database / Storage
    database: categoryIcon('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>', '#6B7280'),
    // Iceberg table format
    iceberg: categoryIcon('<path d="M12 2L2 19h20L12 2z"/><line x1="6" y1="14" x2="18" y2="14"/>', '#3B82F6'),
    // Analytics pie chart
    pieChart: categoryIcon('<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>', '#06B6D4'),
} as const;

// ==========================================
// COMPLETE NODE → LOGO MAPPING
// ==========================================

export const NODE_LOGOS: Record<string, string> = {
    // === SOURCES ===
    manual_csv: CATEGORY_ICONS.dataFile,
    legacy_script: CATEGORY_ICONS.legacyCode,
    product_events: CATEGORY_ICONS.productEvents,
    web_app_events: CATEGORY_ICONS.webEvents,
    salesforce_crm: BRAND_LOGOS.salesforce,
    hubspot_crm: BRAND_LOGOS.hubspot,
    billing_system: BRAND_LOGOS.stripe,
    support_tickets: BRAND_LOGOS.zendesk,
    marketo: BRAND_LOGOS.marketo,
    ad_platforms: CATEGORY_ICONS.adPlatforms,
    marketing_cloud: BRAND_LOGOS.salesforce,
    commerce_cloud: BRAND_LOGOS.salesforce,
    dynamics_365: BRAND_LOGOS.microsoft,
    bombora: BRAND_LOGOS.bombora,

    // === COLLECTION ===
    segment: BRAND_LOGOS.segment,
    rudderstack: BRAND_LOGOS.rudderstack,
    amplitude: BRAND_LOGOS.amplitude,
    snowplow: BRAND_LOGOS.snowplow,
    adobe_web_sdk: BRAND_LOGOS.adobe,
    gtm: BRAND_LOGOS.google,
    hubspot_tracking: BRAND_LOGOS.hubspot,
    mparticle: BRAND_LOGOS.mparticle,

    // === INGESTION ===
    kinesis: BRAND_LOGOS.aws,
    kinesis_firehose: BRAND_LOGOS.aws,
    fivetran: BRAND_LOGOS.fivetran,
    airbyte: BRAND_LOGOS.airbyte,
    aep_sources: BRAND_LOGOS.adobe,
    salesforce_cdp_connector: BRAND_LOGOS.salesforce,
    mulesoft: BRAND_LOGOS.mulesoft,
    kafka: BRAND_LOGOS.kafka,
    spark_streaming: BRAND_LOGOS.databricks,
    pubsub: BRAND_LOGOS.google,
    dataflow: BRAND_LOGOS.google,
    synapse_pipelines: BRAND_LOGOS.microsoft,
    azure_event_grid: BRAND_LOGOS.microsoft,

    // === RAW STORAGE ===
    s3_raw: BRAND_LOGOS.aws,
    iceberg: CATEGORY_ICONS.iceberg,
    aep_data_lake: BRAND_LOGOS.adobe,
    delta_lake_bronze: BRAND_LOGOS.databricks,
    gcs_raw: BRAND_LOGOS.google,
    onelake: BRAND_LOGOS.microsoft,
    adls_gen2: BRAND_LOGOS.microsoft,

    // === WAREHOUSE ===
    snowflake: BRAND_LOGOS.snowflake,
    bigquery: BRAND_LOGOS.google,
    redshift: BRAND_LOGOS.aws,
    salesforce_data_cloud: BRAND_LOGOS.salesforce,
    delta_lake_silver: BRAND_LOGOS.databricks,
    fabric_warehouse: BRAND_LOGOS.microsoft,

    // === MDF HUB ===
    mdf_hub: CATEGORY_ICONS.mdfHub,
    data_hygiene: CATEGORY_ICONS.hygiene,
    measurement: CATEGORY_ICONS.measurement,

    // === TRANSFORM ===
    dbt_core: BRAND_LOGOS.dbt,
    dbt_cloud: BRAND_LOGOS.dbt,
    glue: BRAND_LOGOS.aws,
    spark: BRAND_LOGOS.kafka,
    data_standardization: CATEGORY_ICONS.hygiene,
    deduplication: CATEGORY_ICONS.dedup,
    dataform: BRAND_LOGOS.google,
    delta_lake_gold: BRAND_LOGOS.databricks,
    feast: BRAND_LOGOS.feast,

    // === ENRICHMENT ===
    clearbit: BRAND_LOGOS.clearbit,
    zoominfo: BRAND_LOGOS.zoominfo,
    sixsense_intent: BRAND_LOGOS.sixsense,

    // === IDENTITY ===
    account_graph: CATEGORY_ICONS.identityHub,
    unified_customer_profile: CATEGORY_ICONS.userProfile,
    identity_resolution: CATEGORY_ICONS.identityHub,
    aep_identity_service: BRAND_LOGOS.adobe,
    rtcdp_profile: BRAND_LOGOS.adobe,
    aep_b2b_profiles: BRAND_LOGOS.adobe,
    salesforce_data_cloud_identity: BRAND_LOGOS.salesforce,
    hubspot_companies: BRAND_LOGOS.hubspot,
    segment_profiles: BRAND_LOGOS.segment,
    mparticle_identity: BRAND_LOGOS.mparticle,
    unity_catalog_identity: BRAND_LOGOS.databricks,
    aws_entity_resolution: BRAND_LOGOS.aws,
    snowflake_horizon: BRAND_LOGOS.snowflake,

    // === ANALYTICS ===
    looker: BRAND_LOGOS.looker,
    tableau: BRAND_LOGOS.tableau,
    metabase: BRAND_LOGOS.metabase,
    attribution_model: CATEGORY_ICONS.attribution,
    opportunity_influence: CATEGORY_ICONS.attribution,
    mmm_model: CATEGORY_ICONS.pieChart,
    churn_model: CATEGORY_ICONS.churnAlert,
    gong_analytics: BRAND_LOGOS.gong,
    clari: BRAND_LOGOS.clari,
    pendo: BRAND_LOGOS.pendo,
    metrics_layer: CATEGORY_ICONS.semanticLayer,
    universal_analytics: BRAND_LOGOS.google,
    google_analytics_4: BRAND_LOGOS.google,
    adobe_analytics: BRAND_LOGOS.adobe,
    customer_journey_analytics: BRAND_LOGOS.adobe,
    databricks_sql: BRAND_LOGOS.databricks,
    power_bi_datasets: BRAND_LOGOS.microsoft,
    power_bi: BRAND_LOGOS.microsoft,
    aws_clean_rooms: BRAND_LOGOS.aws,
    snowflake_clean_rooms: BRAND_LOGOS.snowflake,
    measurement_aggregates: CATEGORY_ICONS.measurement,
    cube_js: BRAND_LOGOS.cube,
    dbt_semantic_layer: BRAND_LOGOS.dbt,

    // === ACTIVATION ===
    hightouch: BRAND_LOGOS.hightouch,
    adobe_aep: BRAND_LOGOS.adobe,
    census: BRAND_LOGOS.census,
    rtcdp_activation: BRAND_LOGOS.adobe,
    liveramp: BRAND_LOGOS.liveramp,
    sixsense: BRAND_LOGOS.sixsense,
    sixsense_orchestration: BRAND_LOGOS.sixsense,
    segment_engage: BRAND_LOGOS.segment,
    mparticle_audiences: BRAND_LOGOS.mparticle,

    // === DESTINATIONS ===
    salesforce_crm_dest: BRAND_LOGOS.salesforce,
    marketo_dest: BRAND_LOGOS.marketo,
    linkedin_ads: BRAND_LOGOS.linkedin,
    meta_ads: BRAND_LOGOS.meta,
    email_sms: CATEGORY_ICONS.email,
    drift: BRAND_LOGOS.drift,
    customerio: BRAND_LOGOS.customerio,
    braze: BRAND_LOGOS.braze,
    journey_optimizer: BRAND_LOGOS.adobe,
    adobe_target: BRAND_LOGOS.adobe,
    journey_builder: BRAND_LOGOS.salesforce,
    slack_alerts: BRAND_LOGOS.slack,
    the_trade_desk: BRAND_LOGOS.thetradedesk,
    outreach: BRAND_LOGOS.outreach,
    salesloft: BRAND_LOGOS.salesloft,
    google_ads: BRAND_LOGOS.google,

    // === GOVERNANCE ===
    consent_manager: CATEGORY_ICONS.governance,
    data_quality: CATEGORY_ICONS.dataQuality,
    pii_masking: CATEGORY_ICONS.security,
    access_control: CATEGORY_ICONS.security,
    encryption_kms: CATEGORY_ICONS.encryption,
    audit_log: CATEGORY_ICONS.auditLog,
    pii_detection: CATEGORY_ICONS.alertTriangle,
    aep_data_governance: BRAND_LOGOS.adobe,
    privacy_service: BRAND_LOGOS.adobe,
    salesforce_shield: BRAND_LOGOS.salesforce,
    unity_catalog_governance: BRAND_LOGOS.databricks,
    dataplex: BRAND_LOGOS.google,
    data_catalog: BRAND_LOGOS.google,
    azure_purview: BRAND_LOGOS.microsoft,
};
