import { Node } from '@xyflow/react'
import { nodeCatalog } from '@/data/node-catalog'
import { CatalogNode, NodeCategory } from '@/types'

export interface Recommendation {
    id: string
    title: string
    description: string
    reason: string
    suggestedNodes: CatalogNode[]
    action: 'add' | 'swap' | 'remove'
    targetNodeId?: string // For swap/remove actions
    impact: 'high' | 'medium' | 'low'
    category: 'completeness' | 'enhancement' | 'governance' | 'modernization'
    roi?: string
    businessValue?: string
}

export interface ConsultationContext {
    goals: string[]
    painPoints: string[]
    industry?: string
}

// Map Pain Points to "Enables" tags or Categories they need
const PAIN_POINT_MAPPING: Record<string, { enables?: string[], categories?: string[] }> = {
    'data_silos': { categories: ['storage_warehouse', 'mdf'] },
    'poor_attribution': { enables: ['measurement', 'identity'] },
    'compliance_risks': { categories: ['governance'] },
    'slow_reporting': { categories: ['transform', 'analytics'] },
    'low_match_rates': { enables: ['identity'] },
    'manual_work': { categories: ['ingestion', 'activation'] }, // Automation tools
}

// Known "Legacy" -> "Modern" upgrade paths
const UPGRADE_PATHS: Record<string, string[]> = {
    'manual_csv': ['fivetran', 'mdf_hub'],
    'legacy_script': ['segment', 'rudderstack'],
    'universal_analytics': ['google_analytics_4', 'amplitude'],
    'jenkins_scripts': ['dbt_core', 'airflow']
}

/**
 * Analyzes the current graph + User Context to return strategic recommendations.
 */
