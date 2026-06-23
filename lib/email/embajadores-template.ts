import { cMarketing } from "./archetypes"

export function buildEmbajadoresConfirmationEmail(nombre: string): string {
  const firstName = nombre.split(" ")[0] || nombre

  return cMarketing({
    title: "Solicitud recibida",
    preheader:
      "Hemos recibido tu solicitud para el programa de embajadores. Te respondemos en menos de 48h.",
    label: "Programa de embajadores",
    heading: "Solicitud recibida",
    intro:
      `Hola, ${firstName}. Hemos recibido tu solicitud para el programa de embajadores de ClientLabs. ` +
      "Gracias por el interés — le dedicamos el tiempo que merece a cada candidatura. Te escribiremos a este email con nuestra decisión en un máximo de 48h. " +
      "Si encajas, te enviamos el acuerdo; al aceptarlo recibes tu cuenta gratis y tu enlace de tracking, y empiezas a cobrar el día 5 de cada mes.",
    button: { href: "https://clientlabs.io", label: "Conocer ClientLabs" },
    note:
      "Si tienes cualquier duda antes de que te respondamos, responde directamente a este email — lo leeremos personalmente.",
    unsubscribeUrl: "mailto:hola@clientlabs.io?subject=Baja%20de%20la%20lista",
    reason:
      "Recibiste este email porque solicitaste una plaza en el programa de embajadores de ClientLabs.",
  })
}
