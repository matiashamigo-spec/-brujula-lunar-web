import { useState } from 'react'
import Inicio from './screens/Inicio'
import Permisos from './screens/Permisos'
import Camara from './screens/Camara'
import Alineacion from './screens/Alineacion'
import MisionCumplida from './screens/MisionCumplida'

export type Pantalla = 'inicio' | 'permisos' | 'camara' | 'alineacion' | 'mision_cumplida'

const params  = new URLSearchParams(window.location.search)
const objetivo = params.get('modo') === 'sol' ? 'sol' : 'luna'

export default function App() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio')

  const ir = (p: Pantalla) => setPantalla(p)

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden', background: '#0a0a1a' }}>
      {pantalla === 'inicio' && <Inicio onEmpezar={() => ir('permisos')} />}
      {pantalla === 'permisos' && <Permisos onListo={() => ir('camara')} />}
      {pantalla === 'camara' && <Camara onAlineado={() => ir('alineacion')} onVolver={() => ir('permisos')} objetivo={objetivo} />}
      {pantalla === 'alineacion' && <Alineacion onCompleto={() => ir('mision_cumplida')} />}
      {pantalla === 'mision_cumplida' && <MisionCumplida onReintentar={() => ir('camara')} onInicio={() => ir('inicio')} />}
    </div>
  )
}
