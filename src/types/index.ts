// Core Types for MDF Simulator - B2B SaaS Optimized
// Updated with proper category structure, typed ports, and edge validation support
// DEFINITIVE VERSION

// ============================================
// Node Category Types (B2B SaaS Pipeline)
// ============================================

// Pipeline categories (data flows left to right)
export type PipelineCategory =
    | 'sources'          // Data origins
    | 'collection'       // SDKs, event tracking
    | 'ingestion'        // Streaming/batch pipelines
    | 'storage_raw'      // Immutable raw data lake
    | 'storage_warehouse'// Structured analytics store
    | 'transform'        // dbt, modeling
    | 'mdf'              // New: Central Hub
    | 'identity'         // Identity & Entity Resolution
    | 'governance'       // Governance rail nodes
    | 'analytics'        // BI, attribution, MMM
    | 'activation'       // Reverse ETL, CDPs
    | 'clean_room'       // Data clean rooms
    | 'realtime_serving' // Real-time personalization
    | 'destination';     // Ad platforms, CRM, email

// Combined category type
export type NodeCategory = PipelineCategory;

// Category ordering for layout (column positions)
export const CATEGORY_ORDER: Record<PipelineCategory, number> = {
    sources: 0,
    collection: 1,
    ingestion: 1,
    storage_raw: 1,
    storage_warehouse: 1,
    transform: 1,
    mdf: 2,              // Central Hub
    identity: 2,         // Merged into Hub conceptually, but keep col 2 if separate
    governance: 2,       // Rail
    analytics: 3,
    activation: 3,
    clean_room: 3,
    realtime_serving: 3,
    destination: 4
};

// ============================================
// Port Types (B2B SaaS Deterministic Model)
// ============================================

export type PortType =
    // Raw data types (left side of pipeline)
    | 'raw_events'         // Clickstream, product events
    | 'raw_records'        // Batch records from sources

    // Curated types (after transform)
    | 'curated_entities'   // Modeled tables (accounts, contacts, opps)
    | 'identity_keys'      // Account ID, domain, email hash, user ID
    | 'graph_edges'        // Account↔Contact↔Opportunity relationships

    // Output types (activation/analytics)
    | 'metrics'            // Aggregated analytics data
    | 'audiences_accounts' // B2B account lists
    | 'audiences_people'   // Contact/lead lists

    // Governance types (rail)
    | 'governance_policies' // Consent, access, retention rules
    | 'audit_events'       // Compliance logs

    // New Schema Types
    | 'dataset_raw'
    | 'crm_data'
    | 'activation_payload'
    | 'analysis_result'
    | 'identity_resolution'
    | 'stream_events';

// ============================================
// Edge Validation Rules
// ============================================

// Allowed source→target category connections
export const ALLOWED_CATEGORY_EDGES: Array<{
    source: NodeCategory;
    target: NodeCategory;
    allowedPortTypes: PortType[];
}> = [
        // Pipeline flow
        { source: 'sources', target: 'collection', allowedPortTypes: ['raw_events', 'raw_records'] },
        { source: 'sources', target: 'ingestion', allowedPortTypes: ['raw_events', 'raw_records'] },
        { source: 'collection', target: 'ingestion', allowedPortTypes: ['raw_events', 'raw_records'] },
        { source: 'ingestion', target: 'storage_raw', allowedPortTypes: ['raw_events', 'raw_records'] },
        { source: 'storage_raw', target: 'storage_warehouse', allowedPortTypes: ['raw_records'] },
        { source: 'ingestion', target: 'storage_warehouse', allowedPortTypes: ['raw_records'] }, // Warehouse-first
        { source: 'storage_warehouse', target: 'transform', allowedPortTypes: ['raw_records', 'curated_entities'] },

        // Transform to outputs (parallel)
        { source: 'transform', target: 'analytics', allowedPortTypes: ['curated_entities', 'metrics'] },
        { source: 'transform', target: 'activation', allowedPortTypes: ['curated_entities', 'audiences_accounts', 'audiences_people'] },
        { source: 'transform', target: 'identity', allowedPortTypes: ['identity_keys', 'curated_entities'] },

        // Identity hub flows
        { source: 'identity', target: 'analytics', allowedPortTypes: ['graph_edges', 'curated_entities'] },
        { source: 'identity', target: 'activation', allowedPortTypes: ['audiences_accounts', 'audiences_people', 'graph_edges'] },

        // Activation to destinations
        { source: 'activation', target: 'destination', allowedPortTypes: ['audiences_accounts', 'audiences_people'] },

        // Governance rail (can attach to any)
        { source: 'governance', target: 'collection', allowedPortTypes: ['governance_policies'] },
        { source: 'governance', target: 'ingestion', allowedPortTypes: ['governance_policies'] },
        { source: 'governance', target: 'storage_raw', allowedPortTypes: ['governance_policies'] },
        { source: 'governance', target: 'storage_warehouse', allowedPortTypes: ['governance_policies'] },
        { source: 'governance', target: 'transform', allowedPortTypes: ['governance_policies'] },
        { source: 'governance', target: 'activation', allowedPortTypes: ['governance_policies'] },
    ];

