/**
 * API Route: POST /api/events — Register a lead event
 *             GET  /api/events — List events for a lead
 *
 * Multi-tenant: every request validated via session.user.id
 * Clean architecture: controller layer only — delegates to LeadEventService
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
    LeadEventService,
    LeadEventError,
    validateEventInput,
} from '@/lib/events/leadEventService'

/* ── POST /api/events ───────────────────────────────── */
export async function POST(request: NextRequest) {
    try {
        // ── Auth ──────────────────────────────────────────
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // ── Parse body ───────────────────────────────────
        let body: Record<string, unknown>
        try {
            body = await request.json()
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body', code: 'INVALID_JSON' },
                { status: 400 }
            )
        }

        const { leadId, eventType, eventSource, metadata } = body as {
            leadId?: string
            eventType?: string
            eventSource?: string
            metadata?: Record<string, unknown>
        }

        // ── Validate ─────────────────────────────────────
        const errors = validateEventInput({
            userId,
            leadId,
            eventType,
            eventSource: eventSource ?? 'api',
            metadata: metadata ?? {},
        })

        if (errors.length > 0) {
            return NextResponse.json(
                { error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors },
                { status: 400 }
            )
        }

        // ── Register event ───────────────────────────────
        const result = await LeadEventService.registerLeadEvent({
            userId,
            leadId: leadId!,
            eventType: eventType!,
            eventSource: eventSource ?? 'api',
            metadata: metadata ?? {},
        })

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        // ── Known business errors ────────────────────────
        if (error instanceof LeadEventError) {
            return NextResponse.json(
                { error: error.message, code: error.code },
                { status: error.statusCode }
            )
        }

        // ── Unexpected errors ────────────────────────────
        console.error('[POST /api/events] Unhandled error:', error)
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}

/* ── GET /api/events ────────────────────────────────── */
export async function GET(request: NextRequest) {
    try {
        // ── Auth ──────────────────────────────────────────
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // ── Query params ─────────────────────────────────
        const { searchParams } = new URL(request.url)
        const leadId = searchParams.get('leadId')
        const limit = Math.min(
            Math.max(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 1),
            100
        )
        const offset = Math.max(
            parseInt(searchParams.get('offset') ?? '0', 10) || 0,
            0
        )

        if (!leadId) {
            return NextResponse.json(
                { error: 'leadId query parameter is required', code: 'MISSING_LEAD_ID' },
                { status: 400 }
            )
        }

        // ── Fetch events ─────────────────────────────────
        const result = await LeadEventService.getLeadEvents(
            leadId,
            userId,
            limit,
            offset
        )

        return NextResponse.json(result)
    } catch (error) {
        // ── Known business errors ────────────────────────
        if (error instanceof LeadEventError) {
            return NextResponse.json(
                { error: error.message, code: error.code },
                { status: error.statusCode }
            )
        }

        // ── Unexpected errors ────────────────────────────
        console.error('[GET /api/events] Unhandled error:', error)
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
