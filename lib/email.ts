import { Resend } from "resend"

// Lazy initialization — evaluated at call time, not at module load.
// This lets scripts like test-emails.ts load dotenv before the key is read.
function getResend(): Resend | null {
  return process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<{ success: boolean; id?: string; mock?: boolean; error?: unknown }> {
  const resend = getResend()
  if (!resend) {
    return { success: true, mock: true }
  }
  try {
    const fromAddress = from || process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || "ClientLabs <onboarding@resend.dev>"
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    })
    if (error) {
      console.error("[EMAIL] Error:", error)
      return { success: false, error }
    }
    return { success: true, id: data?.id }
  } catch (e) {
    console.error("[EMAIL] Exception:", e)
    return { success: false, error: e }
  }
}
