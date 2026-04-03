import { useEffect, useState } from 'react'
import { calcularPosicionLunar } from '../modules/luna'
import { obtenerUbicacion } from '../modules/geolocalizacion'
import { obtenerNarrativa } from '../modules/narrativa'
import type { NarrativaMuns } from '../modules/narrativa'
import { guardarMision } from '../modules/persistencia'
import CoheteAnimacion from '../components/CoheteAnimacion'
import TextoNarrativo from '../components/TextoNarrativo'
import Estrellas from '../components/Estrellas'

interface Props { onCompleto: () => void }

export default function Alineacion({ onCompleto }: Props) {
  const [narrativa, setNarrativa] = useState<NarrativaMuns | null>(null)
  const [coheteVisible, setCoheteVisible] = useState(true)
  const [textoVisible, setTextoVisible] = useState(false)

  useEffect(() => {
    async function iniciar() {
      const coords = await obtenerUbicacion().catch(() => ({ latitud: -34.6, longitud: -58.4 }))
      const luna = calcularPosicionLunar(coords.latitud, coords.longitud, new Date())
      const narr = obtenerNarrativa(luna.nombreFase)
      setNarrativa(narr)
      guardarMision({ fase: luna.nombreFase, textoPrincipal: narr.textoPrincipal })
    }
    iniciar()
  }, [])

  function onCoheteCompleto() {
    setCoheteVisible(false)
    setTextoVisible(true)
    setTimeout(onCompleto, 3000)
  }

  return (
    <div style={{
      height: '100%', background: '#05050f', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <Estrellas count={60} />

      <div style={{ position: 'relative', marginTop: 80, textAlign: 'center' }}>
        <span style={{ fontSize: 64 }}>🌕</span>
        <h2 style={{ color: '#ffe066', fontSize: 26, fontWeight: 'bold', marginTop: 12 }}>
          ¡Luna encontrada!
        </h2>
      </div>

      {coheteVisible && <CoheteAnimacion onCompleto={onCoheteCompleto} />}

      {textoVisible && narrativa && (
        <div style={{ position: 'absolute', bottom: 60, left: 16, right: 16 }}>
          <TextoNarrativo narrativa={narrativa} />
        </div>
      )}
    </div>
  )
}
