import { useEffect, useState } from 'react'
import { obtenerMisiones } from '../modules/persistencia'
import type { MisionCompletada } from '../modules/persistencia'
import Estrellas from '../components/Estrellas'

interface Props { onReintentar: () => void; onInicio: () => void }

export default function MisionCumplida({ onReintentar, onInicio }: Props) {
  const [misiones, setMisiones] = useState<MisionCompletada[]>([])

  useEffect(() => { setMisiones(obtenerMisiones()) }, [])

  const btnBase: React.CSSProperties = {
    borderRadius: 50, padding: '15px 0', fontSize: 17,
    fontWeight: 'bold', cursor: 'pointer', width: '100%', border: 'none',
  }

  return (
    <div style={{
      height: '100%', background: '#0a0a1a', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      padding: '0 24px', position: 'relative', overflow: 'hidden',
    }}>
      <Estrellas count={35} />

      <div style={{ position: 'relative', textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>⭐</div>
        <h2 style={{ color: '#ffe066', fontSize: 30, marginBottom: 10 }}>¡Misión cumplida!</h2>
        <p style={{ color: '#aaccff', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Los Muns registraron tu viaje esta noche.
        </p>
      </div>

      {misiones.length > 0 && (
        <div style={{ width: '100%', maxWidth: 340, flex: 1, overflowY: 'auto', position: 'relative', marginBottom: 16 }}>
          <p style={{ color: '#666899', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 10 }}>
            Tus misiones
          </p>
          {[...misiones].reverse().map((m, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 12,
              padding: 14, marginBottom: 8,
              border: '1px solid rgba(255,224,102,0.15)',
            }}>
              <p style={{ color: '#666899', fontSize: 11, marginBottom: 4 }}>
                {new Date(m.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p style={{ color: '#ffe066', fontSize: 14, fontWeight: 600 }}>{m.textoPrincipal}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32, position: 'relative' }}>
        <button onClick={onReintentar} style={{ ...btnBase, background: '#ffe066', color: '#0a0a1a' }}>
          Buscar de nuevo
        </button>
        <button onClick={onInicio} style={{ ...btnBase, background: 'none', border: '1px solid #ffe066', color: '#ffe066' }}>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
