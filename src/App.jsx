import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ATMFrame from './components/ATMFrame'

import Login          from './pages/Login'
import Registro       from './pages/Registro'
import VerificarCorreo from './pages/VerificarCorreo'
import Menu           from './pages/Menu'
import Saldo          from './pages/Saldo'
import Retiro         from './pages/Retiro'
import Deposito       from './pages/Deposito'
import Transferencia  from './pages/Transferencia'
import Historial      from './pages/Historial'
import CambiarPin     from './pages/CambiarPin'

// ── Guard: protege rutas que requieren login ────────────────────────────────
function PrivateRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/" state={{ from: location }} replace />
  return children
}

function AppRoutes() {
  return (
    <ATMFrame>
      <Routes>
        {/* Públicas — acceso sin login */}
        <Route path="/"                 element={<Login />} />
        <Route path="/registro"         element={<Registro />} />
        <Route path="/verificar-correo" element={<VerificarCorreo />} />

        {/* Privadas — requieren sesión activa */}
        <Route path="/menu"          element={<PrivateRoute><Menu /></PrivateRoute>} />
        <Route path="/saldo"         element={<PrivateRoute><Saldo /></PrivateRoute>} />
        <Route path="/retiro"        element={<PrivateRoute><Retiro /></PrivateRoute>} />
        <Route path="/deposito"      element={<PrivateRoute><Deposito /></PrivateRoute>} />
        <Route path="/transferencia" element={<PrivateRoute><Transferencia /></PrivateRoute>} />
        <Route path="/historial"     element={<PrivateRoute><Historial /></PrivateRoute>} />
        <Route path="/cambiar-pin"   element={<PrivateRoute><CambiarPin /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ATMFrame>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
