// Connection Rules - Single source of truth for MDF pipeline connection contract
// Consolidates PORT_COMPATIBILITY, DESTINATION_ALLOWED_INPUTS, and named exceptions
// Used by both validation-engine.ts and smart-connect-engine.ts

import type { PortType, NodeCategory } from '@/types'

// ============================================
// PORT COMPATIBILITY MATRIX
// ============================================
// isPortCompatible(sourceOutput, targetInput) → boolean
// Key = target input port type, Value = acceptable source output port types

export const PORT_COMPATIBILITY: Record<PortType, PortType[]> = {
    // Raw types accept each other
    raw_events: ['raw_events', 'stream_events', 'dataset_raw'],
    raw_records: ['raw_records', 'dataset_raw', 'crm_data'],
    stream_events: ['stream_events', 'raw_events'],
    dataset_raw: ['dataset_raw', 'raw_records', 'raw_events'],

    // Curated types (after transform)
    curated_entities: ['curated_entities', 'raw_records', 'crm_data'],
    identity_keys: ['identity_keys', 'curated_entities', 'raw_records', 'identity_resolution'],
    identity_resolution: ['identity_resolution', 'identity_keys', 'graph_edges'],
    graph_edges: ['graph_edges', 'identity_resolution', 'identity_keys'],

    // Output types (activation/analytics)
    metrics: ['metrics', 'curated_entities', 'analysis_result'],
    audiences_accounts: ['audiences_accounts', 'curated_entities'],
    audiences_people: ['audiences_people', 'curated_entities'],
    activation_payload: ['activation_payload', 'audiences_accounts', 'audiences_people'],
    analysis_result: ['analysis_result', 'metrics'],

    // Governance (rail)
    governance_policies: ['governance_policies'],
    audit_events: ['audit_events', 'governance_policies'],

    // CRM-specific
    crm_data: ['crm_data', 'raw_records', 'curated_entities'],
}

// ============================================
// DESTINATION INPUT RESTRICTIONS
// ============================================
// Destinations NEVER accept: raw_events, raw_records, stream_events,
//   dataset_raw, identity_keys, graph_edges, governance_policies

export const DESTINATION_ALLOWED_INPUTS: PortType[] = [
    'audiences_accounts',
    'audiences_people',
    'activation_payload',
    'curated_entities',  // Only for direct reverse ETL
]

// ============================================
// PORT COMPATIBILITY FUNCTION
// ============================================

export function isPortCompatible(outputType: PortType, inputType: PortType): boolean {
    if (outputType === inputType) return true
    const compatible = PORT_COMPATIBILITY[inputType] || []
    return compatible.includes(outputType)
}

// ============================================
// NAMED EXCEPTIONS
// ============================================
// Connections that are normally blocked but allowed under specific conditions

export interface ConnectionException {
    id: string
    source: NodeCategory
    target: NodeCategory
    allowedPortTypes: PortType[]
    condition: string                // Human-readable condition description
    warningMessage?: string          // Show as warning when this exception is used
}

export const CONNECTION_EXCEPTIONS: ConnectionException[] = [
    {
        id: 'server_side_conversion_api',
        source: 'collection',
        target: 'activation',
        allowedPortTypes: ['stream_events', 'raw_events'],
        condition: 'Server-side conversion API pattern (real-time events → activation)',
        warningMessage: 'Server-side conversion API: Ensure source supports real-time latency.'
    },
    {
        id: 'offline_conversion_import',
        source: 'activation',
        target: 'analytics',
        allowedPortTypes: ['activation_payload'],
        condition: 'Offline conversion import / backfill to analytics',
        warningMessage: 'Offline conversion import: Analytics will receive activation payloads for attribution.'
    },
    {
        id: 'warehouse_to_cdp_sync',
        source: 'storage_warehouse',
        target: 'mdf',
        allowedPortTypes: ['raw_records', 'curated_entities'],
        condition: 'Warehouse-to-CDP sync (warehouse-first architecture)',
        warningMessage: 'Warehouse → CDP sync: Consider adding Transform layer for data modeling.'
    },
    {
        id: 'clean_room_to_activation',
        source: 'clean_room',
        target: 'activation',
        allowedPortTypes: ['audiences_accounts'],
        condition: 'Clean room aggregated audiences (no PII)',
        warningMessage: 'Clean room output: Only aggregated audiences allowed, no PII.'
    },
    {
        id: 'direct_source_to_warehouse',
        source: 'sources',
        target: 'storage_warehouse',
        allowedPortTypes: ['raw_records', 'crm_data'],
        condition: 'Direct source-to-warehouse load (batch CRM/billing sources)',
        warningMessage: 'Direct load: Consider adding an ingestion tool (Fivetran/Airbyte) for better orchestration.'
    },
    {
        id: 'analytics_to_activation',
        source: 'analytics',
        target: 'activation',
        allowedPortTypes: ['metrics', 'analysis_result'],
        condition: 'Analytics scores/segments fed to audience builder',
        warningMessage: 'Analytics → Activation: Propensity scores and segments powering audience building.'
    },
]

/**
 * Check if a connection matches a named exception
 */
export function findMatchingException(
    sourceCategory: NodeCategory,
    targetCategory: NodeCategory,
    sourcePortType?: PortType
): ConnectionException | null {
    for (const exception of CONNECTION_EXCEPTIONS) {
        if (exception.source === sourceCategory && exception.target === targetCategory) {
            if (!sourcePortType || exception.allowedPortTypes.includes(sourcePortType)) {
                return exception
            }
        }
    }
    return null
}
