import { useCallback, useRef } from 'react'
import { useUIStore, SimulationPathStep } from '@/store/ui-store'
import { useCanvasStore } from '@/store/canvas-store'
import { useProfileStore } from '@/store/profile-store'
import { Edge, Node } from '@xyflow/react'
import { categoryMeta, getNodeById } from '@/data/node-catalog'
import { generateMdfHubGraph } from '@/lib/diagram-generator'
import { semanticAutoLayout } from '@/lib/semantic-layout-engine'

// Canonical left-to-right order for the pipeline
const CATEGORY_ORDER: string[] = [
    'sources', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse',
    'transform', 'mdf', 'identity', 'analytics', 'activation', 'destination'
]

// ============================================
// Platform-Specific Source Data Records
// ============================================
// Each source pushes realistic data matching what that platform actually exports

const SOURCE_DATA: Record<string, Record<string, any>> = {
    // CRM Sources
    salesforce_crm: {
        id: 'SF-001482',
        first_name: 'john',
        last_name: 'DOE',
        email: 'JOHN.DOE@GMAIL.com',
        phone: '1234567890',
        company: 'Acme Corp',
        title: 'VP of Marketing',
        status: 'Qualified',
        annual_revenue: '$50M',
        lead_source: 'Webinar',
        last_activity: '2024-03-14',
        owner: 'Sarah M.'
    },
    hubspot: {
        vid: 'HS-98231',
        firstname: 'John',
        lastname: 'doe',
        email: 'j.doe@acme.com',
        phone: '+1-123-456-7890',
        company: 'Acme Corp.',
        lifecyclestage: 'MQL',
        hs_lead_score: 72,
        createdate: '2024-01-15T08:22:00Z',
        last_form_submission: 'Pricing Page',
        num_associated_deals: 2
    },
    marketo: {
        mkto_id: 'MK-55291',
        firstName: 'JOHN',
        lastName: 'Doe',
        emailAddress: 'john.doe@gmail.com',
        mobilePhone: '(123)456-7890',
        program_name: 'Q1 Nurture',
        engagement_score: 85,
        lead_status: 'Engaged',
        utm_source: 'linkedin',
        utm_campaign: 'b2b_awareness_2024',
        last_interesting_moment: 'Opened pricing email'
    },
    google_analytics: {
        client_id: 'GA-1784923.1710412800',
        session_id: 'S-9812437',
        page_path: '/pricing',
        event_name: 'page_view',
        device_category: 'desktop',
        browser: 'Chrome 122',
        geo_country: 'United States',
        geo_city: 'San Francisco',
        session_duration: 245,
        pages_per_session: 4.2,
        bounce_rate: '28%'
    },
    ga4: {
        client_id: 'GA4-8821.331',
        user_id: 'anon_4821',
        event_name: 'purchase',
        engagement_time_msec: 184000,
        session_number: 12,
        platform: 'WEB',
        traffic_source: 'google / organic',
        page_referrer: 'google.com',
        screen_resolution: '1920x1080',
        ecommerce_value: 299.00
    },
    segment: {
        anonymousId: 'ajs-812f0d',
        userId: 'usr_482',
        type: 'track',
        event: 'Product Viewed',
        properties_name: 'Enterprise Plan',
        properties_price: 599,
        context_ip: '192.168.1.42',
        context_locale: 'en-US',
        context_userAgent: 'Chrome/122',
        timestamp: '2024-03-14T14:22:31Z',
        integrations_all: true
    },
    shopify: {
        order_id: '#SH-10482',
        customer_email: 'john.doe@gmail.com',
        customer_name: 'John Doe',
        total_price: '$1,249.00',
        line_items: '3 items',
        shipping_address: '123 Main St, SF CA',
        payment_status: 'PAID',
        fulfillment_status: 'UNFULFILLED',
        created_at: '2024-03-14T09:15:00Z',
        discount_code: 'SPRING20'
    },
    stripe: {
        cus_id: 'cus_Q8xh29',
        charge_id: 'ch_3Pn8K8Li',
        amount: 59900,
        currency: 'usd',
        status: 'succeeded',
        payment_method: 'card_visa_4242',
        receipt_email: 'john.doe@gmail.com',
        description: 'Enterprise Plan - Annual',
        created: 1710408000,
        metadata_plan: 'enterprise'
    },
    intercom: {
        user_id: 'IC-84291',
        email: 'john.doe@gmail.com',
        name: 'John Doe',
        signed_up_at: '2023-11-02T10:00:00Z',
        last_seen_at: '2024-03-14T16:42:00Z',
        session_count: 48,
        unsubscribed: false,
        custom_company: 'Acme Corp',
        tag: 'Power User',
        last_contacted: '2024-03-10'
    },
    zendesk: {
        ticket_id: 'ZD-12847',
        requester_email: 'john.doe@gmail.com',
        subject: 'Integration Help',
        status: 'open',
        priority: 'normal',
        channel: 'email',
        created_at: '2024-03-14T11:30:00Z',
        satisfaction_rating: 'good',
        csat_score: 4
    },
    amplitude: {
        user_id: 'AMP-usr_482',
        device_id: 'amp-device-8821',
        event_type: 'Feature Used',
        event_properties_feature: 'Dashboard Builder',
        session_id: 1710412800000,
        platform: 'Web',
        os_name: 'macOS',
        country: 'United States',
        user_properties_plan: 'Enterprise',
        event_id: 142
    },
    mixpanel: {
        distinct_id: 'MP-usr_482',
        event: '$pageview',
        current_url: '/dashboard',
        browser: 'Chrome',
        city: 'San Francisco',
        region: 'California',
        initial_referrer: 'google.com',
        mp_lib: 'web',
        time: 1710412800,
        insert_id: 'mp-8412f0d'
    },
    linkedin_ads: {
        campaign_id: 'LI-camp-4821',
        creative_id: 'LI-cr-9921',
        impressions: 14250,
        clicks: 312,
        ctr: '2.19%',
        spend: '$2,450.00',
        conversions: 8,
        cost_per_lead: '$306.25',
        audience: 'B2B Decision Makers',
        objective: 'Lead Generation'
    },
    facebook_ads: {
        campaign_id: 'FB-camp-7812',
        ad_set_id: 'FB-as-3321',
        impressions: 52100,
        reach: 38400,
        clicks: 891,
        ctr: '1.71%',
        spend: '$1,820.00',
        conversions: 14,
        frequency: 1.36,
        objective: 'Conversions'
    },
    snowplow: {
        event_id: 'SP-evt-9921h',
        collector_tstamp: '2024-03-14T14:22:31Z',
        domain_userid: 'sp-usr-482',
        page_url: '/pricing',
        page_title: 'Pricing - Enterprise',
        refr_medium: 'search',
        br_name: 'Chrome',
        geo_country: 'US',
        event_name: 'page_view',
        contexts_schema: 'iglu:com.acme/user/1-0-0'
    },
    braze: {
        external_id: 'BR-usr_482',
        email: 'john.doe@gmail.com',
        push_token: 'fcm_tok_8xh29...',
        last_email_open: '2024-03-12',
        email_open_rate: '42%',
        last_push_tap: '2024-03-14',
        purchase_total: '$3,847.00',
        custom_attribute_tier: 'Gold',
        canvas_step: 'Onboarding Day 7'
    },
    rudderstack: {
        anonymousId: 'rs-anon-4821',
        userId: 'usr_482',
        type: 'identify',
        traits_email: 'john.doe@gmail.com',
        traits_name: 'John Doe',
        traits_plan: 'Enterprise',
        context_library: 'rudder-js-sdk/2.30',
        originalTimestamp: '2024-03-14T14:22:31Z',
        sentAt: '2024-03-14T14:22:32Z'
    }
}

