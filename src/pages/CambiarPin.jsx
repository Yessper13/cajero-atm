import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cambiarPin } from '../services/cajeroApi'
import PinPad from '../components/PinPad'
import styles from './OperacionPage.module.css'

const PASOS = { ACTUAL: 'actual', NUEVO: 'nuevo', CONFIRMAR: 'confirmar' }

export default function CambiarPin() {
  const [paso, setPaso]       = useState(PASOS.ACTUAL)
  const [pinActual, setPinA]  = useState('')
  const [pinNuevo, setPinN]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [exito, setExito]     = useState(false)
  const navigate              = useNavigate()

  const LABELS = {
    [PASOS.ACTUAL]:    'INGRESA TU PIN ACTUAL',
    [PASOS.NUEVO]:     'INGRESA TU NUEVO PIN',
    [PASOS.CONFIRMAR]: 'CONFIRMA EL NUEVO PIN',
  }

  async function handlePin(pin) {
    setError('')
    if (paso === PASOS.ACTUAL) {
      setPinA(pin); setPaso(PASOS.NUEVO)
    } else if (paso === PASOS.NUEVO) {
      setPinN(pin); setPaso(PASOS.CONFIRMAR)
    } else {
      if (pin !== pinNuevo) {
        setError('Los PINs no coinciden, intenta de nuevo')
        setPinN('')
        setPaso(PASOS.NUEVO)
        return
      }
      setLoading(true)
      try {
        await cambiarPin(pinActual, pinNuevo)
        setExito(true)
      } catch (e) {
        setError(e.message)
        setPaso(PASOS.ACTUAL)
        setPinA(''); setPinN('')
      } finally {
        setLoading(false)
      }
    }
  }

  if (exito) {
    return (
      <div className={`${styles.page} page-enter`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '40px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-dim)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--success)' }}>
            ✓
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '0.12em' }}>
            PIN ACTUALIZADO
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
            Tu PIN ha sido cambiado exitosamente.
          </div>
          <button className={styles.primaryBtn} style={{ marginTop: 16 }} onClick={() => navigate('/menu')}>
            VOLVER AL MENÚ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/menu')}>← Menú</button>
        <h1 className={styles.title}>CAMBIAR PIN</h1>
        <p className={styles.subtitle}>{LABELS[paso]}</p>
      </div>

      {/* Progreso */}
      <div style={{ display: 'flex', gap: 6 }}>
        {Object.values(PASOS).map((p, i) => (
          <div key={p} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= Object.values(PASOS).indexOf(paso) ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {error && <div className={styles.errorBanner}>⚠ {error}</div>}

      <PinPad key={paso} length={4} onComplete={handlePin} loading={loading} />
    </div>
  )
}