// Nonsense prevention rules
export const INVALID_EDGE_RULES = [
    { message: 'Destinations cannot accept raw events', targetCategory: 'destination' as NodeCategory, forbiddenPortTypes: ['raw_events', 'raw_records'] as PortType[] },
    { message: 'Analytics cannot output to destinations directly', sourceCategory: 'analytics' as NodeCategory, targetCategory: 'destination' as NodeCategory },
    { message: 'Sources cannot receive inputs', targetCategory: 'sources' as NodeCategory },
];

// ============================================
// Enables Tags (B2B SaaS)
// ============================================

export type EnablesTag =
    | 'activation'
    | 'measurement'
    | 'identity'
    | 'governance'
    | 'hygiene'
    | 'account_intelligence'  // NEW: B2B-specific
    | 'intent_signals'        // NEW: 6sense/Bombora
    | 'enrichment'          // NEW: Clearbit/ZoomInfo
    | 'analytics'           // NEW: BI/Analytics
    | 'bi'                  // NEW: Business Intelligence
    | 'compliance'          // NEW: GDPR/CCPA
    | 'engagement'          // NEW: Customer Engagement
    | 'advertising'         // NEW: Paid Media
    | 'mdf_hub'             // NEW: Central Hub
    | 'sales_enablement'    // NEW: Sales tools
    | 'sales_optimization'  // NEW: Sales Ops
    | 'sales_operations'    // NEW: Sales Ops
    | 'product_optimization' // NEW: Pendo/Product Analytics
    | 'personalization'     // NEW: Targeting/personalization
    | 'integration'         // NEW: API integration
    | 'transformation'      // NEW: Data transformation
    | 'real-time'           // NEW: Real-time streaming
    | 'storage'             // NEW: Data storage
    | 'second_party'        // NEW: 2nd party data
    | 'prospecting'         // NEW: Prospecting/lead gen
    | 'marketing';          // NEW: Marketing

// ============================================
// Node Role Classification (Conformance Spec)
// ============================================

export type NodeRole =
    | 'source'              // Data origin
    | 'collector'           // SDK/instrumentation
    | 'ingestor'            // ETL/streaming pipeline
    | 'storage_raw'         // Immutable raw landing
    | 'warehouse'           // Analytics warehouse (singleton)
    | 'transform'           // dbt, modeling
    | 'mdf_hub'             // NEW: Central Hub (Singleton)
    | 'hygiene'             // NEW: Standardization, dedupe
    | 'measurement'         // NEW: Performance measurement
    | 'identity_hub'        // Account graph (singleton)
    | 'unified_profile'     // NEW: Golden record
    | 'enrichment'          // Clearbit, ZoomInfo (NOT hub)
    | 'governance'          // Consent, quality, audit
    | 'analytics'           // BI, attribution, MMM
    | 'activation_connector'// Reverse ETL (Hightouch, Census)
    | 'destination'         // End platforms
    | 'clean_room'          // Data clean rooms
    | 'realtime_serving';   // Real-time personalization

// ============================================
// Demo Profiles
// ============================================

export type DemoProfile =
    | 'adobe_summit'      // Canonical Adobe Flow
    | 'generic';          // Standard B2B Stack

// ============================================
// Node Status
// ============================================

export type NodeStatus =
    | 'existing'      // User already has this
    | 'recommended'   // Recommended based on pain points
    | 'required'      // Required to achieve goals
    | 'gap'           // Missing critical component
    | 'optional';     // Nice to have

