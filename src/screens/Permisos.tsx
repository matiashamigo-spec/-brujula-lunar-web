import { useEffect, useState } from 'react'
import { obtenerUbicacion } from '../modules/geolocalizacion'
import { obtenerClima } from '../modules/clima'
import { solicitarPermisoOrientacion } from '../modules/sensores'

interface Props { onListo: () => void }

type Estado = 'solicitando' | 'orientacion_ios' | 'orientacion_ios_iframe' | 'cargando' | 'listo' | 'error'

const APP_URL = 'https://brujula-lunar-web.vercel.app'

function estaEnIframe(): boolean {
  try { return window.self !== window.top } catch { return true }
}

export default function Permisos({ onListo }: Props) {
  const [estado, setEstado] = useState<Estado>('solicitando')
  const [error, setError] = useState('')
  const [clima, setClima] = useState<{ nubosidad: number; descripcion: string; puedeVerLuna: boolean } | null>(null)

  useEffect(() => {
    verificarSiNecesitaBotonIOS()
  }, [])

  function verificarSiNecesitaBotonIOS() {
    const DevOri = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DevOri.requestPermission === 'function') {
      // iOS 13+: necesita gesto del usuario para pedir permiso de brújula
      // Si estamos dentro de un iframe, Safari bloquea el permiso — hay que abrir en pestaña nueva
      if (estaEnIframe()) {
        setEstado('orientacion_ios_iframe')
      } else {
        setEstado('orientacion_ios')
      }
    } else {
      iniciar()
    }
  }

  async function iniciar() {
    setEstado('cargando')

    const orientOk = await solicitarPermisoOrientacion()
    if (!orientOk) {
      setError('Se necesita acceso a la brújula para encontrar la Luna.')
      setEstado('error')
      return
    }

    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    } catch {
      setError('Se necesita acceso a la cámara para continuar.')
      setEstado('error')
      return
    }

    let coords = { latitud: -34.6, longitud: -58.4 }
    try { coords = await obtenerUbicacion() } catch {}

    const estadoClima = await obtenerClima(coords.latitud, coords.longitud)
    setClima(estadoClima)
    setEstado('listo')
  }

  const colorNubosidad = !clima ? '#aaccff'
    : clima.nubosidad < 40 ? '#66ff99'
    : clima.nubosidad < 70 ? '#ffcc44'
    : '#ff6644'

  const botonBase: React.CSSProperties = {
    borderRadius: 50, padding: '16px 36px',
    fontSize: 18, fontWeight: 'bold', cursor: 'pointer', border: 'none',
  }

  return (
    <div style={{
      height: '100%', background: '#0a0a1a', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <h2 style={{ color: '#ffe066', fontSize: 26, marginBottom: 32, textAlign: 'center' }}>
        Preparando misión
      </h2>

      {/* iOS dentro de iframe: Safari no permite pedir permiso de brújula en iframe */}
      {estado === 'orientacion_ios_iframe' && (
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🧭</div>
          <p style={{ color: '#aaccff', marginBottom: 8, lineHeight: 1.6 }}>
            Para usar la brújula en iPhone, la app necesita abrirse en pantalla completa.
          </p>
          <p style={{ color: '#666899', fontSize: 13, marginBottom: 28, lineHeight: 1.5 }}>
            Es un requisito de Safari. Solo tarda un segundo.
          </p>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...botonBase,
              background: '#ffe066', color: '#0a0a1a',
              display: 'inline-block', textDecoration: 'none',
            }}
          >
            Abrir Brújula Lunar →
          </a>
        </div>
      )}

      {/* iOS fuera de iframe: mostrar botón para disparar el permiso */}
      {estado === 'orientacion_ios' && (
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🧭</div>
          <p style={{ color: '#aaccff', marginBottom: 24, lineHeight: 1.6 }}>
            Para encontrar la Luna necesitamos acceso a la brújula de tu dispositivo.
          </p>
          <button onClick={iniciar} style={{ ...botonBase, background: '#ffe066', color: '#0a0a1a' }}>
            Activar brújula
          </button>
        </div>
      )}

      {estado === 'cargando' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid #ffe06633', borderTopColor: '#ffe066',
            animation: 'spin 1s linear infinite', margin: '0 auto 20px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: '#aaccff' }}>Verificando permisos...</p>
        </div>
      )}

      {estado === 'error' && (
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <p style={{ color: '#ff6644', marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
          <button onClick={iniciar} style={{ ...botonBase, background: '#ffe066', color: '#0a0a1a' }}>
            Reintentar
          </button>
        </div>
      )}

      {estado === 'listo' && clima && (
        <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
          <div style={{
            border: `1px solid ${colorNubosidad}`,
            borderRadius: 16, padding: 24,
            background: 'rgba(255,255,255,0.04)', marginBottom: 28,
          }}>
            <p style={{ color: '#888bbb', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Estado del cielo
            </p>
            <p style={{ color: colorNubosidad, fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>
              {clima.descripcion}
            </p>
            <p style={{ color: '#aaaacc', fontSize: 14 }}>Nubosidad: {clima.nubosidad}%</p>
            {!clima.puedeVerLuna && (
              <p style={{ color: '#ff9944', fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>
                ⚠ El cielo está muy nublado. Quizás la Luna no se vea.
              </p>
            )}
          </div>
          <button
            onClick={onListo}
            style={{ ...botonBase, background: '#ffe066', color: '#0a0a1a', width: '100%' }}
          >
            {clima.puedeVerLuna ? 'Ir a buscar la Luna' : 'Intentar igual'}
          </button>
        </div>
      )}
    </div>
  )
}