// Fallback source data for unknown platforms
const DEFAULT_SOURCE_DATA: Record<string, any> = {
    record_id: 'REC-00142',
    first_name: 'john',
    last_name: 'DOE',
    email: 'JOHN.DOE@GMAIL.com',
    phone: '1234567890',
    source: 'External System',
    quality: 'Unverified',
    created_at: '2024-03-14T10:00:00Z'
}

// ============================================
// Progressive Data Accumulator
// ============================================
// Tracks all source data and shows how it transforms through the pipeline

class SimulationDataAccumulator {
    private sourceRecords: Map<string, Record<string, any>> = new Map()
    private mergedProfile: Record<string, any> = {}

    addSource(catalogId: string, label: string, data: Record<string, any>) {
        this.sourceRecords.set(label, data)
        // Merge key fields into the unified profile
        Object.entries(data).forEach(([k, v]) => {
            if (!this.mergedProfile[k] || this.mergedProfile[k] === '') {
                this.mergedProfile[k] = v
            }
        })
    }

    getSourceCount() { return this.sourceRecords.size }
    getSources() { return this.sourceRecords }
    getMergedProfile() { return { ...this.mergedProfile } }

    getCollectionPayload() {
        return {
            sources_ingested: this.sourceRecords.size,
            total_fields: Object.keys(this.mergedProfile).length,
            status: 'Captured',
            latency: '120ms',
            ...Object.fromEntries(
                Array.from(this.sourceRecords.entries()).map(([src, _]) => [`source_${this.sourceRecords.size > 1 ? Array.from(this.sourceRecords.keys()).indexOf(src) + 1 : ''}`, src])
            )
        }
    }

