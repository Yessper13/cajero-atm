import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { verificarCorreo, reenviarCodigo } from '../services/cajeroApi'
import styles from './VerificarCorreo.module.css'

const LARGO = 6
const REENVIO_ESPERA = 60  // segundos

export default function VerificarCorreo() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // El correo llega desde el registro vía router state
  const correoInicial = location.state?.correo || ''
  const mensajeInicial = location.state?.mensaje || ''

  const [correo, setCorreo] = useState(correoInicial)
  const [digitos, setDigitos]     = useState(Array(LARGO).fill(''))
  const [error, setError]         = useState('')
  const [exito, setExito]         = useState(false)
  const [loading, setLoading]     = useState(false)
  const [loadingReenvio, setLoadingReenvio] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [numeroCuenta, setNumeroCuenta] = useState('')

  const inputsRef = useRef([])

  // Countdown para reenvío
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Auto-focus en el primer campo al cargar
  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  // ── Manejo de dígitos ───────────────────────────────────────────────────
  function handleChange(i, val) {
    // Solo acepta dígitos
    const v = val.replace(/\D/g, '').slice(-1)
    const nuevo = [...digitos]
    nuevo[i] = v
    setDigitos(nuevo)
    setError('')

    // Auto-avance al siguiente campo
    if (v && i < LARGO - 1) {
      inputsRef.current[i + 1]?.focus()
    }

    // Auto-submit cuando se llena el último campo
    if (v && i === LARGO - 1) {
      const completo = [...nuevo].join('')
      if (completo.length === LARGO) {
        handleVerificar([...nuevo].join(''))
      }
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digitos[i] && i > 0) {
      inputsRef.current[i - 1]?.focus()
    }
    if (e.key === 'ArrowLeft'  && i > 0)          inputsRef.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < LARGO - 1)  inputsRef.current[i + 1]?.focus()
  }

  // Manejar paste de código completo (ej: copiar del correo)
  function handlePaste(e) {
    e.preventDefault()
    const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LARGO)
    const nuevo = Array(LARGO).fill('')
    pegado.split('').forEach((c, i) => { nuevo[i] = c })
    setDigitos(nuevo)
    setError('')
    const siguiente = Math.min(pegado.length, LARGO - 1)
    inputsRef.current[siguiente]?.focus()
    if (pegado.length === LARGO) handleVerificar(pegado)
  }

  // ── Verificación ────────────────────────────────────────────────────────
  async function handleVerificar(codigoOverride) {
    const codigo = codigoOverride ?? digitos.join('')
    if (codigo.length < LARGO) {
      setError('Ingresa los 6 dígitos del código')
      return
    }
    if (!correo) {
      setError('Correo no encontrado. Vuelve a registrarte.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const resp = await verificarCorreo(correo, codigo)
      // Extraer número de cuenta del mensaje si viene incluido
      const match = resp.mensaje?.match(/N°\s*([\d]+)/)
      if (match) setNumeroCuenta(match[1])
      setExito(true)
    } catch (e) {
      setError(e.message)
      // Limpiar campos en error para reintentar
      setDigitos(Array(LARGO).fill(''))
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
    } finally {
      setLoading(false)
    }
  }

  // ── Reenvío de código ───────────────────────────────────────────────────
  async function handleReenviar() {
    if (countdown > 0 || !correo) return
    setLoadingReenvio(true)
    setError('')
    try {
      await reenviarCodigo(correo)
      setCountdown(REENVIO_ESPERA)
      setDigitos(Array(LARGO).fill(''))
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingReenvio(false)
    }
  }

  // ── Pantalla de éxito ───────────────────────────────────────────────────
  if (exito) {
    return (
      <div className={`${styles.page} page-enter`}>
        <div className={styles.exitoWrapper}>
          <div className={styles.exitoIcon}>✓</div>
          <h2 className={styles.exitoTitle}>¡CUENTA ACTIVADA!</h2>
          <p className={styles.exitoMsg}>
            Tu correo fue verificado exitosamente.<br />
            Ya puedes ingresar al cajero.
          </p>
          {numeroCuenta && (
            <div className={styles.numeroCuentaCard}>
              <span className={styles.ncLabel}>TU NÚMERO DE CUENTA</span>
              <span className={styles.ncValue}>{numeroCuenta}</span>
              <span className={styles.ncHint}>Guárdalo, lo necesitarás para iniciar sesión</span>
            </div>
          )}
          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/')}
          >
            IR AL CAJERO →
          </button>
        </div>
      </div>
    )
  }

  // ── Pantalla principal ──────────────────────────────────────────────────
  return (
    <div className={`${styles.page} page-enter`}>

      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/registro')}>← Volver</button>
        <h1 className={styles.title}>VERIFICA TU CORREO</h1>
      </div>

      <div className={styles.mailIcon}>✉</div>

      <div className={styles.info}>
        <p className={styles.infoText}>
          Enviamos un código de <strong>6 dígitos</strong> a:
        </p>
        <p className={styles.correoDisplay}>{correo || '—'}</p>
        {mensajeInicial && !correo && (
          <p className={styles.infoHint}>{mensajeInicial}</p>
        )}
        <p className={styles.infoHint}>
          Revisa también tu carpeta de spam.
        </p>
      </div>

      {error && (
        <div className={styles.errorBanner}>⚠ {error}</div>
      )}

      {/* ── Campos del código ── */}
      <div className={styles.codigoWrapper}>
        <label className={styles.codigoLabel}>CÓDIGO DE VERIFICACIÓN</label>
        <div className={styles.codigoCeldas}>
          {digitos.map((d, i) => (
            <input
              key={i}
              ref={el => inputsRef.current[i] = el}
              className={`${styles.celda} ${d ? styles.celdaLlena : ''} ${error ? styles.celdaError : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={handlePaste}
              disabled={loading}
              autoComplete="off"
            />
          ))}
        </div>
      </div>

      {/* ── Botón verificar ── */}
      <button
        className={styles.primaryBtn}
        onClick={() => handleVerificar()}
        disabled={loading || digitos.join('').length < LARGO}
      >
        {loading ? (
          <span className={styles.loadingRow}>
            <span className={styles.spinner} /> VERIFICANDO...
          </span>
        ) : 'VERIFICAR CÓDIGO'}
      </button>

      {/* ── Reenvío ── */}
      <div className={styles.reenvioRow}>
        <span className={styles.reenvioText}>¿No llegó el código?</span>
        {countdown > 0 ? (
          <span className={styles.countdownText}>
            Reenviar en {countdown}s
          </span>
        ) : (
          <button
            className={styles.reenvioBtn}
            onClick={handleReenviar}
            disabled={loadingReenvio}
          >
            {loadingReenvio ? 'Enviando...' : 'Reenviar código'}
          </button>
        )}
      </div>

      {/* Cambiar correo */}
      <div className={styles.changeEmail}>
        <button className={styles.linkBtn} onClick={() => navigate('/registro')}>
          ¿Correo incorrecto? Vuelve al registro
        </button>
      </div>

    </div>
  )
}
