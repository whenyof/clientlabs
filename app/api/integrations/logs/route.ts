export const maxDuration = 10
// API route for integration logs

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
export async function GET(request: NextRequest) {
 const session = await getServerSession(authOptions)
 if (!session?.user?.id) {
   return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
 }
 try {
 // TODO: Query real integration logs from the database once the model is available
 return NextResponse.json({
 success: true,
 data: [],
 total: 0
 })
 } catch (error) {
 console.error('Error fetching integration logs:', error)
 return NextResponse.json(
 { success: false, error: 'Failed to fetch integration logs' },
 { status: 500 }
 )
 }
}