export const maxDuration = 15

import { NextResponse } from "next/server"
import { getInstitutions } from "@/lib/banking/gocardless"

export async function GET() {
  try {
    const institutions = await getInstitutions("ES")
    return NextResponse.json(institutions)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