    getStoragePayload(type: 'raw' | 'warehouse') {
        if (type === 'raw') {
            return {
                storage: 'S3 / Raw Zone',
                format: 'JSON (semi-structured)',
                sources_landed: this.sourceRecords.size,
                total_records: this.sourceRecords.size,
                size: `${(this.sourceRecords.size * 1.2).toFixed(1)}kb`,
                partitioned_by: 'source/date'
            }
        }
        return {
            storage: 'Snowflake / Warehouse',
            schema: 'Structured Tables',
            tables_populated: this.sourceRecords.size,
            total_columns: Object.keys(this.mergedProfile).length,
            rows: this.sourceRecords.size,
            dedup_status: 'Pending'
        }
    }

    getTransformPayload(nodeLabel: string) {
        const label = nodeLabel.toLowerCase()
        if (label.includes('clearbit') || label.includes('zoominfo') || label.includes('enrichment')) {
            return {
                enrichment_source: nodeLabel,
                data_appended: {
                    company_size: '250-500',
                    industry: 'SaaS / B2B',
                    annual_revenue: '$50M-$100M',
                    technologies: 'Salesforce, Slack, AWS'
                },
                match_rate: '94%',
                records_enriched: this.sourceRecords.size
            }
        }
        // Normalization / cleaning
        return {
            records_processed: this.sourceRecords.size,
            'email_normalized': 'john.doe@gmail.com',
            'phone_formatted': '(123) 456-7890',
            'name_standardized': 'John Doe',
            fields_cleaned: Object.keys(this.mergedProfile).length,
            quality_before: '32%',
            quality_after: '94%'
        }
    }

    getIdentityPayload() {
        const sources = Array.from(this.sourceRecords.keys())
        return {
            matched_across: sources.join(', '),
            resolution_keys: ['email', 'phone', 'device_id'],
            unified_profile_id: 'UP-8812',
            confidence: 'Deterministic (100%)',
            profiles_merged: this.sourceRecords.size,
            source_systems: this.sourceRecords.size
        }
    }

