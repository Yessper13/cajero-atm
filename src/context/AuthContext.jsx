import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // { cuentaId, numeroCuenta, titular, token }
  const [cuenta, setCuenta] = useState(null)   // datos completos de la cuenta

  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setCuenta(null)
  }, [])

  const actualizarCuenta = useCallback((data) => {
    setCuenta(data)
  }, [])

  return (
    <AuthContext.Provider value={{ user, cuenta, login, logout, actualizarCuenta }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
