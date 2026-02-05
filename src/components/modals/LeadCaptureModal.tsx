'use client'

// Lead Capture Modal - Gate for save/export/share actions

import { useState, useCallback, useRef } from 'react'
import { useUIStore } from '@/store/ui-store'
import { useCanvasStore } from '@/store/canvas-store'
import { exportAndDownload } from '@/lib/export-service'
import { logger } from '@/lib/logger'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function LeadCaptureModal() {
    const { showLeadModal, leadModalAction, closeLeadModal } = useUIStore()
    const { exportGraph, projectId } = useCanvasStore()

    const [email, setEmail] = useState('')
    const [company, setCompany] = useState('')
    const [role, setRole] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [shareUrl, setShareUrl] = useState<string | null>(null)
    const canvasRef = useRef<HTMLElement | null>(null)

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !company) return

        setIsSubmitting(true)

        try {
            // Save lead and project
            const graphData = exportGraph()

            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    company,
                    role: role || undefined,
                    source: leadModalAction,
                    graphData,
                    projectId
                })
            })

            if (!response.ok) throw new Error('Failed to save')

            const result = await response.json()

            // Handle action-specific behavior
            if (leadModalAction === 'export') {
                // Trigger download
                const canvas = document.querySelector('.react-flow') as HTMLElement
                if (canvas) {
                    await exportAndDownload(canvas, `mdf-diagram-${Date.now()}`, 'png')
                }
            } else if (leadModalAction === 'share') {
                // Show share URL
                if (result.shareUrl) {
                    setShareUrl(result.shareUrl)
                }
            }

            setIsSuccess(true)
        } catch (error) {
            logger.error('Lead capture failed:', error)
        } finally {
            setIsSubmitting(false)
        }
    }, [email, company, role, leadModalAction, exportGraph, projectId])

    const handleClose = () => {
        closeLeadModal()
        // Reset form after animation
        setTimeout(() => {
            setEmail('')
            setCompany('')
            setRole('')
            setIsSuccess(false)
            setShareUrl(null)
        }, 200)
    }

    const getTitle = () => {
        switch (leadModalAction) {
            case 'save': return 'Save Your Diagram'
            case 'export': return 'Export Your Diagram'
            case 'share': return 'Share Your Diagram'
            default: return 'Save Your Work'
        }
    }

    const getDescription = () => {
        switch (leadModalAction) {
            case 'save': return 'Enter your details to save your MDF architecture.'
            case 'export': return 'Enter your details to download your diagram.'
            case 'share': return 'Enter your details to get a shareable link.'
            default: return 'Enter your details to continue.'
        }
    }

    return (
        <Dialog open={showLeadModal} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                {isSuccess ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Success!
                            </DialogTitle>
                            <DialogDescription>
                                {leadModalAction === 'export' && 'Your diagram is downloading.'}
                                {leadModalAction === 'share' && 'Your share link is ready.'}
                                {leadModalAction === 'save' && 'Your diagram has been saved.'}
                            </DialogDescription>
                        </DialogHeader>

                        {shareUrl && (
                            <div className="mt-4">
                                <Label>Share Link</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input value={shareUrl} readOnly />
                                    <Button
                                        variant="outline"
                                        onClick={() => navigator.clipboard.writeText(shareUrl)}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-4">
                            <Button onClick={handleClose}>Done</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{getTitle()}</DialogTitle>
                            <DialogDescription>{getDescription()}</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Work Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="company">Company *</Label>
                                <Input
                                    id="company"
                                    placeholder="Acme Inc."
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role (optional)</Label>
                                <Input
                                    id="role"
                                    placeholder="VP of Marketing"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !email || !company}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Continue'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
