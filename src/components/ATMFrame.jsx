import styles from './ATMFrame.module.css'

export default function ATMFrame({ children }) {
  return (
    <div className={styles.shell}>
      {/* Efecto scanline ambiental */}
      <div className={styles.scanline} aria-hidden="true" />

      <div className={styles.machine}>
        {/* Header del cajero */}
        <header className={styles.header}>
          <div className={styles.bankLogo}>
            <span className={styles.logoMark}>◈</span>
            <div>
              <div className={styles.bankName}>BANCO DIGITAL</div>
              <div className={styles.bankTagline}>SECURE BANKING TERMINAL</div>
            </div>
          </div>
          <div className={styles.statusBar}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>EN LÍNEA</span>
          </div>
        </header>

        {/* Pantalla principal */}
        <main className={styles.screen}>
          <div className={styles.screenGlass}>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.secIcon}>🔒</span>
            <span>CONEXIÓN CIFRADA</span>
          </div>
          <div className={styles.footerRight}>
            <span className={styles.footerTime} id="atm-clock" />
          </div>
        </footer>
      </div>
    </div>
  )
}
