import type { Node } from '@xyflow/react';
import { CatalogNode } from '@/types';
import { nodeCatalog } from '@/data/node-catalog';

interface FlowScore {
    totalROI: number;
    totalComplexity: number;
    roiScore: number; // Normalized 0-100
    complexityScore: number; // Normalized 0-100
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    warnings: string[];
}

/**
 * Calculate the impact and complexity of the current flow
 */
export function calculateFlowImpact(nodes: Node[]): FlowScore {
    let totalROI = 0;
    let totalComplexity = 0;
    const warnings: string[] = [];

    nodes.forEach(node => {
        const catalogNode = nodeCatalog.find(n => n.id === node.data.catalogId);
        if (!catalogNode) return;

        // ROI Calculation
        const roi = catalogNode.businessValue?.roi || 'low';
        const roiValue = roi === 'high' ? 100 : roi === 'medium' ? 50 : 10;
        totalROI += roiValue;

        // Complexity Calculation
        const complexity = catalogNode.complexity || 5;
        totalComplexity += complexity;
    });

    const nodeCount = nodes.length || 1;
    const avgROI = totalROI / nodeCount;
    const avgComplexity = totalComplexity / nodeCount;

    // Determine Rating
    let rating: FlowScore['rating'] = 'good';
    if (avgROI > 70 && avgComplexity < 6) rating = 'excellent';
    else if (avgROI < 30 && avgComplexity > 7) rating = 'poor';
    else if (avgROI < 50 || avgComplexity > 7) rating = 'fair';

    if (avgComplexity > 8) warnings.push('High Complexity Warning: This architecture may be difficult to maintain.');
    if (avgROI < 30) warnings.push('Low ROI Warning: Consider adding high-impact activation nodes.');

    return {
        totalROI,
        totalComplexity,
        roiScore: Math.round(avgROI),
        complexityScore: Math.round(avgComplexity * 10), // Scale 1-10 to 10-100
        rating,
        warnings
    };
}

/**
 * Suggest next nodes based on current leaf nodes
 */
export function suggestNextSteps(nodes: Node[]): CatalogNode[] {
    const suggestions: CatalogNode[] = [];

    // Find leaf nodes (nodes with no outputs connected - tricky without edges, 
    // so we'll just look at the last few added or all nodes for now)

    const processedIds = new Set(nodes.map(n => n.data.catalogId));

    nodes.forEach(node => {
        const catalogNode = nodeCatalog.find(n => n.id === node.data.catalogId);
        if (!catalogNode?.recommendedNext) return;

        catalogNode.recommendedNext.forEach((nextId: string) => {
            if (!processedIds.has(nextId)) {
                const nextNode = nodeCatalog.find(n => n.id === nextId);
                if (nextNode && !suggestions.find(s => s.id === nextId)) {
                    suggestions.push(nextNode);
                }
            }
        });
    });

    // Sort by ROI
    return suggestions.sort((a, b) => {
        const roiA = a.businessValue?.roi === 'high' ? 3 : a.businessValue?.roi === 'medium' ? 2 : 1;
        const roiB = b.businessValue?.roi === 'high' ? 3 : b.businessValue?.roi === 'medium' ? 2 : 1;
        return roiB - roiA;
    }).slice(0, 5); // Return top 5
}
