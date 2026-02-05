// Core Types for MDF Simulator - B2B SaaS Optimized
// Updated with proper category structure, typed ports, and edge validation support

// ============================================
// Node Category Types (B2B SaaS Pipeline)
// ============================================

// Pipeline categories (data flows left to right)
export type PipelineCategory =
    | 'source'           // Data origins
    | 'collection'       // SDKs, event tracking
    | 'ingestion'        // Streaming/batch pipelines
    | 'storage_raw'      // Immutable raw data lake
    | 'storage_warehouse'// Structured analytics store
    | 'transform'        // dbt, modeling
    | 'analytics'        // BI, attribution, MMM
    | 'activation'       // Reverse ETL, CDPs
    | 'destination';     // Ad platforms, CRM, email

// Cross-cutting rail categories (visual lanes)
export type RailCategory =
    | 'governance_rail'  // Spans all stages (top)
    | 'account_graph';   // Hub between transform and outputs

// Combined category type
export type NodeCategory = PipelineCategory | RailCategory;

// Category ordering for layout (column positions)
export const CATEGORY_ORDER: Record<PipelineCategory, number> = {
    source: 0,
    collection: 1,
    ingestion: 2,
    storage_raw: 3,
    storage_warehouse: 4,
    transform: 5,
    analytics: 6,
    activation: 6,  // Same column as analytics (parallel)
    destination: 7
};

// ============================================
// Port Types (B2B SaaS Deterministic Model)
// ============================================

export type PortType =
    // Raw data types (left side of pipeline)
    | 'raw_events'         // Clickstream, product events
    | 'raw_records'        // Batch records from sources
    | 'stream'             // Real-time stream (Kinesis, Kafka)

    // Curated types (after transform)
    | 'curated_entities'   // Modeled tables (accounts, contacts, opps)
    | 'identity_keys'      // Account ID, domain, email hash, user ID
    | 'graph_edges'        // Account↔Contact↔Opportunity relationships

    // Output types (activation/analytics)
    | 'metrics'            // Aggregated analytics data
    | 'audiences_accounts' // B2B account lists
    | 'audiences_people'   // Contact/lead lists

    // Governance types (rail)
    | 'governance_policies'// Consent, access, retention rules
    | 'audit_events'       // Compliance audit trail

    // Legacy/flexible
    | 'any';               // Accepts any type (for generic nodes)

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
        { source: 'source', target: 'collection', allowedPortTypes: ['raw_events', 'raw_records'] },
        { source: 'source', target: 'ingestion', allowedPortTypes: ['raw_events', 'raw_records'] },
        { source: 'collection', target: 'ingestion', allowedPortTypes: ['raw_events', 'raw_records', 'stream'] },
        { source: 'ingestion', target: 'storage_raw', allowedPortTypes: ['stream', 'raw_records'] },
        { source: 'storage_raw', target: 'storage_warehouse', allowedPortTypes: ['raw_records'] },
        { source: 'ingestion', target: 'storage_warehouse', allowedPortTypes: ['raw_records'] }, // Warehouse-first
        { source: 'storage_warehouse', target: 'transform', allowedPortTypes: ['raw_records', 'curated_entities'] },

        // Transform to outputs (parallel)
        { source: 'transform', target: 'analytics', allowedPortTypes: ['curated_entities', 'metrics'] },
        { source: 'transform', target: 'activation', allowedPortTypes: ['curated_entities', 'audiences_accounts', 'audiences_people'] },
        { source: 'transform', target: 'account_graph', allowedPortTypes: ['identity_keys', 'curated_entities'] },

        // Account graph hub flows
        { source: 'account_graph', target: 'analytics', allowedPortTypes: ['graph_edges', 'curated_entities'] },
        { source: 'account_graph', target: 'activation', allowedPortTypes: ['audiences_accounts', 'audiences_people', 'graph_edges'] },

        // Activation to destinations
        { source: 'activation', target: 'destination', allowedPortTypes: ['audiences_accounts', 'audiences_people'] },

        // Governance rail (can attach to any)
        { source: 'governance_rail', target: 'collection', allowedPortTypes: ['governance_policies'] },
        { source: 'governance_rail', target: 'ingestion', allowedPortTypes: ['governance_policies'] },
        { source: 'governance_rail', target: 'storage_raw', allowedPortTypes: ['governance_policies'] },
        { source: 'governance_rail', target: 'storage_warehouse', allowedPortTypes: ['governance_policies'] },
        { source: 'governance_rail', target: 'transform', allowedPortTypes: ['governance_policies'] },
        { source: 'governance_rail', target: 'activation', allowedPortTypes: ['governance_policies'] },
    ];

// Nonsense prevention rules
export const INVALID_EDGE_RULES = [
    { message: 'Destinations cannot accept raw events', targetCategory: 'destination' as NodeCategory, forbiddenPortTypes: ['raw_events', 'raw_records', 'stream'] as PortType[] },
    { message: 'Analytics cannot output to destinations directly', sourceCategory: 'analytics' as NodeCategory, targetCategory: 'destination' as NodeCategory },
    { message: 'Sources cannot receive inputs', targetCategory: 'source' as NodeCategory },
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
    | 'enrichment';           // NEW: Clearbit/ZoomInfo

// ============================================
// Demo Profiles
// ============================================

export type DemoProfile =
    | 'preferred_stack'   // Snowflake + AWS + Neptune + Hightouch
    | 'adobe_summit'
    | 'google_cloud'
    | 'salesforce'
    | 'generic';

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
    | 'source'
    | 'collection'
    | 'ingestion'
    | 'storage_raw'
    | 'storage_warehouse'
    | 'transform'
    | 'identity_hub'      // Account graph hub
    | 'analytics'
    | 'activation'
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
    railPosition?: 'top' | 'bottom'; // For governance rail

    // NEW: Smart Connect Hints
    autoConnectPriority?: number;   // Higher = connect first (0-100)
    preferredUpstream?: string[];   // Catalog IDs to prioritize
    preferredDownstream?: string[]; // Catalog IDs to connect to
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
    return category === 'governance_rail' || category === 'account_graph';
}

export function isPipelineCategory(category: NodeCategory): category is PipelineCategory {
    return !isRailCategory(category);
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
    suggestedEdges: SuggestedEdge[];
    missingNodes: MissingNodeSuggestion[];
    duplicates: DuplicateConflict[];
    orphanedNodes: string[];  // Node IDs with no connections
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
export const STAGE_TO_COLUMN: Record<PipelineStage, number> = {
    source: 0,
    collection: 1,
    ingestion: 2,
    storage_raw: 3,
    storage_warehouse: 4,
    transform: 5,
    identity_hub: 6,
    analytics: 7,
    activation: 7,   // Parallel with analytics
    destination: 8
};

