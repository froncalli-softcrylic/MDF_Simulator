// API Route: Share
// GET: Fetch shared project by shareId

import { NextRequest, NextResponse } from 'next/server'

// In-memory stores for MVP (shared with other routes)
const shares = new Map<string, string>() // shareId -> projectId
const projects = new Map<string, any>()

export async function GET(
    request: NextRequest,
    { params }: { params: { shareId: string } }
) {
    try {
        const shareId = params.shareId

        // Look up projectId from shareId
        const projectId = shares.get(shareId)

        if (!projectId) {
            return NextResponse.json(
                { error: 'Share not found' },
                { status: 404 }
            )
        }

        const project = projects.get(projectId)

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        // Return only necessary data for share view
        return NextResponse.json({
            graphData: project.graphData,
            profile: project.profile,
            createdAt: project.createdAt
        })
    } catch (error) {
        console.error('Failed to fetch share:', error)
        return NextResponse.json(
            { error: 'Failed to fetch share' },
            { status: 500 }
        )
    }
}
