import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { consultarSaldo } from '../services/cajeroApi'
import styles from './Saldo.module.css'

export default function Saldo() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate              = useNavigate()

  useEffect(() => {
    consultarSaldo()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/menu')}>← Menú</button>
        <h1 className={styles.title}>SALDO DISPONIBLE</h1>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Consultando saldo...</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>⚠ {error}</div>
      )}

      {data && (
        <div className={styles.content}>
          {/* Saldo principal */}
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>SALDO ACTUAL</div>
            <div className={styles.balanceAmount}>{fmt(data.saldo)}</div>
            <div className={styles.balanceTicker}>COP</div>
          </div>

          {/* Info de la cuenta */}
          <div className={styles.infoGrid}>
            <InfoRow label="TITULAR"       value={data.titular}      />
            <InfoRow label="N° CUENTA"     value={data.numeroCuenta} mono />
            <InfoRow label="TIPO DE CUENTA" value={data.tipo || 'AHORROS'} />
          </div>
        </div>
      )}

      <button className={styles.actionBtn} onClick={() => navigate('/menu')}>
        VOLVER AL MENÚ
      </button>
    </div>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${mono ? styles.mono : ''}`}>{value || '—'}</span>
    </div>
  )
}
