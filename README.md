# 🏦 Cajero ATM — React + Vite

Interfaz de cajero automático migrada a **React 18 + Vite**, con arquitectura por componentes y consumo de API REST creada en Spring Boot.

---

## 🚀 Instalación y ejecución

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # Build de producción
```

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── ATMFrame.jsx         # Chasis del cajero (header, screen, footer)
│   ├── ATMFrame.module.css
│   ├── PinPad.jsx           # Teclado numérico para PIN (4 dígitos)
│   ├── PinPad.module.css
│   ├── MontoInput.jsx       # Input de cantidades con montos rápidos
│   ├── MontoInput.module.css
│   ├── Comprobante.jsx      # Recibo de transacción exitosa
│   └── Comprobante.module.css
│
├── pages/
│   ├── Login.jsx            # Ingreso de cuenta + PIN
│   ├── Login.module.css
│   ├── Menu.jsx             # Menú principal de opciones
│   ├── Menu.module.css
│   ├── Saldo.jsx            # Consulta de saldo
│   ├── Saldo.module.css
│   ├── Retiro.jsx           # Retiro de efectivo
│   ├── Deposito.jsx         # Depósito
│   ├── Transferencia.jsx    # Transferencia entre cuentas
│   ├── Historial.jsx        # Historial paginado de movimientos
│   ├── CambiarPin.jsx       # Cambio de PIN (3 pasos)
│   └── OperacionPage.module.css   # Estilos compartidos de operaciones
│
├── services/
│   └── cajeroApi.js         # Toda la capa HTTP (axios) con documentación
│
├── context/
│   └── AuthContext.jsx      # Estado global de sesión (user, cuenta)
│
├── App.jsx                  # Router + guards de autenticación
├── main.jsx
└── index.css                # Variables CSS + estilos globales
```

---

## 🔌 API Spring Boot esperada

La URL base se configura con el proxy de Vite → `http://localhost:8080`.

| Método | Ruta                              | Body / Params                               | Respuesta                                              |
|--------|-----------------------------------|---------------------------------------------|--------------------------------------------------------|
| POST   | `/api/auth/login`                 | `{ numeroCuenta, pin }`                     | `{ token, cuentaId, numeroCuenta, titular }`           |
| POST   | `/api/auth/logout`                | —                                           | —                                                      |
| PUT    | `/api/auth/cambiar-pin`           | `{ pinActual, pinNuevo }`                   | `{ mensaje }`                                          |
| GET    | `/api/cuenta/saldo`               | —                                           | `{ saldo, numeroCuenta, titular, tipo }`               |
| GET    | `/api/cuenta/info`                | —                                           | datos completos de la cuenta                           |
| POST   | `/api/transacciones/retiro`       | `{ monto }`                                 | `{ saldoAnterior, saldoActual, monto, fecha, comprobante }` |
| POST   | `/api/transacciones/deposito`     | `{ monto }`                                 | `{ saldoAnterior, saldoActual, monto, fecha, comprobante }` |
| POST   | `/api/transacciones/transferencia`| `{ cuentaDestino, monto, descripcion }`     | `{ ..., destinatario }`                                |
| GET    | `/api/transacciones/historial`    | `?pagina=0&tamanio=10`                      | `{ content: [...], totalElements, totalPages }`        |

### Autenticación
Todas las rutas privadas envían el header:
```
Authorization: Bearer <token>
```
El token se almacena en `sessionStorage` bajo la clave `atm_token`.

### Errores esperados de la API
```json
{ "mensaje": "Saldo insuficiente" }
```
o
```json
{ "message": "PIN incorrecto" }
```
El interceptor de axios extrae el mensaje y lo muestra al usuario.

---

## 🔒 Autenticación y rutas protegidas

- `AuthContext` guarda el usuario en memoria (sin localStorage).
- `PrivateRoute` redirige a `/` si no hay sesión activa.
- Al hacer logout se borra el token del `sessionStorage` y se limpia el contexto.

---

## 🎨 Design System

Variables CSS en `src/index.css`:

| Variable         | Uso                    |
|------------------|------------------------|
| `--accent`       | Azul cian (`#00d4ff`)  |
| `--success`      | Verde (`#00e676`)      |
| `--danger`       | Rojo (`#ff3d57`)       |
| `--warning`      | Ámbar (`#ffab00`)      |
| `--font-mono`    | Share Tech Mono        |
| `--font-display` | Rajdhani               |

---

## 📦 Dependencias

| Paquete            | Versión | Uso                       |
|--------------------|---------|---------------------------|
| `react`            | 18      | UI                        |
| `react-dom`        | 18      | Renderizado                |
| `react-router-dom` | 6       | Navegación SPA             |
| `axios`            | 1.7     | HTTP + interceptors        |
| `vite`             | 6       | Dev server + build         |

---

## ✅ Cuando tengas el backend listo

1. Asegúrate de que Spring Boot corra en `http://localhost:8080`
2. Habilita CORS para `http://localhost:5173`:
   ```java
   @CrossOrigin(origins = "http://localhost:5173")
   ```
   O configura un `CorsConfigurationSource` global.
3. Ajusta los nombres de campos en `cajeroApi.js` si difieren del esquema de tu entidad.