    getAnalyticsPayload(nodeLabel: string) {
        const label = nodeLabel.toLowerCase()
        if (label.includes('metric') || label.includes('semantic')) {
            return {
                ltv: '$142,000',
                churn_risk: 'Low (0.12)',
                engagement_score: 92,
                last_active: '2 hours ago',
                data_sources_used: this.sourceRecords.size,
                confidence: 'High'
            }
        }
        if (label.includes('churn') || label.includes('model')) {
            return {
                model: 'XGBoost Churn v2',
                score: '0.12 (Low Risk)',
                factors: ['High Engagement', 'Multi-Channel Active', 'Recent Purchase'],
                action: 'Add to "Loyal Customers"',
                training_sources: this.sourceRecords.size
            }
        }
        return {
            report: 'Unified Customer 360',
            data_completeness: `${Math.min(98, 60 + this.sourceRecords.size * 10)}%`,
            sources_contributing: this.sourceRecords.size,
            trend: '+12% engagement'
        }
    }

    getActivationPayload(nodeLabel: string) {
        return {
            unified_profile_id: 'UP-8812',
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            segment: 'High-Value Enterprise',
            destination: nodeLabel,
            sync_status: 'Success (200 OK)',
            fields_synced: Math.min(Object.keys(this.mergedProfile).length, 24),
            source_systems: this.sourceRecords.size
        }
    }
}

// Module-level accumulator — reset each simulation run
let simAccumulator = new SimulationDataAccumulator()

function getSourceDataForNode(catalogId: string, label: string): Record<string, any> {
    // Try exact catalogId match first
    if (SOURCE_DATA[catalogId]) return { ...SOURCE_DATA[catalogId] }

    // Try matching by label keywords
    const lbl = label.toLowerCase()
    for (const [key, data] of Object.entries(SOURCE_DATA)) {
        if (lbl.includes(key.replace(/_/g, ' ')) || lbl.includes(key.replace(/_/g, ''))) {
            return { ...data }
        }
    }

    // Fuzzy match common names
    if (lbl.includes('salesforce') || lbl.includes('sfdc')) return { ...SOURCE_DATA.salesforce_crm }
    if (lbl.includes('hubspot')) return { ...SOURCE_DATA.hubspot }
    if (lbl.includes('marketo')) return { ...SOURCE_DATA.marketo }
    if (lbl.includes('google') && lbl.includes('analytics') || lbl.includes('ga4')) return { ...SOURCE_DATA.ga4 }
    if (lbl.includes('segment')) return { ...SOURCE_DATA.segment }
    if (lbl.includes('shopify')) return { ...SOURCE_DATA.shopify }
    if (lbl.includes('stripe')) return { ...SOURCE_DATA.stripe }
    if (lbl.includes('intercom')) return { ...SOURCE_DATA.intercom }
    if (lbl.includes('zendesk')) return { ...SOURCE_DATA.zendesk }
    if (lbl.includes('amplitude')) return { ...SOURCE_DATA.amplitude }
    if (lbl.includes('mixpanel')) return { ...SOURCE_DATA.mixpanel }
    if (lbl.includes('linkedin')) return { ...SOURCE_DATA.linkedin_ads }
    if (lbl.includes('facebook') || lbl.includes('meta')) return { ...SOURCE_DATA.facebook_ads }
    if (lbl.includes('snowplow')) return { ...SOURCE_DATA.snowplow }
    if (lbl.includes('braze')) return { ...SOURCE_DATA.braze }
    if (lbl.includes('rudderstack')) return { ...SOURCE_DATA.rudderstack }

    return { ...DEFAULT_SOURCE_DATA, source: label }
}

