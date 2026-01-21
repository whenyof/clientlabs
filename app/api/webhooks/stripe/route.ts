"use server"

import { NextResponse } from "next/server"

// Estructura base para webhook de Stripe.
// TODO: validar firma del webhook con Stripe-Signature.
// TODO: mapear evento de pago a venta automática.
// TODO: persistir venta en la base de datos cuando exista.

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Ejemplo de estructura (placeholder):
    // const sale = {
    //   cliente: payload?.data?.object?.customer_details?.name ?? "Cliente Stripe",
    //   producto: payload?.data?.object?.description ?? "Pago Stripe",
    //   importe: payload?.data?.object?.amount_total ?? 0,
    //   canal: "Stripe",
    //   comercial: "Automatizado",
    //   estado: "ganada",
    //   fecha: new Date().toISOString().split("T")[0],
    //   origen: "automático",
    // }

    return NextResponse.json(
      { ok: true, received: true, eventType: payload?.type ?? "unknown" },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Payload inválido" },
      { status: 400 },
    )
  }
}
