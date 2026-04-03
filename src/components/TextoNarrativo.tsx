import { motion } from 'framer-motion'
import type { NarrativaMuns } from '../modules/narrativa'

interface Props { narrativa: NarrativaMuns }

export default function TextoNarrativo({ narrativa }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        background: 'rgba(10,10,30,0.88)',
        border: `1px solid ${narrativa.colorTematico}aa`,
        borderRadius: 16,
        padding: '20px 24px',
        textAlign: 'center',
        maxWidth: 340,
        margin: '0 auto',
      }}
    >
      <p style={{ color: '#ffe066', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        {narrativa.textoPrincipal}
      </p>
      <p style={{ color: '#aaccff', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {narrativa.textoSecundario}
      </p>
    </motion.div>
  )
}
