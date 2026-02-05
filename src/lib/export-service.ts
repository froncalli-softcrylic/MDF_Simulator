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
