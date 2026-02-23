import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/cajeroApi'
import PinPad from '../components/PinPad'
import styles from './Login.module.css'

const PASOS = { CUENTA: 'cuenta', PIN: 'pin' }

export default function Login() {
  const [paso, setPaso]         = useState(PASOS.CUENTA)
  const [cuenta, setCuenta]     = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()
  const { login: guardarSesion } = useAuth()

  // ── Paso 1: ingreso de número de cuenta ─────────────────────────────
  function handleCuentaDigit(d) {
    setError('')
    if (d === '⌫') { setCuenta(c => c.slice(0,-1)); return }
    if (cuenta.length < 16) setCuenta(c => c + d)
  }

  function handleCuentaConfirm() {
    if (cuenta.trim().length < 4) {
      setError('Ingresa un número de cuenta válido')
      return
    }
    setError('')
    setPaso(PASOS.PIN)
  }

  // ── Paso 2: ingreso de PIN ───────────────────────────────────────────
  async function handlePinComplete(pin) {
    setLoading(true)
    setError('')
    try {
      const data = await login(cuenta, pin)
      // Guarda el token para los interceptors de axios
      if (data.token) sessionStorage.setItem('atm_token', data.token)
      guardarSesion(data)
      navigate('/menu')
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  // ── UI ───────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.topBar}>
        <div className={styles.stepIndicator}>
          <span className={paso === PASOS.CUENTA ? styles.stepActive : styles.stepDone}>01</span>
          <div className={styles.stepLine} />
          <span className={paso === PASOS.PIN ? styles.stepActive : styles.stepPending}>02</span>
        </div>
        <div className={styles.stepLabel}>
          {paso === PASOS.CUENTA ? 'NÚMERO DE CUENTA' : 'INGRESA TU PIN'}
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠</span> {error}
        </div>
      )}

      {/* Link al registro */}
      {paso === PASOS.CUENTA && (
        <div className={styles.registerRow}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className={styles.registerLink}>Regístrate aquí</Link>
        </div>
      )}

      {paso === PASOS.CUENTA ? (
        <div className={styles.cuentaSection}>
          <div className={styles.cuentaDisplay}>
            <span className={styles.cuentaLabel}>N° CUENTA</span>
            <span className={styles.cuentaValue}>
              {cuenta || <span className={styles.placeholder}>_ _ _ _ _ _ _ _ _ _ _ _</span>}
            </span>
          </div>

          <div className={styles.cuentaGrid}>
            {['1','2','3','4','5','6','7','8','9','⌫','0'].map(k => (
              <button
                key={k}
                className={`${styles.cuentaKey} ${k === '⌫' ? styles.back : ''}`}
                onClick={() => handleCuentaDigit(k)}
              >{k}</button>
            ))}
            <button className={styles.cuentaConfirm} onClick={handleCuentaConfirm}>
              SIGUIENTE →
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.pinSection}>
          <p className={styles.pinHint}>
            Cuenta: <span className={styles.mono}>
              {'*'.repeat(cuenta.length - 4) + cuenta.slice(-4)}
            </span>
          </p>

          <PinPad length={4} onComplete={handlePinComplete} loading={loading} />

          <button className={styles.backBtn} onClick={() => { setPaso(PASOS.CUENTA); setError('') }}>
            ← Cambiar cuenta
          </button>
        </div>
      )}
    </div>
  )
}