// Generate a payload description based on category with progressive accumulation
function getPayloadForCategory(category: string, nodeLabel: string, catalogId?: string): any {
    switch (category) {
        case 'sources': {
            const sourceData = getSourceDataForNode(catalogId || '', nodeLabel)
            simAccumulator.addSource(catalogId || nodeLabel, nodeLabel, sourceData)
            return { input: { _source: nodeLabel, ...sourceData } }
        }
        case 'collection':
        case 'ingestion':
            return { input: simAccumulator.getCollectionPayload() }
        case 'storage_raw':
            return { input: simAccumulator.getStoragePayload('raw') }
        case 'storage_warehouse':
            return { input: simAccumulator.getStoragePayload('warehouse') }
        case 'governance':
            return {
                validation: {
                    rule: 'E.164 Phone Format',
                    status: 'Passed',
                    pii_check: 'Cleared',
                    sources_validated: simAccumulator.getSourceCount(),
                    fields_governed: Object.keys(simAccumulator.getMergedProfile()).length
                }
            }
        case 'transform':
            return { input: simAccumulator.getTransformPayload(nodeLabel) }
        case 'identity':
            return { input: simAccumulator.getIdentityPayload() }
        case 'mdf':
            return {
                mdf_summary: {
                    status: 'Processing Chain',
                    sources_feeding: simAccumulator.getSourceCount(),
                    stages: ['Hygiene', 'Identity', 'Enrichment', 'Modeling'],
                    health: 'Good'
                }
            }
        case 'analytics':
            return { input: simAccumulator.getAnalyticsPayload(nodeLabel) }
        case 'activation':
        case 'destination':
            return { output: simAccumulator.getActivationPayload(nodeLabel) }
        default:
            return { input: { node: nodeLabel, status: 'Processing' } }
    }
}