// ============================================
// Node Port Definition
// ============================================

export interface NodePort {
    id: string;
    name: string;
    type: PortType;
    required?: boolean;
    position?: 'left' | 'right' | 'top' | 'bottom'; // For visual rendering
}

// ============================================
// Proof Points (for node inspector)
// ============================================

export interface ProofPoint {
    id: string;
    title: string;
    description: string;
    icon?: string;
}

// ============================================
// Catalog Node Definition
// ============================================

// Pipeline stage for layout (explicit assignment)
export type PipelineStage =
    | 'sources'
    | 'collection'
    | 'ingestion'
    | 'storage_raw'
    | 'storage_warehouse'
    | 'transform'
    | 'transform'
    | 'mdf'              // NEW: Central Hub/Unified Layer
    | 'mdf_hygiene'      // NEW: Data Hygiene
    | 'mdf_measurement'  // NEW: Measurement
    | 'identity'
    | 'governance'
    | 'analytics'
    | 'activation'
    | 'clean_room'
    | 'realtime_serving'
    | 'destination';

// Cardinality: how many instances allowed
export type NodeCardinality = 'single' | 'multi' | 'bounded';

export interface CatalogNode {
    id: string;
    name: string;
    category: NodeCategory;
    icon: string;
    vendorProfileAvailability: DemoProfile[];
    description: string;
    whyItMatters: string[];
    whenToUse?: string;      // One-line "when to use" guidance
    inputs: NodePort[];
    outputs: NodePort[];
    prerequisites: string[];
    enables: EnablesTag[];
    recommendedNext: string[];
    proofPoints?: ProofPoint[];

    // B2B SaaS additions
    isRailNode?: boolean;        // Part of governance/graph rail
    b2bSpecific?: boolean;       // B2B SaaS only (not B2C)
    preferredStackNode?: boolean; // Highlighted in preferred stack

    // NEW: Cardinality & Uniqueness (for guardrails)
    cardinality?: NodeCardinality;  // Default: 'multi'
    uniquenessKey?: string;         // e.g., 'warehouse:primary', 'raw_landing:s3'
    maxInstances?: number;          // For 'bounded' cardinality

    // NEW: Layout Hints (for Auto Layout)
    stage?: PipelineStage;          // Explicit stage override
    isHub?: boolean;                // Account graph hub (centered)
    railPosition?: 'top' | 'bottom' | 'center'; // For governance rail

    // NEW: Smart Connect Hints
    autoConnectPriority?: number;   // Higher = connect first (0-100)
    preferredUpstream?: string[];   // Catalog IDs to prioritize
    preferredDownstream?: string[]; // Catalog IDs to connect to

    // NEW: Conformance Spec Fields
    nodeRole?: NodeRole;            // Explicit role classification
    requiredIdentifiers?: string[]; // For destinations (e.g., ['crm_id', 'email'])
    attachableStages?: PipelineStage[]; // For governance nodes

    // NEW: Phase 2 Metadata (Consultant-Grade)
    complexity?: number;            // 1-10 scale
    costEstimate?: 'low' | 'medium' | 'high';
    supportedLatency?: ('realtime' | 'batch')[];
    supportedIdentifiers?: ('email' | 'device_id' | 'crm_id' | 'account_id' | 'cookie')[];
    governanceFlags?: Array<'pii_safe' | 'needs_hashing' | 'needs_consent'>;

    // NEW: Business Value Metadata (for Consultant Mode)
    businessValue?: {
        proposition: string;       // One-line value prop
        impact: 'revenue' | 'risk' | 'efficiency' | 'experience';
        roi: 'high' | 'medium' | 'low';
    };

    // NEW: MDF Upgrade v3 Metadata (Hub-Centric)
    availableIdentities?: string[];         // For sources: ['email', 'phone', 'crm_id']
    sampleFields?: string[];                // For sources: ['first_name', 'last_name']
    dataClassProduced?: 'behavioral' | 'transactional' | 'marketing' | 'other';
    identityStrategyOptions?: string[];     // For Hub: ['deterministic', 'probabilistic']
    profileDataClasses?: string[];          // For Hub Unified Profile: ['behavioral', 'transactional']
    measurementOutputs?: string[];          // For Hub Measurement: ['attribution', 'lift']
    hygieneRules?: string[];                // For Hub Hygiene: ['standardization', 'dedupe']
    joinKeys?: string[];                    // Shared join keys
    dataConcepts?: string[];                // Data concepts (legacy field)
    identityType?: 'deterministic' | 'graph' | 'household' | 'account';
    valueText?: string;                     // Override or specific value text for badges

