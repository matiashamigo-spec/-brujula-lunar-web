export interface PosicionSolar {
  azimut: number
  elevacion: number
  visible: boolean
}

function toRad(deg: number) { return (deg * Math.PI) / 180 }
function toDeg(rad: number) { return (rad * 180) / Math.PI }
function norm360(deg: number) { return ((deg % 360) + 360) % 360 }

function julianDay(date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400
  let Y = y, M = m
  if (M <= 2) { Y -= 1; M += 12 }
  const A = Math.floor(Y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5
}

export function calcularPosicionSolar(lat: number, lon: number, fecha: Date = new Date()): PosicionSolar {
  const JD = julianDay(fecha)
  const T = (JD - 2451545.0) / 36525

  // Longitud eclíptica solar (misma fórmula que luna.ts usa para calcular la fase)
  const L0 = norm360(280.460 + 36000.771 * T)
  const M  = toRad(norm360(357.529 + 35999.050 * T))
  const lambda = toRad(norm360(L0 + 1.915 * Math.sin(M) + 0.020 * Math.sin(2 * M)))

  // Oblicuidad de la eclíptica
  const epsilon = toRad(23.439 - 0.013 * T)

  // Coordenadas ecuatoriales (beta solar ≈ 0, el sol está en el plano eclíptico)
  const sinDec = Math.sin(epsilon) * Math.sin(lambda)
  const dec    = Math.asin(sinDec)
  const RA     = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda))

  // Tiempo sidéreo local → ángulo horario
  const JD0  = Math.floor(JD - 0.5) + 0.5
  const T0   = (JD0 - 2451545.0) / 36525
  const GMST = norm360(
    100.4606184 + 36000.77004 * T0 + 0.000387933 * T0 * T0 +
    (fecha.getUTCHours() + fecha.getUTCMinutes() / 60 + fecha.getUTCSeconds() / 3600) * 15
  )
  const LMST   = toRad(norm360(GMST + lon))
  const H      = LMST - RA
  const latRad = toRad(lat)

  // Altitud y azimut
  const sinAlt = Math.sin(latRad) * Math.sin(dec) + Math.cos(latRad) * Math.cos(dec) * Math.cos(H)
  const alt    = toDeg(Math.asin(sinAlt))
  const cosAz  = (Math.sin(dec) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)))
  let az       = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))))
  if (Math.sin(H) > 0) az = 360 - az

  return {
    azimut: norm360(az),
    elevacion: alt,
    visible: alt > 0,
  }
}
