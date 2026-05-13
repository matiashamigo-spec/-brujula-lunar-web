// Calcula la declinación magnética usando el modelo dipolar IGRF-13 (2020.0)
// Precisión: ~2-3° (suficiente para este uso). El error residual viene de los
// términos de orden superior (cuadrupolo, octupolo) que requieren tablas completas.
//
// Declinación D > 0 → norte magnético al ESTE del norte geográfico
// Declinación D < 0 → norte magnético al OESTE del norte geográfico
// Argentina: ~-5° (norte magnético está un poco al oeste del geográfico)
//
// Corrección: heading_verdadero = heading_magnético + D

// Coeficientes de Gauss de grado 1 (dipolo) — IGRF-13 2020.0 en nT
const G10 = -29404.5
const G11 = -1450.9
const H11 =  4652.5

export function calcularDeclinacion(lat: number, lon: number): number {
  const latR = lat * Math.PI / 180
  const lonR = lon * Math.PI / 180

  const sinLat = Math.sin(latR)
  const cosLat = Math.cos(latR)
  const sinLon = Math.sin(lonR)
  const cosLon = Math.cos(lonR)

  // Componente norte (X) y este (Y) del campo dipolar en superficie terrestre
  // Derivadas del potencial V = (G10·cosθ + (G11·cosφ + H11·sinφ)·sinθ) / r²
  // donde θ = colatitud = 90° - lat
  const X = -(G10 * cosLat - (G11 * cosLon + H11 * sinLon) * sinLat)
  const Y = G11 * sinLon - H11 * cosLon

  return Math.atan2(Y, X) * 180 / Math.PI
}