    metrics?: Array<{
        label: string;
        value: string;
        trend?: 'up' | 'down' | 'neutral';
    }>;

    // NEW: Phase 17 Interactive Learning
    sampleData?: Record<string, any>[]; // Array of example objects for Data Preview
}

// ============================================
// Demo Profile Config
// ============================================

export interface DemoProfileConfig {
    id: DemoProfile;
    name: string;
    description: string;
    brandColor?: string;
    logo?: string;
    emphasizedNodes: string[];
    hiddenNodes: string[];
    templates: string[];
    // New fields for enhanced profile details
    identityStrategy?: string;
    governanceRailNodes?: string[];
    defaultDestinations?: string[];
    template?: {
        nodes: string[];
        edges: string[][];
    };
    defaultCopy: {
        heroTitle: string;
        heroSubtitle: string;
    };
}

// ============================================
// Template Types
// ============================================

export interface TemplateNode {
    catalogId: string;
    position: { x: number; y: number };
}

export interface TemplateEdge {
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

export interface Template {
    id: string;
    name: string;
    description: string;
    industry?: string;
    b2bSaas?: boolean;     // NEW: B2B SaaS specific template
    thumbnail?: string;
    profiles: DemoProfile[];
    nodes: TemplateNode[];
    edges: TemplateEdge[];
}

// ============================================
// Wizard Types
// ============================================

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export type Tool = string;
export type PainPoint = string;
export type Goal = string;

export interface WizardData {
    cloud: CloudProvider;
    tools: Tool[];
    painPoints: PainPoint[];
    goals: Goal[];
}

// ============================================
// Canvas / Graph Types
// ============================================

export interface MdfNodeData {
    catalogId: string;
    label: string;
    category: NodeCategory;
    description?: string;
    status?: NodeStatus;
    isRailNode?: boolean;      // For visual rendering
    railPosition?: 'top' | 'center'; // governance=top, graph=center
    [key: string]: unknown;    // For React Flow compatibility
}

export interface GraphData {
    nodes: {
        id: string;
        type: string;
        position: { x: number; y: number };
        data: MdfNodeData;
    }[];
    edges: {
        id: string;
        source: string;
        target: string;
        sourceHandle?: string;
        targetHandle?: string;
        isGovernanceEdge?: boolean; // For dashed styling
    }[];
}

// ============================================
// Validation Types
// ============================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationResult {
    id: string;
    severity: ValidationSeverity;
    message: string;
    nodeIds?: string[];
    edgeId?: string;            // NEW: for edge validation
    ruleViolated?: string;      // NEW: which rule was broken
    recommendation?: {
        action: string;
        nodeToAdd?: string;
    };
    fixAction?: {
        type: 'add_node' | 'add_edge' | 'delete_node' | 'move_node';
        payload: {
            catalogId?: string;
            sourceId?: string;
            targetId?: string;
            startNodeId?: string; // For adding edge
            endNodeId?: string;
        };
    };
}

export interface ValidationOutput {
    errors: ValidationResult[];
    warnings: ValidationResult[];
    recommendations: ValidationResult[];
    isValid: boolean;
}

// ============================================
// Project & Lead Types
// ============================================

