import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerHistorial } from '../services/cajeroApi'
import styles from './Historial.module.css'

const TIPO_CONFIG = {
  RETIRO:        { label: 'Retiro',        icon: '↑', color: 'danger'  },
  DEPOSITO:      { label: 'Depósito',      icon: '↓', color: 'success' },
  TRANSFERENCIA: { label: 'Transferencia', icon: '⇆', color: 'warning' },
}

export default function Historial() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [pagina, setPagina]   = useState(0)
  const [total, setTotal]     = useState(0)
  const navigate              = useNavigate()
  const POR_PAGINA            = 10

  useEffect(() => {
    setLoading(true)
    obtenerHistorial(pagina, POR_PAGINA)
      .then(data => {
        // Acepta tanto array directo como paginado { content, totalElements }
        if (Array.isArray(data)) {
          setItems(data)
          setTotal(data.length)
        } else {
          setItems(data.content || [])
          setTotal(data.totalElements || 0)
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [pagina])

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  const fmtFecha = (f) => {
    try { return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(f)) }
    catch { return f }
  }

  const totalPaginas = Math.ceil(total / POR_PAGINA)

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/menu')}>← Menú</button>
        <h1 className={styles.title}>HISTORIAL</h1>
        {total > 0 && <p className={styles.subtitle}>{total} movimientos registrados</p>}
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Cargando movimientos...</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>⚠ {error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>≡</span>
          <span>Sin movimientos registrados</span>
        </div>
      )}

      <div className={styles.list}>
        {items.map((item) => {
          const config = TIPO_CONFIG[item.tipo?.toUpperCase()] || TIPO_CONFIG.RETIRO
          const esCredito = item.tipo?.toUpperCase() === 'DEPOSITO'
          return (
            <div key={item.id} className={styles.item}>
              <div className={`${styles.itemIcon} ${styles[config.color]}`}>
                {config.icon}
              </div>
              <div className={styles.itemBody}>
                <div className={styles.itemTop}>
                  <span className={styles.itemTipo}>{config.label}</span>
                  <span className={`${styles.itemMonto} ${esCredito ? styles.success : styles.danger}`}>
                    {esCredito ? '+' : '-'}{fmt(item.monto)}
                  </span>
                </div>
                <div className={styles.itemBottom}>
                  <span className={styles.itemDesc}>{item.descripcion || '—'}</span>
                  <span className={styles.itemFecha}>{fmtFecha(item.fecha)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPagina(p => p - 1)}
            disabled={pagina === 0 || loading}
          >← Anterior</button>
          <span className={styles.pageInfo}>
            {pagina + 1} / {totalPaginas}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPagina(p => p + 1)}
            disabled={pagina >= totalPaginas - 1 || loading}
          >Siguiente →</button>
        </div>
      )}
    </div>
  )
}
