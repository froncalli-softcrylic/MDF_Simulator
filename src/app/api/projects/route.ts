// API Route: Projects
// POST: Create new project
// GET: List projects (by session cookie)

import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// In-memory store for MVP (replace with Prisma in production)
const projects = new Map<string, any>()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { wizardData, graphData, profile = 'preferred_stack' } = body

        const projectId = nanoid(10)
        const project = {
            id: projectId,
            name: 'Untitled Project',
            profile,
            wizardData: wizardData || null,
            graphData: graphData || { nodes: [], edges: [] },
            shareId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        projects.set(projectId, project)

        return NextResponse.json({ projectId, success: true })
    } catch (error) {
        console.error('Failed to create project:', error)
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        // For MVP, return all projects (in production, filter by session)
        const allProjects = Array.from(projects.values())
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 10)

        return NextResponse.json({ projects: allProjects })
    } catch (error) {
        console.error('Failed to list projects:', error)
        return NextResponse.json(
            { error: 'Failed to list projects' },
            { status: 500 }
        )
    }
}
