import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { realizarTransferencia } from '../services/cajeroApi'
import MontoInput from '../components/MontoInput'
import Comprobante from '../components/Comprobante'
import styles from './OperacionPage.module.css'

const PASOS = { DESTINO: 'destino', MONTO: 'monto' }

export default function Transferencia() {
  const [paso, setPaso]               = useState(PASOS.DESTINO)
  const [cuentaDestino, setDestino]   = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const navigate                      = useNavigate()

  function handleSiguiente() {
    if (cuentaDestino.trim().length < 4) {
      setError('Ingresa un número de cuenta válido')
      return
    }
    setError('')
    setPaso(PASOS.MONTO)
  }

  async function handleConfirm(monto) {
    setLoading(true)
    setError('')
    try {
      const data = await realizarTransferencia(cuentaDestino, monto, descripcion)
      setComprobante(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (comprobante) {
    return (
      <div className={`${styles.page} page-enter`}>
        <Comprobante
          tipo="transferencia"
          monto={comprobante.monto}
          saldoAnterior={comprobante.saldoAnterior}
          saldoActual={comprobante.saldoActual}
          fecha={comprobante.fecha}
          comprobante={comprobante.comprobante}
          destinatario={comprobante.destinatario}
          onCerrar={() => navigate('/menu')}
        />
      </div>
    )
  }

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => paso === PASOS.MONTO ? setPaso(PASOS.DESTINO) : navigate('/menu')}>
          ← {paso === PASOS.MONTO ? 'Editar destino' : 'Menú'}
        </button>
        <h1 className={styles.title}>TRANSFERENCIA</h1>
        <p className={styles.subtitle}>
          {paso === PASOS.DESTINO ? 'Cuenta de destino' : `A: ${cuentaDestino}`}
        </p>
      </div>

      {error && <div className={styles.errorBanner}>⚠ {error}</div>}

      {paso === PASOS.DESTINO ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={styles.field}>
            <label className={styles.label}>CUENTA DESTINO</label>
            <input
              className={styles.input}
              type="text"
              inputMode="numeric"
              placeholder="Ej: 1234567890"
              value={cuentaDestino}
              onChange={e => { setDestino(e.target.value.replace(/\D/g, '')); setError('') }}
              maxLength={20}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>DESCRIPCIÓN (OPCIONAL)</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ej: Pago servicio"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              maxLength={80}
            />
          </div>

          <button className={styles.primaryBtn} onClick={handleSiguiente}>
            SIGUIENTE →
          </button>
        </div>
      ) : (
        <MontoInput onConfirm={handleConfirm} validarMax loading={loading} />
      )}
    </div>
  )
}