export interface Project {
    id: string;
    name: string;
    profile: DemoProfile;
    wizardData?: WizardData;
    graphData: GraphData;
    shareId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Lead {
    id: string;
    email: string;
    company: string;
    role?: string;
    source: 'save' | 'export' | 'share';
    projectId?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// UI State Types
// ============================================

export type ValueOverlay = 'activation' | 'measurement' | 'identity' | 'governance' | null;

export interface UIState {
    selectedNodeId: string | null;
    activeOverlay: ValueOverlay;
    validationResults: ValidationOutput | null;
    showLeadModal: boolean;
    leadModalAction: 'save' | 'export' | 'share' | null;
    isPaletteOpen: boolean;
    isInspectorOpen: boolean;
}

// ============================================
// Gap Analysis Types
// ============================================

export interface GapAnalysis {
    existingNodes: string[];
    recommendedNodes: string[];
    requiredNodes: string[];
    gapNodes: string[];
    allNodes: string[];
}

// ============================================
// Edge Validation Helper Types
// ============================================

export interface EdgeValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export function isRailCategory(category: NodeCategory): boolean {
    return category === 'governance';
}

export function isPipelineCategory(category: NodeCategory): category is PipelineCategory {
    return true; // All are pipeline categories now in the unified schema
}

// ============================================
// Auto Layout Types
// ============================================

export interface SuggestedEdge {
    id: string;
    source: string;           // Node ID
    target: string;           // Node ID
    sourcePort: string;       // Port ID
    targetPort: string;       // Port ID
    portTypes: {
        source: PortType;
        target: PortType;
    };
    confidence: 'high' | 'medium' | 'low';
    reason: string;
    selected?: boolean;       // For UI checkboxes
    sourceCatalogId?: string; // Optional for Smart Connect compatibility
    targetCatalogId?: string; // Optional for Smart Connect compatibility
}

export interface MissingNodeSuggestion {
    stage: PipelineStage;
    recommendedCatalogIds: string[];
    reason: string;
    severity: 'critical' | 'recommended' | 'optional';
}

export interface DuplicateConflict {
    uniquenessKey: string;
    existingNodeId: string;
    existingCatalogId: string;
    newCatalogId: string;
    resolution: 'replace' | 'keep_both' | 'pending';
}

export interface SuggestedFixes {
    autoApplyEdges: Array<{
        source: string;
        target: string;
        sourceCatalogId: string;
        targetCatalogId: string;
    }>;
    suggestedEdges: SuggestedEdge[];
    suggestedNodes: Array<{
        catalogId: string;
        reason: string;
        category: NodeCategory;
    }>;
    missingNodes: MissingNodeSuggestion[];
    duplicates: DuplicateConflict[];
    orphanedNodes: string[];  // Node IDs with no connections
    totalSuggestions: number;
}

export type AutoLayoutPhase =
    | 'idle'
    | 'normalizing'
    | 'deduplicating'
    | 'laying_out'
    | 'suggesting';

export interface AutoLayoutState {
    isRunning: boolean;
    phase: AutoLayoutPhase;
    stageAssignments: Record<string, PipelineStage>;  // nodeId → stage
    targetPositions: Record<string, { x: number; y: number }>;
    suggestedFixes: SuggestedFixes | null;
    selectedSuggestionIds: string[];
    pendingReplace: DuplicateConflict | null;
}

// Stage-to-column mapping for layout
// Stage-to-column mapping for layout (Hub-and-Spoke)
export const STAGE_TO_COLUMN: Record<PipelineStage, number> = {
    sources: 0,
    collection: 1,
    ingestion: 1,
    storage_raw: 1,
    storage_warehouse: 1,
    transform: 1,
    mdf: 2,                 // Central Hub
    mdf_hygiene: 2,         // Internal
    mdf_measurement: 2,     // Internal
    identity: 2,
    governance: 2,          // Rail
    analytics: 3,
    activation: 3,
    clean_room: 3,
    realtime_serving: 3,
    destination: 4
};

// ============================================
// Phase 2: Collaboration & Versioning
// ============================================

export interface SimulationSnapshot {
    id: string;
    name: string;
    timestamp: number;
    description?: string;
    nodes: any[]; // Using any[] to avoid circular dep issues for now, strictly GraphData['nodes']
    edges: any[];
    validationResults?: ValidationOutput;
    thumbnail?: string; // Base64 or URL
    author?: string;
}

export interface Comment {
    id: string;
    type: 'node' | 'edge' | 'global';
    targetId?: string; // nodeId or edgeId
    content: string;
    author: string;
    timestamp: number;
    resolved?: boolean;
}

// ============================================
// Phase 2: Scenarios & Templates
// ============================================

export interface ScenarioDefinition {
    id: string;
    name: string;
    description: string;
    category: 'B2C' | 'B2B' | 'Privacy' | 'Growth';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    templateGraph: GraphData;
    learningGoals: string[];
}

export interface ImpactMetric {
    score: number; // 0-100
    effort: 'low' | 'medium' | 'high';
    latency: 'realtime' | 'batch';
}

