import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../services/cajeroApi'
import styles from './Menu.module.css'

const OPCIONES = [
  { id: 'saldo',         label: 'CONSULTAR SALDO',    icon: '◈',  ruta: '/saldo',          color: 'accent'   },
  { id: 'retiro',        label: 'RETIRO',              icon: '↑',  ruta: '/retiro',         color: 'danger'   },
  { id: 'deposito',      label: 'DEPÓSITO',            icon: '↓',  ruta: '/deposito',       color: 'success'  },
  { id: 'transferencia', label: 'TRANSFERENCIA',       icon: '⇆',  ruta: '/transferencia',  color: 'warning'  },
  { id: 'historial',     label: 'HISTORIAL',           icon: '≡',  ruta: '/historial',      color: 'secondary'},
  { id: 'pin',           label: 'CAMBIAR PIN',         icon: '🔑', ruta: '/cambiar-pin',    color: 'muted'    },
]

export default function Menu() {
  const navigate           = useNavigate()
  const { user, logout: cerrarSesion } = useAuth()

  async function handleLogout() {
    try { await logout() } catch (_) {}
    sessionStorage.removeItem('atm_token')
    cerrarSesion()
    navigate('/')
  }

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Bienvenida */}
      <div className={styles.welcome}>
        <div className={styles.avatar}>
          {(user?.titular || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className={styles.greeting}>BIENVENIDO</div>
          <div className={styles.username}>{user?.titular || 'Usuario'}</div>
          <div className={styles.account}>
            <span className={styles.mono}>{user?.numeroCuenta || '—'}</span>
          </div>
        </div>
      </div>

      {/* Opciones */}
      <div className={styles.grid}>
        {OPCIONES.map((op) => (
          <button
            key={op.id}
            className={`${styles.card} ${styles[op.color]}`}
            onClick={() => navigate(op.ruta)}
          >
            <span className={styles.cardIcon}>{op.icon}</span>
            <span className={styles.cardLabel}>{op.label}</span>
            <span className={styles.cardArrow}>›</span>
          </button>
        ))}
      </div>

      {/* Cerrar sesión */}
      <button className={styles.logoutBtn} onClick={handleLogout}>
        ⏻ CERRAR SESIÓN
      </button>
    </div>
  )
}
