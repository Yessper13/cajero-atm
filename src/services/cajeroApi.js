/**
 * cajeroApi.js
 * Capa de servicios — API Spring Boot Cajero Automático
 *
 * Proxy Vite → http://localhost:8080  (configurado en vite.config.js)
 *
 * ENDPOINTS:
 * ─────────────────────────────────────────────────────────────────────────
 * POST   /api/auth/registro           → { nombre, apellido, correo, pin }
 * POST   /api/auth/verificar-correo   → { correo, codigo }
 * POST   /api/auth/reenviar-codigo    → { correo }
 * POST   /api/auth/login              → { numeroCuenta, pin }
 * POST   /api/auth/logout
 * PUT    /api/auth/cambiar-pin        → { pinActual, pinNuevo }
 *
 * GET    /api/cuenta/saldo
 * GET    /api/cuenta/info
 *
 * POST   /api/transacciones/retiro         → { monto }
 * POST   /api/transacciones/deposito       → { monto }
 * POST   /api/transacciones/transferencia  → { cuentaDestino, monto, descripcion }
 * GET    /api/transacciones/historial      → ?pagina=0&tamanio=10
 * ─────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios'
import API_BASE_URL from '../config/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Interceptor: adjunta token JWT si existe ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('atm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Interceptor: manejo global de errores ───────────────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.mensaje ||
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Tiempo de espera agotado. Verifica tu conexión.' :
       err.message === 'Network Error' ? 'No se pudo conectar con el servidor. ¿Está corriendo Spring Boot?' :
       'Error de conexión con el servidor')
    return Promise.reject(new Error(message))
  }
)

// ══════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════

/**
 * Registra un nuevo usuario y envía código de 6 dígitos al correo
 * @param {{ nombre, apellido, correo, pin }} datos
 * @returns {{ mensaje }}
 */
export const registrar = (datos) =>
  api.post('/auth/registro', datos)

/**
 * Verifica el correo con el código de 6 dígitos recibido
 * @param {string} correo
 * @param {string} codigo
 * @returns {{ mensaje }}
 */
export const verificarCorreo = (correo, codigo) =>
  api.post('/auth/verificar-correo', { correo, codigo })

/**
 * Reenvía un nuevo código de verificación al correo
 * @param {string} correo
 * @returns {{ mensaje }}
 */
export const reenviarCodigo = (correo) =>
  api.post('/auth/reenviar-codigo', { correo })

/**
 * @param {string} numeroCuenta
 * @param {string} pin
 * @returns {{ token, cuentaId, numeroCuenta, titular }}
 */
export const login = (numeroCuenta, pin) =>
  api.post('/auth/login', { numeroCuenta, pin })

/** @returns {void} */
export const logout = () =>
  api.post('/auth/logout')

/**
 * @param {string} pinActual
 * @param {string} pinNuevo
 * @returns {{ mensaje }}
 */
export const cambiarPin = (pinActual, pinNuevo) =>
  api.put('/auth/cambiar-pin', { pinActual, pinNuevo })

// ══════════════════════════════════════════════════════
//  CUENTA
// ══════════════════════════════════════════════════════

/**
 * @returns {{ saldo, numeroCuenta, titular, tipo }}
 */
export const consultarSaldo = () =>
  api.get('/cuenta/saldo')

/**
 * @returns {{ id, numeroCuenta, titular, tipo, saldo, fechaApertura }}
 */
export const obtenerInfoCuenta = () =>
  api.get('/cuenta/info')

// ══════════════════════════════════════════════════════
//  TRANSACCIONES
// ══════════════════════════════════════════════════════

/**
 * @param {number} monto
 * @returns {{ saldoAnterior, saldoActual, monto, fecha, comprobante }}
 */
export const realizarRetiro = (monto) =>
  api.post('/transacciones/retiro', { monto })

/**
 * @param {number} monto
 * @returns {{ saldoAnterior, saldoActual, monto, fecha, comprobante }}
 */
export const realizarDeposito = (monto) =>
  api.post('/transacciones/deposito', { monto })

/**
 * @param {string} cuentaDestino
 * @param {number} monto
 * @param {string} descripcion
 * @returns {{ saldoAnterior, saldoActual, monto, fecha, comprobante, destinatario }}
 */
export const realizarTransferencia = (cuentaDestino, monto, descripcion = '') =>
  api.post('/transacciones/transferencia', { cuentaDestino, monto, descripcion })

/**
 * @param {number} pagina   - página de resultados (0-indexed)
 * @param {number} tamanio  - ítems por página
 * @returns {{ content: Transaction[], totalElements, totalPages }}
 */
export const obtenerHistorial = (pagina = 0, tamanio = 10) =>
  api.get('/transacciones/historial', { params: { pagina, tamanio } })
