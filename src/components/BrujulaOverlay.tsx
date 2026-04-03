import { useEffect, useState } from 'react'
import type { ResultadoAlineacion } from '../modules/alineacion'

interface Props {
  alineacion: ResultadoAlineacion
  elevacionLuna: number
}

export default function BrujulaOverlay({ alineacion, elevacionLuna }: Props) {
  const [size, setSize] = useState(Math.min(window.innerWidth * 0.75, 300))

  useEffect(() => {
    const onResize = () => setSize(Math.min(window.innerWidth * 0.75, 300))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const { score, deltaAzimut, deltaElevacion } = alineacion
  const center = size / 2
  const radio  = center - 20

  const color   = score > 0.5 ? '#ffe066' : score > 0.25 ? '#88aaff' : '#4466aa'
  const opacity = 0.4 + score * 0.6

  // El indicador de luna se mueve dentro del aro. maxD = zona de captura en grados
  const maxD = 60
  const ix = center + (Math.max(-maxD, Math.min(maxD, deltaAzimut))   / maxD) * (radio - 28)
  const iy = center - (Math.max(-maxD, Math.min(maxD, deltaElevacion)) / maxD) * (radio - 28)

  const instruccion = score > 0.5
    ? '✨ ¡Sostenelo!'
    : elevacionLuna < 0
    ? 'La Luna está bajo el horizonte'
    : deltaAzimut > 20
    ? 'Girá a la derecha →'
    : deltaAzimut < -20
    ? '← Girá a la izquierda'
    : Math.abs(deltaElevacion) > 20
    ? (deltaElevacion > 0 ? 'Incliná más hacia arriba' : 'Bajá un poco')
    : 'Casi... ajustá despacio'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width={size} height={size}>
        {/* Aro exterior */}
        <circle cx={center} cy={center} r={radio} stroke={color} strokeWidth={2} fill="none" opacity={opacity} />
        {/* Aro interior (zona objetivo) */}
        <circle cx={center} cy={center} r={radio * 0.35} stroke={color} strokeWidth={1} fill="none" opacity={0.3} />
        {/* Retícula */}
        <line x1={center-18} y1={center} x2={center+18} y2={center} stroke={color} strokeWidth={1} opacity={0.5} />
        <line x1={center} y1={center-18} x2={center} y2={center+18} stroke={color} strokeWidth={1} opacity={0.5} />
        {/* Punto central (donde apunta el celular) */}
        <circle cx={center} cy={center} r={5} fill={color} opacity={0.9} />
        {/* Indicador de luna */}
        <circle cx={ix} cy={iy} r={16} fill="#ffe066" opacity={0.85} />
        <text x={ix} y={iy + 6} fontSize={16} textAnchor="middle">🌕</text>
        {/* Flecha si la luna está fuera del aro */}
        {Math.abs(deltaAzimut) > 30 && (
          <polygon
            points={deltaAzimut > 0
              ? `${center+radio-38},${center} ${center+radio-20},${center-9} ${center+radio-20},${center+9}`
              : `${center-radio+38},${center} ${center-radio+20},${center-9} ${center-radio+20},${center+9}`
            }
            fill={color} opacity={0.8}
          />
        )}
      </svg>

      {/* Score */}
      <div style={{ border: `1px solid ${color}`, borderRadius: 20, padding: '3px 14px', color, fontSize: 17, fontWeight: 'bold' }}>
        {Math.round(score * 100)}%
      </div>

      <p style={{ color: '#aaccff', fontSize: 15, textAlign: 'center', padding: '0 16px' }}>{instruccion}</p>
    </div>
  )
}
