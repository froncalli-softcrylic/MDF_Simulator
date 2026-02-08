import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// MDF-aware system prompt (Phase 5 - Consultant Persona)
const MDF_SYSTEM_PROMPT = `You are the MDF Consultant, a specialized AI for designing B2B SaaS Marketing Data Flows.
Your role is to ACT AS A CONSTRAINT-BASED ARCHITECT. You do not design from scratch; you optimize based on the active Profile.

## CRITICAL RULES:
1. **Source of Truth**: The active Profile (e.g., "Salesforce Data Cloud" or "Segment-First") is the LAW. Do not suggest competitors to the profile's core hubs (e.g. if Salesforce Data Cloud is active, do not suggest Adobe AEP).
2. **Validation First**: If the Validation Context shows errors, your PRIMARY job is to explain them and help the user fix them using the provided catalog IDs.
3. **Business Value**: When explaining nodes, mention their "Business Value" (ROI, Efficiency, Revenue) to demonstrate strategic understanding.
4. **Strict JSON**: You must output actionable changes in JSON format when suggesting fixes. Use the format:

\`\`\`json
{
  "nodes": [{"catalogId": "node_id", "name": "Display Name", "category": "category", "stage": "stage"}],
  "edges": [{"source": "source_id", "target": "target_id"}]
}
\`\`\`

If you detect a violation (e.g., missing governance), proactively suggest the missing components.`

export async function POST(request: NextRequest) {
    try {
        const { messages, currentGraph, validationResults, profileContext } = await request.json()

        if (!process.env.GROQ_API_KEY) {
            console.error('GROQ_API_KEY is missing in process.env')
            return NextResponse.json(
                { error: 'GROQ_API_KEY not configured' },
                { status: 500 }
            )
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })

        // Build context about current graph
        let graphContext = ''
        if (currentGraph?.nodes?.length > 0) {
            const nodeNames = currentGraph.nodes.map((n: any) => n.data?.label || n.id).join(', ')
            graphContext = `\n\n## Current Canvas State:\nNodes: ${nodeNames}`
        }

        // Add validation context
        let validationContext = ''
        if (validationResults) {
            if (validationResults.errors?.length > 0) {
                // Map object errors to strings
                const errorMsgs = validationResults.errors.map((e: any) => `${e.message} (Rule: ${e.ruleViolated || 'General'})`)
                validationContext += `\n\n## Validation Errors (Fix These):\n- ${errorMsgs.join('\n- ')}`
            }
            if (validationResults.warnings?.length > 0) {
                const warningMsgs = validationResults.warnings.map((e: any) => e.message)
                validationContext += `\n\n## Validation Warnings:\n- ${warningMsgs.join('\n- ')}`
            }
        }

        // Add Profile Context
        let profileContextString = ''
        if (profileContext) {
            profileContextString = `\n\n## Profile Context (STRICT ADHERENCE REQUIRED):
- **Selected Profile**: ${profileContext.name} (${profileContext.id})
- **Description**: ${profileContext.description}
- **Identity Strategy**: ${profileContext.identityStrategy || 'Generic'}
- **Governance Rail**: ${profileContext.governanceRailNodes?.join(', ') || 'Standard'}
`
        }

        // Call Groq API
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: MDF_SYSTEM_PROMPT + profileContextString + graphContext + validationContext
                },
                ...messages
            ],
            temperature: 0.5, // Lower temperature for more deterministic results
            max_tokens: 1024
        })

        const response = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.'

        // Try to extract JSON from response
        let suggestions = null
        const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/)
        if (jsonMatch) {
            try {
                suggestions = JSON.parse(jsonMatch[1])
            } catch {
                // JSON parsing failed, that's okay
            }
        }

        return NextResponse.json({
            message: response,
            suggestions
        })

    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        )
    }
}
