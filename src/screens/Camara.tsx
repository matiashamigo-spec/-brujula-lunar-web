import { useEffect, useRef, useState } from 'react'
import { calcularPosicionLunar } from '../modules/luna'
import type { PosicionLunar } from '../modules/luna'
import { obtenerUbicacion } from '../modules/geolocalizacion'
import { iniciarSensores } from '../modules/sensores'
import type { OrientacionDispositivo } from '../modules/sensores'
import { calcularAlineacion } from '../modules/alineacion'
import type { ResultadoAlineacion } from '../modules/alineacion'
import BrujulaOverlay from '../components/BrujulaOverlay'

interface Props {
  onAlineado: () => void
  onVolver: () => void
}

const ALINEACION_INIT: ResultadoAlineacion = { score: 0, alineado: false, deltaAzimut: 0, deltaElevacion: 0 }

export default function Camara({ onAlineado, onVolver }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const [alineacion, setAlineacion]   = useState<ResultadoAlineacion>(ALINEACION_INIT)
  const [orientacion, setOrientacion] = useState<OrientacionDispositivo>({ heading: 0, pitch: 0 })
  const [luna, setLuna]               = useState<PosicionLunar | null>(null)
  const posLunaRef = useRef<PosicionLunar | null>(null)
  const cuentaRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      } catch (e) { console.warn('No se pudo iniciar camara', e) }
    }

    async function initLocation() {
      try {
        const coords = await obtenerUbicacion()
        const pos = calcularPosicionLunar(coords.latitud, coords.longitud, new Date())
        posLunaRef.current = pos
        setLuna(pos)
      } catch {
        const pos = calcularPosicionLunar(-34.6, -58.4, new Date())
        posLunaRef.current = pos
        setLuna(pos)
      }
    }

    initCamera()
    initLocation()

    const stop = iniciarSensores((ori) => {
      setOrientacion(ori)
      if (posLunaRef.current) {
        const result = calcularAlineacion(posLunaRef.current, ori)
        setAlineacion(result)
        if (result.alineado && !cuentaRef.current) {
          cuentaRef.current = setTimeout(onAlineado, 1000)
        } else if (!result.alineado && cuentaRef.current) {
          clearTimeout(cuentaRef.current)
          cuentaRef.current = null
        }
      }
    })

    return () => {
      stop()
      stream?.getTracks().forEach(t => t.stop())
      if (cuentaRef.current) clearTimeout(cuentaRef.current)
    }
  }, [])

  const msgPrincipal = alineacion.score > 0.5
    ? '✨ ¡Sostenelo!'
    : luna && !luna.visible
    ? 'La Luna está bajo el horizonte ahora'
    : 'Seguí la brújula hacia la Luna'

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', background: '#000', overflow: 'hidden' }}>
      <video ref={videoRef} playsInline muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,10,0.35)' }} />

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '50px 20px 16px',
      }}>
        <button onClick={onVolver} style={{ background: 'none', color: '#aaccff', fontSize: 16 }}>← Volver</button>
        <span style={{ color: '#ffe066', fontWeight: 'bold', fontSize: 17 }}>Brújula Lunar</span>
        <span style={{ color: '#aaccff', fontSize: 13 }}>
          {luna ? (luna.visible ? `↑ ${Math.round(luna.elevacion)}°` : 'Bajo horizonte') : '...'}
        </span>
      </div>

      {/* Brujula */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrujulaOverlay alineacion={alineacion} elevacionLuna={luna?.elevacion ?? 0} />
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', padding: '16px 20px 40px' }}>
        <p style={{ color: '#fff', fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{msgPrincipal}</p>

        {/* Debug: posición luna vs dispositivo — ayuda a verificar calibración */}
        <p style={{ color: '#aaccff', fontSize: 11, marginBottom: 2 }}>
          🌕 Luna: {luna ? `${Math.round(luna.azimut)}° az · ${Math.round(luna.elevacion)}° el` : '...'}
        </p>
        <p style={{ color: '#666899', fontSize: 11 }}>
          📱 Vos: {Math.round(orientacion.heading)}° az · {Math.round(orientacion.pitch)}° el
        </p>
      </div>
    </div>
  )
}
