import { prisma } from "../lib/prisma"
import { runAutomation } from "../lib/automations/engine"

const EMAIL_TEST = "iyanrimada@gmail.com"

async function main() {
  const usuario = await prisma.user.findFirst({
    select: { id: true, name: true, email: true },
  })

  if (!usuario) {
    console.log("No hay usuarios en la DB")
    process.exit(1)
  }

  console.log("=".repeat(50))
  console.log("TEST AUTOMATIZACIONES CLIENTLABS")
  console.log(`Usuario: ${usuario.email}`)
  console.log(`Emails de test a: ${EMAIL_TEST}`)
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "CONFIGURADA" : "FALTA"}`)
  console.log("=".repeat(50))

  const tests: Array<{ tipo: string; datos: Record<string, string> }> = [
    // ── PARA TI ──────────────────────────────────────────────────────────────
    {
      tipo: "LEAD_NUEVO",
      datos: {
        "lead.nombre": "Maria Garcia",
        "lead.email": EMAIL_TEST,
        "lead.telefono": "666 123 456",
        "lead.fuente": "Web (test)",
        "lead.fecha": new Date().toLocaleDateString("es-ES"),
        leadId: "test-001",
      },
    },
    {
      tipo: "LEAD_SIN_CONTACTAR",
      datos: {
        "lead.nombre": "Maria Garcia",
        "lead.email": EMAIL_TEST,
        "lead.fecha": new Date(Date.now() - 48 * 60 * 60 * 1000).toLocaleDateString("es-ES"),
        leadId: "test-001",
      },
    },
    {
      tipo: "LEAD_STALLED",
      datos: {
        "lead.nombre": "Maria Garcia",
        "lead.email": EMAIL_TEST,
        "lead.estado": "CONTACTADO",
        "lead.ultimoContacto": new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES"),
        leadId: "test-001",
      },
    },
    {
      tipo: "FACTURA_VENCIDA_AVISO",
      datos: {
        "cliente.nombre": "Juan Perez",
        "factura.numero": "FAC-2026-001",
        "factura.total": "1200",
        "factura.vencimiento": "10/04/2026",
        "factura.diasRetraso": "5",
        facturaId: "test-inv-001",
      },
    },
    {
      tipo: "PRESUPUESTO_EXPIRA_AVISO",
      datos: {
        "cliente.nombre": "Juan Perez",
        "presupuesto.numero": "PRE-2026-001",
        "presupuesto.total": "2500",
        "presupuesto.expira": "18/04/2026",
        "presupuesto.dias": "3",
        facturaId: "test-pre-001",
      },
    },
    {
      tipo: "TRIMESTRE_PROXIMO",
      datos: {
        trimestre: "1T 2026",
        fechaLimite: "20/04/2026",
        dias: "5",
      },
    },
    {
      tipo: "TAREA_VENCIDA",
      datos: {
        "tarea.nombre": "Enviar propuesta a Maria",
        "tarea.fechaLimite": new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("es-ES"),
        dias: "1",
        tareaId: "test-task-001",
      },
    },
    {
      tipo: "TAREAS_HOY",
      datos: {
        "tareas.total": "3",
        "tareas.lista": "— Llamar a Juan Perez\n— Enviar factura FAC-2026-002\n— Revisar presupuesto de Ana",
      },
    },
    {
      tipo: "PROVEEDOR_FACTURA_VENCER",
      datos: {
        "proveedor.nombre": "Vercel",
        "factura.total": "20",
        "factura.vencimiento": "18/04/2026",
        dias: "3",
      },
    },
    {
      tipo: "MES_BENEFICIO_NEGATIVO",
      datos: {
        ingresos: "1200",
        gastos: "1850",
        diferencia: "650",
      },
    },
    // ── PARA TUS CONTACTOS ────────────────────────────────────────────────────
    {
      tipo: "CONFIRMACION_LEAD",
      datos: {
        "lead.nombre": "Maria Garcia",
        "lead.email": EMAIL_TEST,
        leadId: "test-001",
      },
    },
    {
      tipo: "SEGUIMIENTO_DIA_3",
      datos: {
        "lead.nombre": "Maria Garcia",
        "lead.email": EMAIL_TEST,
        leadId: "test-001",
      },
    },
    {
      tipo: "SEGUIMIENTO_DIA_7",
      datos: {
        "lead.nombre": "Maria Garcia",
        "lead.email": EMAIL_TEST,
        leadId: "test-001",
      },
    },
    {
      tipo: "BIENVENIDA_CLIENTE",
      datos: {
        "cliente.nombre": "Juan Perez",
        "cliente.email": EMAIL_TEST,
        clienteId: "test-client-001",
      },
    },
    {
      tipo: "FACTURA_VENCIDA",
      datos: {
        "cliente.nombre": "Juan Perez",
        "cliente.email": EMAIL_TEST,
        "factura.numero": "FAC-2026-001",
        "factura.total": "1200",
        "factura.vencimiento": "10/04/2026",
        facturaId: "test-inv-001",
      },
    },
    {
      tipo: "PRESUPUESTO_EXPIRA",
      datos: {
        "cliente.nombre": "Juan Perez",
        "cliente.email": EMAIL_TEST,
        "presupuesto.numero": "PRE-2026-001",
        "presupuesto.expira": "18/04/2026",
        facturaId: "test-pre-001",
      },
    },
    {
      tipo: "CUMPLEANOS_CLIENTE",
      datos: {
        "cliente.nombre": "Ana Martinez",
        "cliente.email": EMAIL_TEST,
        clienteId: "test-client-002",
      },
    },
    {
      tipo: "CONFIRMACION_PEDIDO",
      datos: {
        "cliente.nombre": "Juan Perez",
        "cliente.email": EMAIL_TEST,
        clienteId: "test-client-001",
      },
    },
    {
      tipo: "AVISO_ENTREGA",
      datos: {
        "cliente.nombre": "Juan Perez",
        "cliente.email": EMAIL_TEST,
        clienteId: "test-client-001",
      },
    },
    {
      tipo: "SOLICITUD_VALORACION",
      datos: {
        "cliente.nombre": "Juan Perez",
        "cliente.email": EMAIL_TEST,
        clienteId: "test-client-001",
      },
    },
  ]

  let ok = 0
  let errores = 0
  let inactivas = 0

  for (const test of tests) {
    process.stdout.write(`\n[${test.tipo}] ... `)

    try {
      await runAutomation(usuario.id, test.tipo, test.datos)

      const log = await prisma.automatizacionLog.findFirst({
        where: {
          automatizacion: {
            userId: usuario.id,
            tipo: test.tipo as any,
          },
        },
        orderBy: { ejecutadaEn: "desc" },
      })

      if (log?.resultado === "SUCCESS") {
        console.log(`OK — ${log.detalle}`)
        ok++
      } else if (log?.resultado === "ERROR") {
        console.log(`ERROR — ${log.detalle}`)
        errores++
      } else {
        console.log("Inactiva o sin RESEND_API_KEY")
        inactivas++
      }
    } catch (e: unknown) {
      console.log(`EXCEPCION — ${e instanceof Error ? e.message : String(e)}`)
      errores++
    }

    await new Promise((r) => setTimeout(r, 500))
  }

  console.log("\n" + "=".repeat(50))
  console.log("RESULTADO FINAL")
  console.log(`OK:       ${ok} / ${tests.length}`)
  console.log(`Errores:  ${errores}`)
  console.log(`Inactivas/sin key: ${inactivas}`)
  console.log("=".repeat(50))

  if (!process.env.RESEND_API_KEY) {
    console.log("\nBLOQUEADOR: RESEND_API_KEY no esta en .env.local")
    console.log("Anade: RESEND_API_KEY=re_xxxxxxxxx en .env.local")
  } else {
    console.log(`\nRevisa ${EMAIL_TEST} — deberian llegar emails de las activas.`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