// Get stage type for the DataTransformationCard
function getStageForCategory(category: string): 'extraction' | 'transformation' | 'activation' {
    if (['sources', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse'].includes(category)) {
        return 'extraction'
    }
    if (['transform', 'mdf', 'identity', 'governance'].includes(category)) {
        return 'transformation'
    }
    return 'activation'
}

// Progressive metrics that accumulate as data flows through the pipeline
function getMetricsForCategory(category: string): {
    recordsProcessed: number;
    profilesUnified: number;
    matchRate: string;
    dupesRemoved: number;
    segmentsActive: number;
} {
    switch (category) {
        case 'sources':
            return { recordsProcessed: 4200, profilesUnified: 0, matchRate: '0%', dupesRemoved: 0, segmentsActive: 0 }
        case 'collection':
        case 'ingestion':
            return { recordsProcessed: 4200, profilesUnified: 0, matchRate: '0%', dupesRemoved: 0, segmentsActive: 0 }
        case 'storage_raw':
        case 'storage_warehouse':
            return { recordsProcessed: 4200, profilesUnified: 0, matchRate: '32%', dupesRemoved: 0, segmentsActive: 0 }
        case 'transform':
            return { recordsProcessed: 4200, profilesUnified: 0, matchRate: '64%', dupesRemoved: 38, segmentsActive: 0 }
        case 'mdf':
            return { recordsProcessed: 4200, profilesUnified: 1200, matchRate: '94%', dupesRemoved: 38, segmentsActive: 0 }
        case 'identity':
            return { recordsProcessed: 4200, profilesUnified: 1840, matchRate: '94%', dupesRemoved: 38, segmentsActive: 0 }
        case 'analytics':
            return { recordsProcessed: 4200, profilesUnified: 1840, matchRate: '94%', dupesRemoved: 38, segmentsActive: 12 }
        case 'activation':
        case 'destination':
            return { recordsProcessed: 4200, profilesUnified: 1840, matchRate: '94%', dupesRemoved: 38, segmentsActive: 12 }
        default:
            return { recordsProcessed: 0, profilesUnified: 0, matchRate: '0%', dupesRemoved: 0, segmentsActive: 0 }
    }
}

export function useSimulationRunner() {
    const { setSimulationState, setSimulationRunning } = useUIStore()
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])

    const clearAllTimeouts = () => {
        timeoutsRef.current.forEach(t => clearTimeout(t))
        timeoutsRef.current = []
    }

    const runSimulation = useCallback(async (nodes: Node[], edges: Edge[]) => {
        // BFS Pathfinding: Find a path from leftmost category to rightmost
        // Build adjacency from edges
        const adjacency: Map<string, string[]> = new Map()
        edges.forEach(e => {
            if (!adjacency.has(e.source)) adjacency.set(e.source, [])
            adjacency.get(e.source)!.push(e.target)
        })

        // Group nodes by category
        const nodesByCategory: Map<string, Node[]> = new Map()
        nodes.forEach(n => {
            const cat = (n.data as any).category as string
            if (cat) {
                if (!nodesByCategory.has(cat)) nodesByCategory.set(cat, [])
                nodesByCategory.get(cat)!.push(n)
            }
        })

        // Build path: include ALL nodes for sources & destinations, one representative for middle stages
        const MULTI_NODE_CATEGORIES = ['sources', 'activation', 'destination']
        const path: Node[] = []
        for (const cat of CATEGORY_ORDER) {
            const nodesInCat = nodesByCategory.get(cat)
            if (nodesInCat && nodesInCat.length > 0) {
                if (MULTI_NODE_CATEGORIES.includes(cat)) {
                    // Include ALL nodes in this category
                    path.push(...nodesInCat)
                } else if (path.length === 0) {
                    path.push(nodesInCat[0])
                } else {
                    const lastNode = path[path.length - 1]
                    const neighbors = adjacency.get(lastNode.id) || []
                    const connectedNode = nodesInCat.find(n => neighbors.includes(n.id))
                    path.push(connectedNode || nodesInCat[0])
                }
            }
        }

        // Reset the data accumulator for this run
        simAccumulator = new SimulationDataAccumulator()

        // Build path steps with MDF Drill-Down Support
        const pathSteps: SimulationPathStep[] = []
        const activeProfile = useProfileStore.getState().activeProfile

        // Check if the user has a custom MDF Hub internal graph
        const mdfHubNode = nodes.find(n => (n.data as any)?.catalogId === 'mdf_hub')
        const storedGraph = (mdfHubNode?.data as any)?.internalGraph as { nodes: any[]; edges: any[] } | undefined
        const hasUserGraph = storedGraph && storedGraph.nodes.length > 0

        // Use user's custom graph if available, otherwise fall back to generated
        let mdfHubGraph = hasUserGraph ? storedGraph! : generateMdfHubGraph(activeProfile)

        // ** Auto-Layout the Hub Graph **
        try {
            const layoutedNodes = await semanticAutoLayout(
                mdfHubGraph.nodes as Node[],
                mdfHubGraph.edges as Edge[]
            )
            mdfHubGraph = {
                ...mdfHubGraph,
                nodes: layoutedNodes as any
            }
        } catch (err) {
            console.error("Failed to auto-layout MDF Hub:", err)
        }

        path.forEach(n => {
            const cat = (n.data as any).category as string
            const meta = categoryMeta[cat as keyof typeof categoryMeta]

            // Standard Node Step
            const mainStep: SimulationPathStep = {
                nodeId: n.id,
                label: (n.data.label as string) || meta?.label || cat,
                category: cat,
                description: meta?.description || '',
                viewMode: 'main',
                catalogId: (n.data as any)?.catalogId as string || undefined
            }

            pathSteps.push(mainStep)

            // If this is the MDF Hub node, drill down using the actual graph
            if (cat === 'mdf') {
                // Build a dynamic path through the hub's internal nodes via BFS
                const hubNodes = mdfHubGraph.nodes
                const hubEdges = mdfHubGraph.edges

                // Build adjacency for the hub graph
                const hubAdj: Map<string, string[]> = new Map()
                hubEdges.forEach((e: any) => {
                    if (!hubAdj.has(e.source)) hubAdj.set(e.source, [])
                    hubAdj.get(e.source)!.push(e.target)
                })

                // Find source nodes (no incoming edges)
                const targetSet = new Set(hubEdges.map((e: any) => e.target))
                const sourceNodes = hubNodes.filter((n: any) => !targetSet.has(n.id))

                // BFS from source nodes to build ordered path
                const visited = new Set<string>()
                const internalPath: any[] = []
                const queue = sourceNodes.length > 0 ? [sourceNodes[0]] : (hubNodes.length > 0 ? [hubNodes[0]] : [])

                while (queue.length > 0) {
                    const current = queue.shift()!
                    if (visited.has(current.id)) continue
                    visited.add(current.id)
                    internalPath.push(current)

                    const neighbors = hubAdj.get(current.id) || []
                    for (const neighborId of neighbors) {
                        if (!visited.has(neighborId)) {
                            const neighborNode = hubNodes.find((n: any) => n.id === neighborId)
                            if (neighborNode) queue.push(neighborNode)
                        }
                    }
                }

                // Add internal path steps
                internalPath.forEach(internalNode => {
                    const internalCat = (internalNode.data as any).category || 'mdf'
                    const internalMeta = categoryMeta[internalCat as keyof typeof categoryMeta]
                    pathSteps.push({
                        nodeId: internalNode.id,
                        label: (internalNode.data as any).label,
                        category: internalCat,
                        description: internalMeta?.description || 'Internal MDF Component',
                        viewMode: 'mdf-hub'
                    })
                })
            }
        })

        // Start simulation
        setSimulationRunning(true)
        clearAllTimeouts()

        // Set initial state
        setSimulationState({
            status: 'stepping',
            activeNodeId: pathSteps[0].nodeId,
            pathSteps,
            currentStepIndex: 0,
            dataPayload: getPayloadForCategory(pathSteps[0].category, pathSteps[0].label, pathSteps[0].catalogId),
            simulationMetrics: getMetricsForCategory(pathSteps[0].category),
            resultsData: null
        })

        // Schedule steps
        const STEP_DURATION = 2200
        const TRANSITION_DURATION = 700

        let delay = STEP_DURATION
        for (let i = 1; i < pathSteps.length; i++) {
            const stepIndex = i
            const currentStep = pathSteps[i]
            const prevStep = pathSteps[i - 1]

            // Transition logic
            const transitionTimeout = setTimeout(() => {
                // Check if we need to switch views
                if (currentStep.viewMode === 'mdf-hub' && prevStep.viewMode === 'main') {
                    // Enter MDF Hub
                    useCanvasStore.getState().enterMdfHubMode(mdfHubGraph)
                } else if (currentStep.viewMode === 'main' && prevStep.viewMode === 'mdf-hub') {
                    // Exit MDF Hub
                    useCanvasStore.getState().exitMdfHubMode()
                }

                setSimulationState({
                    status: 'transitioning',
                    activeNodeId: null, // Clear active node during move
                    currentStepIndex: stepIndex - 1
                })
            }, delay)
            timeoutsRef.current.push(transitionTimeout)
            delay += TRANSITION_DURATION

            // Step logic (Arrival)
            const stepTimeout = setTimeout(() => {
                setSimulationState({
                    status: 'stepping',
                    activeNodeId: currentStep.nodeId,
                    currentStepIndex: stepIndex,
                    dataPayload: getPayloadForCategory(currentStep.category, currentStep.label, currentStep.catalogId),
                    simulationMetrics: getMetricsForCategory(currentStep.category)
                })
            }, delay)
            timeoutsRef.current.push(stepTimeout)
            delay += STEP_DURATION
        }

        // Complete phase
        const completeTimeout = setTimeout(() => {
            // Ensure we are back in main view (just in case)
            if (useCanvasStore.getState().viewMode === 'mdf-hub') {
                useCanvasStore.getState().exitMdfHubMode()
            }

            const sourceNodes = path.filter(n => (n.data as any).category === 'sources')
            const destNodes = path.filter(n => ['activation', 'destination'].includes((n.data as any).category))
            const uniqueCategories = [...new Set(path.map(n => (n.data as any).category as string))]

            const resultsData = {
                totalNodes: path.length,
                sourceNames: sourceNodes.map(n => (n.data.label as string) || 'Source'),
                destinationNames: destNodes.map(n => (n.data.label as string) || 'Destination'),
                categories: uniqueCategories,
                finalPayload: {
                    unified_profile_id: 'UP-8812',
                    name: 'John Doe',
                    email: 'john.doe@gmail.com',
                    phone: '(123) 456-7890',
                    segment: 'High-Value Enterprise',
                    ltv: '$142,000',
                    source_systems: simAccumulator.getSourceCount(),
                    next_best_action: 'Upsell Premium Plan',
                    activated_channels: destNodes.map(n => (n.data.label as string) || 'Channel')
                }
            }

            setSimulationState({
                status: 'results',
                activeNodeId: null,
                currentStepIndex: pathSteps.length,
                resultsData
            })

            // Fire async AI scoring request (non-blocking)
            const allNodeLabels = path.map(n => (n.data.label as string) || 'Unknown')
            const allNodeCategories = path.map(n => ({
                label: (n.data.label as string) || 'Unknown',
                category: (n.data as any).category as string
            }))

            const scoringPrompt = `Score this data pipeline. Respond ONLY with a JSON object (no markdown, no code fences, no explanation).

Pipeline: ${allNodeLabels.join(' → ')}
Components: ${allNodeCategories.map(n => `${n.label} (${n.category})`).join(', ')}
Sources: ${resultsData.sourceNames.join(', ')}
Destinations: ${resultsData.destinationNames.join(', ')}
Pipeline Stages: ${uniqueCategories.join(' → ')}
Total Nodes: ${path.length}
Has MDF Hub: ${path.some(n => (n.data as any).category === 'mdf') ? 'Yes' : 'No'}
Has Identity Resolution: ${uniqueCategories.includes('identity') ? 'Yes' : 'No'}

Return this exact JSON structure:
{"score":75,"grade":"B","summary":"2-3 sentence pipeline assessment","strengths":["strength 1","strength 2","strength 3"],"gaps":["gap 1","gap 2"],"recommendations":["recommendation 1","recommendation 2","recommendation 3"]}`

            fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: scoringPrompt }],
                    currentGraph: {
                        nodes: path.map(n => ({
                            id: n.id,
                            label: (n.data.label as string) || 'Unknown',
                            category: (n.data as any).category
                        })),
                        edges: []
                    }
                })
            })
                .then(res => res.json())
                .then(data => {
                    try {
                        // Try to extract JSON from the AI response
                        const responseText = data.message || ''
                        // Find JSON in response (handle potential markdown code fences)
                        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
                        if (jsonMatch) {
                            const feedback = JSON.parse(jsonMatch[0])
                            // Validate required fields
                            if (feedback.score !== undefined && feedback.grade && feedback.summary) {
                                const currentState = useUIStore.getState().simulationState
                                if (currentState.resultsData) {
                                    setSimulationState({
                                        resultsData: {
                                            ...currentState.resultsData,
                                            aiFeedback: {
                                                score: Number(feedback.score),
                                                grade: String(feedback.grade),
                                                summary: String(feedback.summary),
                                                strengths: Array.isArray(feedback.strengths) ? feedback.strengths : [],
                                                gaps: Array.isArray(feedback.gaps) ? feedback.gaps : [],
                                                recommendations: Array.isArray(feedback.recommendations) ? feedback.recommendations : []
                                            }
                                        }
                                    })
                                }
                            }
                        }
                    } catch (parseErr) {
                        console.error('Failed to parse AI scoring response:', parseErr)
                    }
                })
                .catch(err => console.error('AI scoring request failed:', err))
        }, delay)
        timeoutsRef.current.push(completeTimeout)

    }, [setSimulationState, setSimulationRunning])

    const stopSimulation = useCallback(() => {
        clearAllTimeouts()
        setSimulationRunning(false)
        useCanvasStore.getState().exitMdfHubMode() // Reset view logic
        setSimulationState({
            status: 'idle',
            activeNodeId: null,
            dataPayload: null,
            pathSteps: [],
            currentStepIndex: -1,
            resultsData: null
        })
    }, [setSimulationRunning, setSimulationState])

    return { runSimulation, stopSimulation, getStageForCategory }
}
