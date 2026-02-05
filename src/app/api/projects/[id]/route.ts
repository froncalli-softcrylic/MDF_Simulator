// API Route: Project by ID
// GET: Fetch project
// PUT: Update project

import { NextRequest, NextResponse } from 'next/server'

// In-memory store (shared with projects/route.ts in production, use DB)
const projects = new Map<string, any>()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const project = projects.get(projectId)

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(project)
    } catch (error) {
        console.error('Failed to fetch project:', error)
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const body = await request.json()
        const { graphData, name, profile } = body

        const existing = projects.get(projectId)
        if (!existing) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        const updated = {
            ...existing,
            ...(graphData && { graphData }),
            ...(name && { name }),
            ...(profile && { profile }),
            updatedAt: new Date().toISOString()
        }

        projects.set(projectId, updated)

        return NextResponse.json({ success: true, project: updated })
    } catch (error) {
        console.error('Failed to update project:', error)
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        )
    }
}
