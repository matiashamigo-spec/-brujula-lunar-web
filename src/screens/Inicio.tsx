import Estrellas from '../components/Estrellas'

interface Props { onEmpezar: () => void }

export default function Inicio({ onEmpezar }: Props) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0a1a', padding: 24, position: 'relative',
    }}>
      <Estrellas count={40} />

      <svg width={110} height={110} style={{ marginBottom: 24, position: 'relative' }}>
        <circle cx={55} cy={55} r={48} fill="#ffe066" opacity={0.12} />
        <circle cx={55} cy={55} r={40} fill="#ffe066" opacity={0.9} />
        <path d="M55 15 A40 40 0 0 0 55 95 A28 40 0 0 1 55 15" fill="#1a1a3e" opacity={0.4} />
      </svg>

      <h1 style={{ color: '#ffe066', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 14, letterSpacing: 0.5, position: 'relative' }}>
        Brújula Lunar
      </h1>
      <p style={{ color: '#aaccff', fontSize: 17, textAlign: 'center', lineHeight: 1.7, marginBottom: 48, position: 'relative' }}>
        Apuntá al cielo,<br />encontrá la Luna,<br />hacé que algo suceda.
      </p>

      <button
        onClick={onEmpezar}
        style={{
          background: '#ffe066', color: '#0a0a1a', border: 'none',
          borderRadius: 50, padding: '16px 44px',
          fontSize: 19, fontWeight: 'bold', cursor: 'pointer',
          position: 'relative',
        }}
      >
        Empezar misión
      </button>
    </div>
  )
}
