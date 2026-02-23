import styles from './Comprobante.module.css'

const TIPO_CONFIG = {
  retiro:        { label: 'RETIRO',        color: 'danger',  icon: '↑' },
  deposito:      { label: 'DEPÓSITO',      color: 'success', icon: '↓' },
  transferencia: { label: 'TRANSFERENCIA', color: 'accent',  icon: '⇆' },
}

/**
 * Comprobante de transacción
 * @param {string} tipo          - 'retiro' | 'deposito' | 'transferencia'
 * @param {number} monto
 * @param {number} saldoAnterior
 * @param {number} saldoActual
 * @param {string} fecha
 * @param {string} comprobante   - número de comprobante
 * @param {string} destinatario  - solo en transferencias
 * @param {function} onCerrar
 */
export default function Comprobante({
  tipo = 'retiro', monto, saldoAnterior, saldoActual,
  fecha, comprobante, destinatario, onCerrar
}) {
  const config = TIPO_CONFIG[tipo] || TIPO_CONFIG.retiro

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  const fmtFecha = (f) => {
    if (!f) return '—'
    try { return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(f)) }
    catch { return f }
  }

  return (
    <div className={styles.wrapper}>
      {/* Icono de éxito */}
      <div className={`${styles.icon} ${styles[config.color]}`}>
        <span className={styles.iconSymbol}>{config.icon}</span>
      </div>

      <div className={styles.title}>{config.label} EXITOSO</div>

      {/* Cuerpo del comprobante */}
      <div className={styles.receipt}>
        <div className={styles.receiptHeader}>
          <span className={styles.mono}>COMPROBANTE</span>
          <span className={`${styles.mono} ${styles[config.color]}`}># {comprobante || '—'}</span>
        </div>

        <div className={styles.divider} />

        <Row label="MONTO" value={fmt(monto)} highlight />
        <Row label="SALDO ANTERIOR" value={fmt(saldoAnterior)} />
        <Row label="SALDO ACTUAL"   value={fmt(saldoActual)} />
        {destinatario && <Row label="DESTINATARIO" value={destinatario} />}
        <Row label="FECHA" value={fmtFecha(fecha)} />

        <div className={styles.divider} />

        <div className={styles.footerNote}>
          Guarde este comprobante como referencia de su operación.
        </div>
      </div>

      <button className={styles.btn} onClick={onCerrar}>
        FINALIZAR
      </button>
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className={`${styles.row} ${highlight ? styles.highlight : ''}`}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  )
}
