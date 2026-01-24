import { NextRequest, NextResponse } from "next/server"
import { requireAuthenticatedUser, completeOnboarding } from "@/lib/auth-guards"

export async function POST(request: NextRequest) {
  try {
    // ✅ REQUIRE AUTHENTICATED USER
    const { session, dbUser } = await requireAuthenticatedUser()

    const { sector } = await request.json()

    if (!sector || typeof sector !== "string") {
      return NextResponse.json(
        { error: "Sector is required" },
        { status: 400 }
      )
    }

    // ✅ COMPLETE ONBOARDING
    await completeOnboarding(dbUser.id, sector)

    return NextResponse.json({
      success: true,
      redirect: "/dashboard/other"
    })

  } catch (error) {
    console.error("Error completing onboarding:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}