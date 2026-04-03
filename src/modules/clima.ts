export interface EstadoClima {
  nubosidad: number
  descripcion: string
  puedeVerLuna: boolean
}

export async function obtenerClima(lat: number, lon: number): Promise<EstadoClima> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=cloudcover&timezone=auto`
    const res = await fetch(url)
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    const nubosidad: number = data?.current?.cloudcover ?? 50
    let descripcion = 'Cielo despejado'
    if (nubosidad >= 75) descripcion = 'Cielo cubierto'
    else if (nubosidad >= 50) descripcion = 'Bastante nublado'
    else if (nubosidad >= 25) descripcion = 'Parcialmente nublado'
    return { nubosidad, descripcion, puedeVerLuna: nubosidad < 70 }
  } catch {
    return { nubosidad: 0, descripcion: 'No se pudo verificar', puedeVerLuna: true }
  }
}
