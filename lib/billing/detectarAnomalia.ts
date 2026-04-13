export type Anomalia = {
  esAnomalo: boolean
  motivo?: string
  sugerencia?: string
  deducibleSugerido?: number
}

export function detectarAnomalia(gasto: {
  amount: number
  categoria?: string
  fecha: Date
  proveedor?: string
}): Anomalia {
  const dia = gasto.fecha.getDay()
  const esFinDeSemana = dia === 0 || dia === 6
  const cat = gasto.categoria?.toLowerCase()

  // Restaurante en fin de semana
  if (
    esFinDeSemana &&
    (cat?.includes("comidas") || cat?.includes("restaurante") || cat?.includes("comida"))
  ) {
    return {
      esAnomalo: true,
      motivo: "Comida de trabajo en fin de semana",
      sugerencia:
        "Hacienda puede cuestionar las comidas en fin de semana. Anota el nombre del cliente o motivo profesional para poder justificarlo.",
      deducibleSugerido: 50,
    }
  }

  // Comida > 100€
  if (
    gasto.amount > 100 &&
    (cat?.includes("comidas") || cat?.includes("restaurante") || cat?.includes("comida"))
  ) {
    return {
      esAnomalo: true,
      motivo: "Comida de importe elevado",
      sugerencia:
        "Las comidas de trabajo son deducibles al 50% si hay justificante del motivo profesional. Guarda el ticket y anota con quién fue.",
      deducibleSugerido: 50,
    }
  }

  // Transporte > 500€
  if (gasto.amount > 500 && cat?.includes("transporte")) {
    return {
      esAnomalo: true,
      motivo: "Gasto de transporte elevado",
      sugerencia:
        "Los gastos de vehículo son deducibles al 50% salvo que sea de uso exclusivamente profesional. Consulta con tu gestor.",
      deducibleSugerido: 50,
    }
  }

  // Gasto > 1000€ sin categoría
  if (gasto.amount > 1000 && !gasto.categoria) {
    return {
      esAnomalo: true,
      motivo: "Gasto elevado sin categorizar",
      sugerencia:
        "Añade la categoría y guarda la factura completa. Hacienda puede requerir justificante para gastos superiores a 1.000€.",
      deducibleSugerido: 100,
    }
  }

  return { esAnomalo: false }
}
