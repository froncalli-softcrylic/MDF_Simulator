// API Route: Leads
// POST: Capture lead and save/share project

import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// In-memory stores for MVP
const leads = new Map<string, any>()
const projects = new Map<string, any>()
const shares = new Map<string, string>() // shareId -> projectId

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, company, role, source, graphData, projectId } = body

        if (!email || !company) {
            return NextResponse.json(
                { error: 'Email and company are required' },
                { status: 400 }
            )
        }

        // Create lead
        const leadId = nanoid(10)
        const lead = {
            id: leadId,
            email,
            company,
            role: role || null,
            source,
            projectId: projectId || null,
            createdAt: new Date().toISOString()
        }
        leads.set(leadId, lead)

        let shareUrl: string | null = null
        let savedProjectId = projectId

        // Save project if graphData provided
        if (graphData) {
            if (!savedProjectId) {
                savedProjectId = nanoid(10)
            }

            const project = projects.get(savedProjectId) || {
                id: savedProjectId,
                name: `${company}'s MDF`,
                profile: 'preferred_stack',
                wizardData: null,
                graphData,
                shareId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            project.graphData = graphData
            project.updatedAt = new Date().toISOString()

            // Generate share link if source is 'share'
            if (source === 'share') {
                const shareId = nanoid(8)
                project.shareId = shareId
                shares.set(shareId, savedProjectId)

                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                shareUrl = `${baseUrl}/share/${shareId}`
            }

            projects.set(savedProjectId, project)
        }

        console.log(`Lead captured: ${email} from ${company} (${source})`)

        return NextResponse.json({
            success: true,
            leadId,
            projectId: savedProjectId,
            shareUrl
        })
    } catch (error) {
        console.error('Failed to capture lead:', error)
        return NextResponse.json(
            { error: 'Failed to capture lead' },
            { status: 500 }
        )
    }
}
