import type { FaseLunar } from './luna'

export interface NarrativaMuns {
  faseTecnica: FaseLunar
  textoPrincipal: string
  textoSecundario: string
  colorTematico: string
}

const narrativas: Record<FaseLunar, NarrativaMuns> = {
  nueva: {
    faseTecnica: 'nueva',
    textoPrincipal: 'La Luna está en silencio.',
    textoSecundario: 'Los Muns están trabajando en lo invisible.\nHoy no se ve, pero algo está pasando.',
    colorTematico: '#1a1a3e',
  },
  creciente_inicial: {
    faseTecnica: 'creciente_inicial',
    textoPrincipal: 'La Luna está despertando.',
    textoSecundario: 'Empieza a juntar luz.\nAlgo se está armando.',
    colorTematico: '#2a1a4e',
  },
  cuarto_creciente: {
    faseTecnica: 'cuarto_creciente',
    textoPrincipal: 'La Luna está tomando forma.',
    textoSecundario: 'Ya se puede ver el camino.\nLos Muns están en movimiento.',
    colorTematico: '#3a2a6e',
  },
  creciente_gibosa: {
    faseTecnica: 'creciente_gibosa',
    textoPrincipal: 'La Luna casi llega.',
    textoSecundario: 'Los Muns están en movimiento.\nEl camino está claro.',
    colorTematico: '#4a3a8e',
  },
  llena: {
    faseTecnica: 'llena',
    textoPrincipal: 'La Luna está completa.',
    textoSecundario: 'Todo está iluminado.\nEs momento de viajar.',
    colorTematico: '#5a4aae',
  },
  menguante_gibosa: {
    faseTecnica: 'menguante_gibosa',
    textoPrincipal: 'La Luna está soltando luz.',
    textoSecundario: 'Lo que pasó empieza a acomodarse.\nEs tiempo de volver.',
    colorTematico: '#4a3a8e',
  },
  cuarto_menguante: {
    faseTecnica: 'cuarto_menguante',
    textoPrincipal: 'La Luna se despide por ahora.',
    textoSecundario: 'Los Muns guardan lo aprendido.\nHasta la próxima vuelta.',
    colorTematico: '#3a2a5e',
  },
  menguante_final: {
    faseTecnica: 'menguante_final',
    textoPrincipal: 'La Luna se va a descansar.',
    textoSecundario: 'Lo que pasó empieza a acomodarse.\nEs tiempo de volver.',
    colorTematico: '#2a1a3e',
  },
}

export function obtenerNarrativa(fase: FaseLunar): NarrativaMuns {
  return narrativas[fase]
}
