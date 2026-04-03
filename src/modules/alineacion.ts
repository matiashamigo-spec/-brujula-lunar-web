import type { PosicionLunar } from './luna'

export interface OrientacionDispositivo {
  heading: number  // 0-360°
  pitch: number    // -90 a 90°
}

export interface ResultadoAlineacion {
  score: number
  alineado: boolean
  deltaAzimut: number
  deltaElevacion: number
}

// Tolerancias generosas para uso casual — la brújula de dispositivo tiene
// márgenes de error naturales y la luna llena es un target grande
const AZIMUT_TOL = 25   // ±25° horizontal
const ELEV_TOL   = 25   // ±25° vertical
const UMBRAL     = 0.5  // score mínimo para "luna encontrada"

function normDelta(d: number): number {
  let v = ((d % 360) + 360) % 360
  if (v > 180) v -= 360
  return v
}

export function calcularAlineacion(luna: PosicionLunar, disp: OrientacionDispositivo): ResultadoAlineacion {
  const deltaAzimut    = normDelta(luna.azimut - disp.heading)
  const deltaElevacion = luna.elevacion - disp.pitch
  const scoreAz = Math.max(0, 1 - Math.abs(deltaAzimut) / AZIMUT_TOL)
  const scoreEl = Math.max(0, 1 - Math.abs(deltaElevacion) / ELEV_TOL)
  const score   = scoreAz * scoreEl
  return { score, alineado: score >= UMBRAL, deltaAzimut, deltaElevacion }
}
