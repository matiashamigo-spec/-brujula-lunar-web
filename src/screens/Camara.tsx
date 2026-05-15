import { useEffect, useRef, useState } from 'react'
import { calcularPosicionLunar } from '../modules/luna'
import { calcularPosicionSolar } from '../modules/sol'
import type { PosicionSolar } from '../modules/sol'
import { obtenerUbicacion } from '../modules/geolocalizacion'
import { iniciarSensores, setDeclinacion } from '../modules/sensores'
import type { OrientacionDispositivo } from '../modules/sensores'
import { calcularDeclinacion } from '../modules/declinacion'
import { calcularAlineacion } from '../modules/alineacion'
import type { ResultadoAlineacion } from '../modules/alineacion'
import BrujulaOverlay from '../components/BrujulaOverlay'

interface Props {
  onAlineado: () => void
  onVolver: () => void
  objetivo: 'luna' | 'sol'
}

const ALINEACION_INIT: ResultadoAlineacion = { score: 0, alineado: false, deltaAzimut: 0, deltaElevacion: 0 }

type ObjetivoPos = { azimut: number; elevacion: number; visible: boolean }

export default function Camara({ onAlineado, onVolver, objetivo }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const [alineacion, setAlineacion]   = useState<ResultadoAlineacion>(ALINEACION_INIT)
  const [orientacion, setOrientacion] = useState<OrientacionDispositivo>({ heading: 0, pitch: 0 })
  const [posObj, setPosObj]           = useState<ObjetivoPos | null>(null)
  const posObjRef = useRef<ObjetivoPos | null>(null)
  const cuentaRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const etiqueta = objetivo === 'sol' ? 'Sol' : 'Luna'
  const emoji    = objetivo === 'sol' ? '☀️' : '🌕'

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
        const decl = calcularDeclinacion(coords.latitud, coords.longitud)
        setDeclinacion(decl)
        console.info(`[brujula] Declinación magnética: ${decl.toFixed(2)}°`)
        const pos = objetivo === 'sol'
          ? calcularPosicionSolar(coords.latitud, coords.longitud, new Date())
          : calcularPosicionLunar(coords.latitud, coords.longitud, new Date())
        posObjRef.current = pos
        setPosObj(pos)
      } catch {
        const pos = objetivo === 'sol'
          ? calcularPosicionSolar(-34.6, -58.4, new Date())
          : calcularPosicionLunar(-34.6, -58.4, new Date())
        posObjRef.current = pos
        setPosObj(pos)
      }
    }

    initCamera()
    initLocation()

    const stop = iniciarSensores((ori) => {
      setOrientacion(ori)
      if (posObjRef.current) {
        const result = calcularAlineacion(posObjRef.current, ori)
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
    : posObj && !posObj.visible
    ? `El ${etiqueta} está bajo el horizonte ahora`
    : `Seguí la brújula hacia el ${etiqueta}`

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
        <span style={{ color: '#ffe066', fontWeight: 'bold', fontSize: 17 }}>Brújula {etiqueta}</span>
        <span style={{ color: '#aaccff', fontSize: 13 }}>
          {posObj ? (posObj.visible ? `↑ ${Math.round(posObj.elevacion)}°` : 'Bajo horizonte') : '...'}
        </span>
      </div>

      {/* Brujula */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrujulaOverlay alineacion={alineacion} elevacionLuna={posObj?.elevacion ?? 0} />
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', padding: '16px 20px 40px' }}>
        <p style={{ color: '#fff', fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{msgPrincipal}</p>

        {/* Debug: posición objetivo vs dispositivo */}
        <p style={{ color: '#aaccff', fontSize: 11, marginBottom: 2 }}>
          {emoji} {etiqueta}: {posObj ? `${Math.round(posObj.azimut)}° az · ${Math.round(posObj.elevacion)}° el` : '...'}
        </p>
        <p style={{ color: '#666899', fontSize: 11 }}>
          📱 Vos: {Math.round(orientacion.heading)}° az · {Math.round(orientacion.pitch)}° el
        </p>
      </div>
    </div>
  )
}
