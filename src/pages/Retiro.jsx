import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { realizarRetiro } from '../services/cajeroApi'
import MontoInput from '../components/MontoInput'
import Comprobante from '../components/Comprobante'
import styles from './OperacionPage.module.css'

export default function Retiro() {
  const [comprobante, setComprobante] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const navigate                      = useNavigate()

  async function handleConfirm(monto) {
    setLoading(true)
    setError('')
    try {
      const data = await realizarRetiro(monto)
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
          tipo="retiro"
          monto={comprobante.monto}
          saldoAnterior={comprobante.saldoAnterior}
          saldoActual={comprobante.saldoActual}
          fecha={comprobante.fecha}
          comprobante={comprobante.comprobante}
          onCerrar={() => navigate('/menu')}
        />
      </div>
    )
  }

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/menu')}>← Menú</button>
        <h1 className={styles.title}>RETIRO DE EFECTIVO</h1>
        <p className={styles.subtitle}>Ingresa el monto que deseas retirar</p>
      </div>

      {error && <div className={styles.errorBanner}>⚠ {error}</div>}

      <MontoInput onConfirm={handleConfirm} validarMax loading={loading} />
    </div>
  )
}
