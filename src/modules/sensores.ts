import type { OrientacionDispositivo } from './alineacion'
export type { OrientacionDispositivo }

type Listener = (o: OrientacionDispositivo) => void

let listener: Listener | null = null
let declinacion = 0 // corrección magnética en grados, se setea desde Camara.tsx

export function setDeclinacion(d: number) { declinacion = d }

// --- Suavizado EMA ---
// Evita que el indicador salte con el ruido del sensor.
const SMOOTH = 0.15

let smoothHx    = 1
let smoothHy    = 0
let smoothPitch = 0

function suavizar(heading: number, pitch: number): OrientacionDispositivo {
  // Aplicar corrección de declinación magnética antes de suavizar
  const corrected = norm360(heading + declinacion)
  const hRad = corrected * Math.PI / 180
  smoothHx    = SMOOTH * Math.cos(hRad) + (1 - SMOOTH) * smoothHx
  smoothHy    = SMOOTH * Math.sin(hRad) + (1 - SMOOTH) * smoothHy
  smoothPitch = SMOOTH * pitch          + (1 - SMOOTH) * smoothPitch
  return {
    heading: norm360(Math.atan2(smoothHy, smoothHx) * 180 / Math.PI),
    pitch:   smoothPitch,
  }
}

function norm360(deg: number) { return ((deg % 360) + 360) % 360 }

// Android Chrome ya entrega alpha tilt-compensado (yaw estable alrededor del eje vertical).
// Usar gamma para corrección horizontal introduce error cuando el teléfono está ligeramente
// rodado. Usamos alpha directamente como azimut de la cámara y beta-90 como pitch.
function eulerACamara(alpha: number, beta: number, _gamma: number): OrientacionDispositivo {
  return {
    heading: norm360(alpha),
    pitch:   Math.max(-90, Math.min(90, beta - 90)),
  }
}

// Calcula dirección de cámara trasera a partir de cuaternión device→world.
// La fórmula Euler da el resultado correcto para Android directamente.
// Para iOS webkitCompassHeading necesitamos +180° porque ese valor
// da la dirección de la PANTALLA, no de la cámara.
function quaternionACamara(q: [number, number, number, number]): OrientacionDispositivo {
  const [qx, qy, qz, qw] = q
  const xE = -2 * (qx * qz + qw * qy)
  const yN =  2 * (qw * qx - qy * qz)
  const zU =  2 * (qx * qx + qy * qy) - 1
  return {
    heading: norm360(Math.atan2(xE, yN) * 180 / Math.PI),
    pitch:   Math.asin(Math.max(-1, Math.min(1, zU))) * 180 / Math.PI,
  }
}

export async function solicitarPermisoOrientacion(): Promise<boolean> {
  const DevOri = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
  if (typeof DevOri.requestPermission === 'function') {
    try {
      const result = await DevOri.requestPermission()
      return result === 'granted'
    } catch { return false }
  }
  return true
}

export function iniciarSensores(cb: Listener): () => void {
  listener = cb

  // --- Estrategia 1: AbsoluteOrientationSensor (Android Chrome 67+) ---
  const SensorClass = (window as unknown as Record<string, unknown>)['AbsoluteOrientationSensor'] as
    | (new (opts: { frequency: number }) => {
        quaternion: [number, number, number, number] | null
        start: () => void
        stop: () => void
        addEventListener: (ev: string, cb: () => void) => void
      })
    | undefined

  if (typeof SensorClass !== 'undefined') {
    try {
      const sensor = new SensorClass({ frequency: 10 })
      sensor.addEventListener('reading', () => {
        if (sensor.quaternion) {
          const { heading, pitch } = quaternionACamara(sensor.quaternion)
          listener?.(suavizar(heading, pitch))
        }
      })
      sensor.start()
      return () => { listener = null; try { sensor.stop() } catch { /* ignore */ } }
    } catch {
      console.info('[sensores] AbsoluteOrientationSensor no disponible')
    }
  }

  // --- Estrategia 2: DeviceOrientationEvent ---
  let hasAbsolute = false

  const onAbsolute = (e: Event) => {
    const ev = e as DeviceOrientationEvent
    if (ev.alpha == null || ev.beta == null || ev.gamma == null) return
    hasAbsolute = true
    // Android absolute: eulerACamara da la dirección de la cámara directamente
    const { heading, pitch } = eulerACamara(ev.alpha, ev.beta, ev.gamma)
    listener?.(suavizar(heading, pitch))
  }

  const onRelative = (e: Event) => {
    const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number }
    if (ev.alpha == null || ev.beta == null || ev.gamma == null) return

    if (ev.webkitCompassHeading != null) {
      // iOS: webkitCompassHeading da la dirección de la PANTALLA → +180° para la cámara
      const heading = norm360(ev.webkitCompassHeading + 180)
      const pitch   = Math.max(-90, Math.min(90, ev.beta - 90))
      listener?.(suavizar(heading, pitch))
    } else if (!hasAbsolute) {
      // Android fallback: Chrome moderno da valores geomagnéticos en el evento regular
      const { heading, pitch } = eulerACamara(ev.alpha, ev.beta, ev.gamma)
      listener?.(suavizar(heading, pitch))
    }
  }

  window.addEventListener('deviceorientationabsolute', onAbsolute, true)
  window.addEventListener('deviceorientation', onRelative, true)

  return () => {
    listener = null
    window.removeEventListener('deviceorientationabsolute', onAbsolute, true)
    window.removeEventListener('deviceorientation', onRelative, true)
  }
}
