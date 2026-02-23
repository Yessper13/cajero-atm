import { useState } from 'react'
import styles from './PinPad.module.css'

const KEYS = ['1','2','3','4','5','6','7','8','9','←','0','✓']

/**
 * PinPad - Teclado numérico del cajero
 * @param {number}   length      - Largo máximo del PIN (default 4)
 * @param {function} onComplete  - Se llama con el PIN completo al presionar ✓
 * @param {boolean}  loading     - Deshabilita el pad mientras carga
 */
export default function PinPad({ length = 4, onComplete, loading = false }) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)

  function press(key) {
    if (loading) return

    if (key === '←') {
      setValue(v => v.slice(0, -1))
      return
    }

    if (key === '✓') {
      if (value.length < length) {
        // Shake si incompleto
        setShake(true)
        setTimeout(() => setShake(false), 500)
        return
      }
      onComplete?.(value)
      setValue('')
      return
    }

    if (value.length < length) {
      setValue(v => v + key)
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* Indicadores de dígitos */}
      <div className={`${styles.dots} ${shake ? styles.shake : ''}`}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < value.length ? styles.filled : ''}`}
          />
        ))}
      </div>

      {/* Teclado */}
      <div className={`${styles.grid} ${loading ? styles.disabled : ''}`}>
        {KEYS.map((key) => (
          <button
            key={key}
            className={`${styles.key} ${key === '✓' ? styles.confirm : ''} ${key === '←' ? styles.backspace : ''}`}
            onClick={() => press(key)}
            disabled={loading}
            aria-label={key === '←' ? 'Borrar' : key === '✓' ? 'Confirmar' : key}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}
