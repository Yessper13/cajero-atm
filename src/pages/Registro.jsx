import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrar } from '../services/cajeroApi'
import PinPad from '../components/PinPad'
import styles from './Registro.module.css'

const PASOS = { DATOS: 'datos', PIN: 'pin', CONFIRMAR_PIN: 'confirmar' }

export default function Registro() {
  const navigate = useNavigate()

  const [paso, setPaso]   = useState(PASOS.DATOS)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Datos del formulario
  const [form, setForm] = useState({
    nombre: '', apellido: '', correo: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [pin, setPin]       = useState('')

  // ── Paso 1: validar datos personales ───────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setFormErrors(fe => ({ ...fe, [name]: '' }))
    setError('')
  }

  function validarDatos() {
    const errors = {}
    if (!form.nombre.trim())    errors.nombre   = 'El nombre es requerido'
    if (!form.apellido.trim())  errors.apellido = 'El apellido es requerido'
    if (!form.correo.trim())    errors.correo   = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
                                errors.correo   = 'Correo inválido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleDatosSiguiente(e) {
    e.preventDefault()
    if (validarDatos()) setPaso(PASOS.PIN)
  }

  // ── Paso 2: crear PIN ───────────────────────────────────────────────────
  function handlePinCreado(pinIngresado) {
    setPin(pinIngresado)
    setPaso(PASOS.CONFIRMAR_PIN)
  }

  // ── Paso 3: confirmar PIN y registrar ───────────────────────────────────
  async function handlePinConfirmado(pinConfirmado) {
    if (pinConfirmado !== pin) {
      setError('Los PINs no coinciden. Vuelve a intentarlo.')
      setPaso(PASOS.PIN)
      setPin('')
      return
    }

    setLoading(true)
    setError('')
    try {
      const resp = await registrar({ ...form, pin })
      // Navegar a verificación, pasando el correo en el state
      navigate('/verificar-correo', {
        state: { correo: form.correo, mensaje: resp.mensaje }
      })
    } catch (e) {
      setError(e.message)
      setPaso(PASOS.DATOS)
    } finally {
      setLoading(false)
    }
  }

  // ── Indicadores de paso ─────────────────────────────────────────────────
  const pasos = [
    { id: PASOS.DATOS,        num: '01', label: 'Datos' },
    { id: PASOS.PIN,          num: '02', label: 'PIN'   },
    { id: PASOS.CONFIRMAR_PIN,num: '03', label: 'Confirmar' },
  ]
  const pasoIdx = pasos.findIndex(p => p.id === paso)

  return (
    <div className={`${styles.page} page-enter`}>

      {/* Encabezado */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← Volver</button>
        <h1 className={styles.title}>CREAR CUENTA</h1>

        {/* Barra de progreso */}
        <div className={styles.progressBar}>
          {pasos.map((p, i) => (
            <div key={p.id} className={styles.progressStep}>
              <div className={`${styles.stepBubble}
                ${i < pasoIdx  ? styles.done   : ''}
                ${i === pasoIdx ? styles.active : ''}
                ${i > pasoIdx  ? styles.pending : ''}
              `}>
                {i < pasoIdx ? '✓' : p.num}
              </div>
              <span className={`${styles.stepLabel} ${i === pasoIdx ? styles.activeLbl : ''}`}>
                {p.label}
              </span>
              {i < pasos.length - 1 && (
                <div className={`${styles.stepLine} ${i < pasoIdx ? styles.lineDone : ''}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className={styles.errorBanner}>⚠ {error}</div>
      )}

      {/* ── PASO 1: Datos personales ── */}
      {paso === PASOS.DATOS && (
        <form className={styles.form} onSubmit={handleDatosSiguiente} noValidate>
          <p className={styles.subtitle}>Ingresa tu información personal</p>

          <div className={styles.row}>
            <Field
              label="NOMBRE" name="nombre" value={form.nombre}
              onChange={handleChange} error={formErrors.nombre}
              placeholder="Ej: Juan"
            />
            <Field
              label="APELLIDO" name="apellido" value={form.apellido}
              onChange={handleChange} error={formErrors.apellido}
              placeholder="Ej: Pérez"
            />
          </div>

          <Field
            label="CORREO ELECTRÓNICO" name="correo" value={form.correo}
            onChange={handleChange} error={formErrors.correo}
            placeholder="tu@correo.com" type="email"
            hint="Recibirás un código de verificación aquí"
          />

          <button type="submit" className={styles.primaryBtn}>
            SIGUIENTE →
          </button>
        </form>
      )}

      {/* ── PASO 2: Crear PIN ── */}
      {paso === PASOS.PIN && (
        <div className={styles.pinSection}>
          <p className={styles.subtitle}>Crea tu PIN de 4 dígitos</p>
          <p className={styles.pinHint}>
            Este PIN lo usarás cada vez que ingreses al cajero.
            <br />Elige uno que recuerdes pero que sea seguro.
          </p>
          <PinPad length={4} onComplete={handlePinCreado} />
          <button className={styles.secondaryBtn}
            onClick={() => { setPaso(PASOS.DATOS); setError('') }}>
            ← Editar datos
          </button>
        </div>
      )}

      {/* ── PASO 3: Confirmar PIN ── */}
      {paso === PASOS.CONFIRMAR_PIN && (
        <div className={styles.pinSection}>
          <p className={styles.subtitle}>Confirma tu PIN</p>
          <p className={styles.pinHint}>
            Vuelve a ingresar el PIN que acabas de crear
          </p>
          <PinPad key="confirm" length={4} onComplete={handlePinConfirmado} loading={loading} />
          <button className={styles.secondaryBtn}
            onClick={() => { setPaso(PASOS.PIN); setPin(''); setError('') }}>
            ← Cambiar PIN
          </button>
        </div>
      )}

      {/* Link a login */}
      <div className={styles.loginLink}>
        ¿Ya tienes cuenta?{' '}
        <button className={styles.linkBtn} onClick={() => navigate('/')}>
          Inicia sesión
        </button>
      </div>

    </div>
  )
}

// ── Subcomponente Field ────────────────────────────────────────────────────
function Field({ label, name, value, onChange, error, placeholder, type = 'text', hint }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
      />
      {hint  && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.fieldError}>⚠ {error}</span>}
    </div>
  )
}