export function generateConsultation(nodes: Node[], context: ConsultationContext): Recommendation[] {
    const recommendations: Recommendation[] = []
    const existingCatalogIds = new Set(nodes.map(n => n.data?.catalogId as string))
    const existingCategories = new Set(nodes.map(n => n.data?.category as string))

    const hasNode = (id: string) => existingCatalogIds.has(id)
    const hasCategory = (cat: string) => existingCategories.has(cat)

    // Helper to get full node object
    function getNode(id: string): CatalogNode | undefined {
        return nodeCatalog.find(n => n.id === id)
    }

    // 1. SWAP / MODERNIZATION CHECKS (Highest Priority if Pain Points align)
    // ------------------------------------------------------------------
    nodes.forEach(node => {
        const catalogId = node.data.catalogId as string
        const upgrades = UPGRADE_PATHS[catalogId]

        if (upgrades) {
            // Found a legacy node. Should we swap it?
            const upgradeCandidates = upgrades.map(id => getNode(id)!).filter(Boolean)

            // Check if this legacy tool is causing a selected pain point
            // e.g. Manual CSV causes "manual_work" or "data_silos"
            const relevantPainPoints = context.painPoints.filter(pp => {
                if (catalogId === 'manual_csv' && pp === 'manual_work') return true
                if (catalogId === 'universal_analytics' && pp === 'compliance_risks') return true
                if (catalogId === 'legacy_script' && pp === 'poor_attribution') return true
                return false
            })

            const isUrgent = relevantPainPoints.length > 0

            recommendations.push({
                id: `swap-${catalogId}`,
                title: `Upgrade ${node.data.label}`,
                description: `Replace ${node.data.label} with modern infrastructure.`,
                reason: isUrgent
                    ? `You cited "${relevantPainPoints.join(', ')}" as a pain point. This legacy tool is likely the root cause.`
                    : `Modernize your stack to improve scalability and reduce technical debt.`,
                suggestedNodes: upgradeCandidates,
                action: 'swap',
                targetNodeId: node.id,
                impact: isUrgent ? 'high' : 'medium',
                category: 'modernization',
                roi: 'High - Reduces manual effort and risk',
                businessValue: 'Modern infrastructure scales with your growth.'
            })
        }
    })

    // 2. PAIN POINT DRIVEN ADDITIONS
    // ------------------------------------------------------------------
    context.painPoints.forEach(pp => {
        const mapping = PAIN_POINT_MAPPING[pp]
        if (!mapping) return

        // Check Categories
        if (mapping.categories) {
            mapping.categories.forEach(cat => {
                if (!hasCategory(cat)) {
                    // Suggest the best node for this category
                    const candidate = nodeCatalog.find(n => n.category === cat && n.preferredStackNode)
                    if (candidate && !hasNode(candidate.id)) {
                        recommendations.push({
                            id: `solve-${pp}-${cat}`,
                            title: `Solve ${pp.replace('_', ' ')}`,
                            description: `Add ${candidate.name} to address this gap.`,
                            reason: `To solve "${pp}", you need a strong ${categoryMeta(cat).label} capability.`,
                            suggestedNodes: [candidate],
                            action: 'add',
                            impact: 'high',
                            category: 'enhancement',
                            roi: candidate.businessValue?.roi || 'high',
                            businessValue: candidate.businessValue?.proposition
                        })
                    }
                }
            })
        }

        // Check Capabilities (Enables)
        if (mapping.enables) {
            mapping.enables.forEach(capability => {
                // Find nodes that enable this capability AND are missing
                // Priority: Hub -> Specialized
                const candidate = nodeCatalog.find(n =>
                    n.enables.includes(capability as any) &&
                    n.preferredStackNode &&
                    !hasNode(n.id)
                )

                if (candidate) {
                    recommendations.push({
                        id: `enable-${capability}`,
                        title: `Enable ${capability}`,
                        description: `Add ${candidate.name} to unlock ${capability}.`,
                        reason: `You need better ${capability} to address "${pp}".`,
                        suggestedNodes: [candidate],
                        action: 'add',
                        impact: 'high',
                        category: 'enhancement',
                        roi: candidate.businessValue?.roi,
                        businessValue: candidate.businessValue?.proposition
                    })
                }
            })
        }
    })


    // 3. COMPLETENESS CHECKS (Backbone - Fallback)
    // ------------------------------------------------------------------

    // Warehouse but no Transform
    if (hasCategory('storage_warehouse') && !hasCategory('transform')) {
        const dbt = getNode('dbt_core')!
        recommendations.push({
            id: 'add-transform',
            title: 'Add Transformation Layer',
            description: 'Raw data needs modeling.',
            reason: 'Prevent your warehouse from becoming a "data swamp".',
            suggestedNodes: [dbt],
            action: 'add',
            impact: 'high',
            category: 'completeness',
            roi: 'High',
            businessValue: 'Trusted, modeled data for all downstream teams.'
        })
    }

    // Sources but no Collection
    if (nodes.filter(n => n.data?.category === 'sources' && !UPGRADE_PATHS[n.data?.catalogId as string]).length > 1 && !hasCategory('collection')) {
        const segment = getNode('segment')!
        recommendations.push({
            id: 'add-collection',
            title: 'Unify Data Collection',
            description: 'Centralize tracking with a CDP.',
            reason: 'Standardize data collection across all sources.',
            suggestedNodes: [segment],
            action: 'add',
            impact: 'high',
            category: 'completeness',
            roi: segment.businessValue?.roi,
            businessValue: segment.businessValue?.proposition
        })
    }

    // MDF Hub (The Ultimate Upsell)
    // If they have > 3 categories but no MDF Hub, suggest it
    if (nodes.length > 5 && !hasCategory('mdf')) {
        const hub = getNode('mdf_hub')!
        recommendations.push({
            id: 'add-mdf-hub',
            title: 'Centralize with MDF Hub',
            description: 'Unified Identity & Hygiene.',
            reason: 'Your stack is growing complex. A central Hub ensures a single source of truth for Customer Identity.',
            suggestedNodes: [hub],
            action: 'add',
            impact: 'high',
            category: 'modernization',
            roi: hub.businessValue?.roi,
            businessValue: hub.businessValue?.proposition
        })
    }

    // Deduplicate by ID (in case multiple paths suggest same node)
    const uniqueRecs = new Map<string, Recommendation>()
    recommendations.forEach(rec => {
        if (!uniqueRecs.has(rec.id)) {
            uniqueRecs.set(rec.id, rec)
        }
    })

    return Array.from(uniqueRecs.values())
}

/**
 * Backward compatibility wrapper
 */
export function generateStackRecommendations(nodes: Node[]): Recommendation[] {
    // Default context assumes no specific pain points, just standard best practices
    return generateConsultation(nodes, { goals: [], painPoints: [] })
}

// Helper for labels
function categoryMeta(cat: string) {
    const { categoryMeta } = require('@/data/node-catalog') // Lazy import to avoid cycle if strict
    return categoryMeta[cat] || { label: cat }
}
