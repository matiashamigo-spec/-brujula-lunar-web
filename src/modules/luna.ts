export interface PosicionLunar {
  azimut: number
  elevacion: number
  fase: number
  nombreFase: FaseLunar
  visible: boolean
}

export type FaseLunar =
  | 'nueva'
  | 'creciente_inicial'
  | 'cuarto_creciente'
  | 'creciente_gibosa'
  | 'llena'
  | 'menguante_gibosa'
  | 'cuarto_menguante'
  | 'menguante_final'

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

export function calcularPosicionLunar(lat: number, lon: number, fecha: Date = new Date()): PosicionLunar {
  const JD = julianDay(fecha)
  const T = (JD - 2451545.0) / 36525

  const L0 = norm360(218.316 + 13.176396 * (JD - 2451545.0))
  const M  = norm360(134.963 + 13.064993 * (JD - 2451545.0))
  const F  = norm360(93.272  + 13.229350 * (JD - 2451545.0))
  const Ms = norm360(357.529 + 0.985600  * (JD - 2451545.0))
  const D  = norm360(297.850 + 12.190749 * (JD - 2451545.0))

  const dL =
    6.289 * Math.sin(toRad(M)) +
    1.274 * Math.sin(toRad(2 * D - M)) +
    0.658 * Math.sin(toRad(2 * D)) -
    0.214 * Math.sin(toRad(2 * M)) -
    0.186 * Math.sin(toRad(Ms)) -
    0.114 * Math.sin(toRad(2 * F))

  const dB =
    5.128 * Math.sin(toRad(F)) +
    0.281 * Math.sin(toRad(M + F)) -
    0.256 * Math.sin(toRad(M - F)) +
    0.173 * Math.sin(toRad(2 * D - F))

  const lambda = toRad(L0 + dL)
  const beta   = toRad(dB)
  const epsilon = toRad(23.439 - 0.013 * T)

  const sinDec = Math.sin(beta) * Math.cos(epsilon) + Math.cos(beta) * Math.sin(epsilon) * Math.sin(lambda)
  const dec    = Math.asin(sinDec)
  const cosRA  = Math.cos(lambda) * Math.cos(beta)
  const sinRA  = Math.sin(lambda) * Math.cos(beta) * Math.cos(epsilon) - Math.sin(beta) * Math.sin(epsilon)
  const RA     = Math.atan2(sinRA, cosRA)

  const JD0  = Math.floor(JD - 0.5) + 0.5
  const T0   = (JD0 - 2451545.0) / 36525
  const GMST = norm360(
    100.4606184 + 36000.77004 * T0 + 0.000387933 * T0 * T0 +
    (fecha.getUTCHours() + fecha.getUTCMinutes() / 60 + fecha.getUTCSeconds() / 3600) * 15
  )
  const LMST = toRad(norm360(GMST + lon))
  const H    = LMST - RA
  const latRad = toRad(lat)

  const sinAlt = Math.sin(latRad) * Math.sin(dec) + Math.cos(latRad) * Math.cos(dec) * Math.cos(H)
  const alt    = toDeg(Math.asin(sinAlt))
  const cosAz  = (Math.sin(dec) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)))
  let az       = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))))
  if (Math.sin(H) > 0) az = 360 - az

  const sunL      = norm360(280.460 + 36000.771 * T)
  const sunM      = toRad(norm360(357.529 + 35999.050 * T))
  const sunLambda = toRad(norm360(sunL + 1.915 * Math.sin(sunM) + 0.020 * Math.sin(2 * sunM)))
  const elongacion = Math.atan2(
    Math.cos(beta) * Math.sin(lambda - sunLambda),
    Math.cos(beta) * Math.cos(lambda - sunLambda)
  )
  // Fase como fracción del ciclo lunar: 0=nueva, 0.25=cuarto creciente, 0.5=llena, 0.75=cuarto menguante
  const TWO_PI = 2 * Math.PI
  const fase = ((elongacion % TWO_PI) + TWO_PI) % TWO_PI / TWO_PI

  return {
    azimut: norm360(az),
    elevacion: alt,
    fase,
    nombreFase: determinarFase(fase),
    visible: alt > 0,
  }
}

function determinarFase(fase: number): FaseLunar {
  // Ventanas amplias para que la narrativa se sienta natural.
  // La luna "completa" abarca ~4 días alrededor del pico (0.42–0.58).
  if (fase < 0.05 || fase > 0.95) return 'nueva'
  if (fase < 0.20) return 'creciente_inicial'
  if (fase < 0.30) return 'cuarto_creciente'
  if (fase < 0.42) return 'creciente_gibosa'
  if (fase < 0.58) return 'llena'
  if (fase < 0.72) return 'menguante_gibosa'
  if (fase < 0.80) return 'cuarto_menguante'
  return 'menguante_final'
}
