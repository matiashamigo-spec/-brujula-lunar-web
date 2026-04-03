const KEY = 'brujula_lunar_misiones'

export interface MisionCompletada {
  fecha: string
  fase: string
  textoPrincipal: string
}

export function guardarMision(m: Omit<MisionCompletada, 'fecha'>): void {
  const lista = obtenerMisiones()
  lista.push({ ...m, fecha: new Date().toISOString() })
  try { localStorage.setItem(KEY, JSON.stringify(lista)) } catch {}
}

export function obtenerMisiones(): MisionCompletada[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
