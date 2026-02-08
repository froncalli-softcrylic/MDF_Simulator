// Export Service - PNG export via html-to-image
// Server-side PDF is stubbed for future enhancement

import { toPng, toSvg } from 'html-to-image'
import { logger } from '@/lib/logger'

export interface ExportOptions {
    format: 'png' | 'svg'
    quality?: number
    backgroundColor?: string
}

export async function exportDiagramToImage(
    element: HTMLElement,
    options: ExportOptions = { format: 'png' }
): Promise<string> {
    const { format, quality = 1, backgroundColor = '#0f172a' } = options

    const filter = (node: HTMLElement) => {
        // Exclude controls and UI elements from export
        const excludeClasses = ['react-flow__controls', 'react-flow__minimap', 'react-flow__panel']
        return !excludeClasses.some(cls => node.classList?.contains(cls))
    }

    const exportOptions = {
        quality,
        backgroundColor,
        filter,
        cacheBust: true,
        pixelRatio: 2 // Higher resolution
    }

    try {
        if (format === 'svg') {
            return await toSvg(element, exportOptions)
        } else {
            return await toPng(element, exportOptions)
        }
    } catch (error) {
        logger.error('Export failed:', error)
        throw new Error('Failed to export diagram')
    }
}

export function downloadImage(dataUrl: string, filename: string): void {
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
}

export async function exportAndDownload(
    element: HTMLElement,
    filename: string = 'mdf-diagram',
    format: 'png' | 'svg' = 'png'
): Promise<void> {
    const dataUrl = await exportDiagramToImage(element, { format })
    downloadImage(dataUrl, `${filename}.${format}`)
}

// Placeholder for future PDF export
export async function exportToPdf(
    _element: HTMLElement,
    _filename: string = 'mdf-diagram'
): Promise<void> {
    // TODO: Implement server-side PDF generation
    // For now, fallback to PNG
    logger.warn('PDF export not yet implemented, using PNG fallback')
    throw new Error('PDF export coming soon')
}

// ============================================
// MARKDOWN EXPORT WITH RATIONALE
// ============================================

interface MarkdownExportInput {
    nodes: Array<{ id: string; data: any; position?: { x: number; y: number } }>
    edges: Array<{ id: string; source: string; target: string }>
    profileName?: string
    validationResults?: {
        errors?: Array<{ message: string; ruleViolated?: string }>
        warnings?: Array<{ message: string }>
        recommendations?: Array<{ message: string }>
    }
}

export function exportToMarkdown(input: MarkdownExportInput): string {
    const { nodes, edges, profileName, validationResults } = input
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    // Group nodes by stage
    const stageGroups: Record<string, Array<{ name: string; category: string; role?: string; value?: string }>> = {}
    for (const node of nodes) {
        const data = node.data || {}
        const stage = data.stage || data.category || 'unknown'
        if (!stageGroups[stage]) stageGroups[stage] = []
        stageGroups[stage].push({
            name: data.label || data.catalogId || node.id,
            category: data.category || 'unknown',
            role: data.nodeRole,
            value: data.businessValue?.proposition
        })
    }

    const stageOrder = ['sources', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse',
        'transform', 'identity', 'governance', 'analytics', 'activation', 'clean_room',
        'realtime_serving', 'destination']

    // Build markdown
    let md = `# MDF Architecture — Proposed Design\n\n`
    md += `**Profile**: ${profileName || 'Custom'}\n`
    md += `**Generated**: ${date}\n`
    md += `**Nodes**: ${nodes.length} | **Edges**: ${edges.length}\n\n`
    md += `---\n\n`

    // Architecture overview
    md += `## Pipeline Architecture\n\n`
    md += `| Stage | Components | Count |\n`
    md += `|-------|-----------|-------|\n`
    for (const stage of stageOrder) {
        const group = stageGroups[stage]
        if (!group || group.length === 0) continue
        const names = group.map(n => n.name).join(', ')
        md += `| ${stage.replace('_', ' ')} | ${names} | ${group.length} |\n`
    }
    md += `\n`

    // Node details
    md += `## Component Details\n\n`
    md += `| Component | Category | Role | Business Value |\n`
    md += `|-----------|----------|------|----------------|\n`
    for (const stage of stageOrder) {
        const group = stageGroups[stage]
        if (!group) continue
        for (const n of group) {
            md += `| ${n.name} | ${n.category} | ${n.role || '—'} | ${n.value || '—'} |\n`
        }
    }
    md += `\n`

    // Validation status
    if (validationResults) {
        md += `## Validation Status\n\n`
        const errors = validationResults.errors || []
        const warnings = validationResults.warnings || []
        const recs = validationResults.recommendations || []

        if (errors.length === 0 && warnings.length === 0) {
            md += `✅ **All validation checks passed.**\n\n`
        } else {
            if (errors.length > 0) {
                md += `### ❌ Errors (${errors.length})\n\n`
                for (const e of errors) {
                    md += `- ${e.message}\n`
                }
                md += `\n`
            }
            if (warnings.length > 0) {
                md += `### ⚠️ Warnings (${warnings.length})\n\n`
                for (const w of warnings) {
                    md += `- ${w.message}\n`
                }
                md += `\n`
            }
        }
        if (recs.length > 0) {
            md += `### 💡 Recommendations\n\n`
            for (const r of recs) {
                md += `- ${r.message}\n`
            }
            md += `\n`
        }
    }

    // Footer
    md += `---\n\n`
    md += `*Generated by MDF Simulator — Softcrylic*\n`

    return md
}

export function downloadMarkdown(content: string, filename: string = 'mdf-architecture'): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${filename}.md`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
}
