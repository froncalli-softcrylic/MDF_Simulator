// API Route: Mobile Notify
// POST: Send email with link to user

import { NextRequest, NextResponse } from 'next/server'

// In-memory store for email capture (replace with real email service in production)
const emailCaptures: Array<{ email: string; timestamp: string }> = []

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Store email (in production, integrate with email service like SendGrid, Resend, etc.)
        emailCaptures.push({
            email,
            timestamp: new Date().toISOString()
        })

        // Log for development
        console.log(`📧 Mobile notify request:
  Email: ${email}
  Time: ${new Date().toISOString()}
  Total captures: ${emailCaptures.length}
  
  In production, this would send an email with:
  - Subject: Your MDF Simulator Link
  - Body: Thank you for your interest! Access MDF Simulator here: ${process.env.NEXT_PUBLIC_APP_URL || 'https://mdfsimulator.com'}
`)

        // In production, send actual email via:
        // - SendGrid: await sgMail.send({ to: email, ... })
        // - Resend: await resend.emails.send({ to: email, ... })
        // - AWS SES: await ses.sendEmail({ Destination: { ToAddresses: [email] }, ... })

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully'
        })
    } catch (error) {
        console.error('Failed to process mobile notify:', error)
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        )
    }
}
