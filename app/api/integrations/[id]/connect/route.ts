export const maxDuration = 10
// API route for connecting/disconnecting integrations

import { NextRequest, NextResponse } from 'next/server'

export async function POST(
 request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
 const params = await props.params;
 try {
 const body = await request.json()
 const { action, config } = body
 const integrationId = params.id

 // TODO: Implement real connection logic
 // Mock response
 const response = {
 success: true,
 integrationId,
 status: action === 'connect' ? 'connected' : 'disconnected',
 timestamp: new Date().toISOString()
 }

 return NextResponse.json(response)
 } catch (error) {
 console.error('Error connecting integration:', error)
 return NextResponse.json(
 { success: false, error: 'Failed to connect integration' },
 { status: 500 }
 )
 }
}