import { motion } from 'framer-motion'

interface Props { onCompleto: () => void }

export default function CoheteAnimacion({ onCompleto }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.img
        src="./cohete.png"
        alt="cohete"
        style={{
          position: 'absolute',
          left: '50%',
          width: 100,
          height: 'auto',
          translateX: '-50%',
        }}
        initial={{ y: '65vh', opacity: 1 }}
        animate={{ y: '-20vh', opacity: [1, 1, 0] }}
        transition={{ duration: 2.5, ease: [0.4, 0, 1, 1] }}
        onAnimationComplete={onCompleto}
      />
    </div>
  )
}
