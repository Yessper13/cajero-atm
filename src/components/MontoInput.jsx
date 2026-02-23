import { useState } from 'react'
import styles from './MontoInput.module.css'

const MONTOS_RAPIDOS = [20000, 50000, 100000, 200000, 500000]

/**
 * MontoInput - Input de monto con accesos directos
 * @param {function} onConfirm  - Callback con el monto numérico
 * @param {number}   saldo      - Saldo disponible (para validar retiros)
 * @param {boolean}  validarMax - Si true, impide montos > saldo
 * @param {boolean}  loading
 */
export default function MontoInput({ onConfirm, saldo, validarMax = false, loading = false }) {
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')

  function handleDigit(d) {
    setError('')
    if (d === 'C') { setMonto(''); return }
    if (d === '⌫') { setMonto(m => m.slice(0, -1)); return }
    if (monto.length >= 10) return
    // Evitar cero inicial
    if (monto === '' && d === '0') return
    setMonto(m => m + d)
  }

  function handleMontoRapido(m) {
    setError('')
    setMonto(String(m))
  }

  function handleConfirm() {
    const valor = parseInt(monto, 10)
    if (!valor || valor <= 0) {
      setError('Ingresa un monto válido')
      return
    }
    if (validarMax && saldo !== undefined && valor > saldo) {
      setError('Saldo insuficiente')
      return
    }
    onConfirm?.(valor)
  }

  const valor = parseInt(monto, 10) || 0
  const formatted = valor > 0
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)
    : '$0'

  const KEYS = ['7','8','9','4','5','6','1','2','3','C','0','⌫']

  return (
    <div className={styles.wrapper}>
      {/* Display del monto */}
      <div className={styles.display}>
        <span className={styles.currency}>{formatted}</span>
        {error && <span className={styles.error}>{error}</span>}
      </div>

      {/* Montos rápidos */}
      <div className={styles.quickRow}>
        {MONTOS_RAPIDOS.map(m => (
          <button
            key={m}
            className={styles.quickBtn}
            onClick={() => handleMontoRapido(m)}
            disabled={loading}
          >
            {new Intl.NumberFormat('es-CO', { notation: 'compact', compactDisplay: 'short' }).format(m)}
          </button>
        ))}
      </div>

      {/* Teclado numérico */}
      <div className={styles.grid}>
        {KEYS.map(k => (
          <button
            key={k}
            className={`${styles.key} ${k === 'C' ? styles.clear : ''} ${k === '⌫' ? styles.back : ''}`}
            onClick={() => handleDigit(k)}
            disabled={loading}
          >
            {k}
          </button>
        ))}
      </div>

      <button
        className={styles.confirmBtn}
        onClick={handleConfirm}
        disabled={loading || !monto}
      >
        {loading ? 'PROCESANDO...' : 'CONFIRMAR'}
      </button>
    </div>
  )
}
